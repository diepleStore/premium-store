import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/utils/supabase/client';

export async function POST(request: Request) {
  const {
    cartItems,
    paymentMethod,
    returnUrl,
    customer,
    billingAddress,
    shippingAddress,
    note,
  } = await request.json();

  if (
    !cartItems ||
    !paymentMethod ||
    !customer ||
    !billingAddress ||
    !shippingAddress ||
    (paymentMethod === 'vnpay' && !returnUrl)
  ) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!['cod', 'vnpay'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  }

  if (!customer.phone && !customer.email) {
    return NextResponse.json({ error: 'Phone or email is required' }, { status: 400 });
  }

  try {
    // Tính tổng tiền
    const totalPrice = cartItems.reduce(
      (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
      0
    );

    const supabase = createClient()
    // Tạo order trong Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        email: customer.email,
        total_price: totalPrice,
        financial_status: 'pending',
        gateway: paymentMethod,
        customer,
        billing_address: billingAddress,
        shipping_address: shippingAddress,
        note,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Lưu order_items
    const orderItems = cartItems.map((item: { variant_id: string; price: number; quantity: number; title?: string; product_title: string }) => ({
      order_id: order.id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      price: item.price,
      title: item.product_title,
      product_title: item.product_title
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
    if (itemsError) throw itemsError;

    if (paymentMethod === 'cod') {
      // COD: Đồng bộ ngay
      await fetch('https://quqzywmkatvphavviyxi.supabase.co/functions/v1/sync-order-to-haravanr', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
        body: JSON.stringify({ orderId: order.id }),
      });

      return NextResponse.json({ redirectUrl: '/thank-you' });
    } else {
      // VNPay: Tạo URL thanh toán
      const vnpUrl = process.env.VNPAY_URL!;
      const vnpParams: { [key: string]: string } = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
        vnp_Amount: (totalPrice * 100).toString(),
        vnp_CurrCode: 'VND',
        vnp_TxnRef: order.id,
        vnp_OrderInfo: `Thanh toan don hang ${order.id}`,
        vnp_OrderType: 'billpayment',
        vnp_Locale: 'vn',
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: request.headers.get('x-forwarded-for') || '127.0.0.1',
        vnp_CreateDate: new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14),
      };

      const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
      }, {} as { [key: string]: string });

      const signData = new URLSearchParams(sortedParams).toString();
      const vnpSecureHash = createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(signData)
        .digest('hex');
      vnpParams.vnp_SecureHash = vnpSecureHash;

      const paymentUrl = `${vnpUrl}?${new URLSearchParams(vnpParams).toString()}`;

      return NextResponse.json({ paymentUrl });
    }
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
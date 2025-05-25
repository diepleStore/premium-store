'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { getCartItems } from '@/lib/data';
import { useProductStore } from '@/lib/store';
import { CartItem } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';


type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type Address = {
  first_name: string;
  last_name: string;
  address1: string;
  phone: string;
  city: string;
  country: string;
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vnpay'>('cod');
  const [customer, setCustomer] = useState<Customer>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });
  const [billingAddress, setBillingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    address1: '',
    phone: '',
    city: '',
    country: 'Vietnam',
  });
  const [shippingAddress, setShippingAddress] = useState<Address>({
    first_name: '',
    last_name: '',
    address1: '',
    phone: '',
    city: '',
    country: 'Vietnam',
  });
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { sessionId } = useProductStore();

  // Lấy cartItems từ localStorage
  // useEffect(() => {
  //   const storedCart = localStorage.getItem('cart');
  //   if (storedCart) {
  //     setCartItems(JSON.parse(storedCart));
  //   }
  // }, []);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const items = await getCartItems(user?.id, user ? undefined : sessionId);
      setCartItems(items);
      setLoading(false);
    }
    fetchCart();
  }, [sessionId]);

  // Tính tổng tiền
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (
      !customer.first_name ||
      (!customer.phone && !customer.email) ||
      !billingAddress.address1 ||
      !billingAddress.city ||
      !shippingAddress.address1 ||
      !shippingAddress.city ||
      cartItems.length === 0
    ) {
      setError('Vui lòng điền đầy đủ thông tin (họ, số điện thoại hoặc email, địa chỉ) và có ít nhất một sản phẩm.');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('123')

    try {
      const response = await fetch('/api/checkout-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cartItems,
          paymentMethod,
          returnUrl: paymentMethod === 'vnpay' ? `${window.location.origin}/api/vnpay-return` : undefined,
          customer,
          billingAddress,
          shippingAddress,
          note,
        }),
      });
      console.log('3243214', response)

      if (!response.ok) {
        throw new Error('Failed to initiate payment');
      }

      const { paymentUrl, redirectUrl } = await response.json();

      if (paymentMethod === 'vnpay' && paymentUrl) {
        window.location.href = paymentUrl;
      } else if (redirectUrl) {
        router.push(redirectUrl);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Không thể xử lý thanh toán. Vui lòng thử lại.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Thanh toán</h1>
      {error && <p className="text-red-500 mb-4 bg-red-100 p-3 rounded">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cột thông tin khách hàng và thanh toán */}
        <div>
          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Thông tin khách hàng</h2>
            <input
              type="text"
              placeholder="Họ"
              value={customer.first_name}
              onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tên"
              value={customer.last_name}
              onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="email"
              placeholder="Email (không bắt buộc nếu có số điện thoại)"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại (không bắt buộc nếu có email)"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Địa chỉ thanh toán</h2>
            <input
              type="text"
              placeholder="Họ"
              value={billingAddress.first_name}
              onChange={(e) => setBillingAddress({ ...billingAddress, first_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tên"
              value={billingAddress.last_name}
              onChange={(e) => setBillingAddress({ ...billingAddress, last_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={billingAddress.address1}
              onChange={(e) => setBillingAddress({ ...billingAddress, address1: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Thành phố"
              value={billingAddress.city}
              onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={billingAddress.phone}
              onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Địa chỉ giao hàng</h2>
            <input
              type="text"
              placeholder="Họ"
              value={shippingAddress.first_name}
              onChange={(e) => setShippingAddress({ ...shippingAddress, first_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Tên"
              value={shippingAddress.last_name}
              onChange={(e) => setShippingAddress({ ...shippingAddress, last_name: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Địa chỉ"
              value={shippingAddress.address1}
              onChange={(e) => setShippingAddress({ ...shippingAddress, address1: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Thành phố"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="w-full p-2 border rounded-md mb-3 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Ghi chú</h2>
            <textarea
              placeholder="Ghi chú cho đơn hàng"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6 bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>
            <label className="flex items-center mb-3">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="mr-2"
              />
              Thanh toán khi nhận hàng (COD)
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="vnpay"
                checked={paymentMethod === 'vnpay'}
                onChange={() => setPaymentMethod('vnpay')}
                className="mr-2"
              />
              Thanh toán qua VNPay
            </label>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-500 text-white px-4 py-3 rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition"
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </button>
        </div>

        {/* Cột giỏ hàng */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Giỏ hàng</h2>
          {cartItems.length === 0 ? (
            <p className="text-gray-500">Giỏ hàng trống.</p>
          ) : (
            <>
              {cartItems.map((item) => (
                <Card key={item.id}>
                  <CardContent className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{item.product_title}</h2>
                      <p className="text-sm text-gray-500">
                        {item.option1} / {item.option2}
                      </p>
                      <p className="text-sm font-medium">
                        {(item.price / 1000).toFixed(3)} VND x {item.quantity}
                      </p>
                      <p className="text-sm font-medium">
                        Total: {((item.price * item.quantity) / 1000).toFixed(3)} VND
                      </p>
                    </div>
                
                  </CardContent>
                </Card>
              ))}
              <div className="border-t pt-4 mt-4">
                <p className="text-lg font-semibold">
                  Tổng cộng: ₫{totalPrice.toLocaleString('vi-VN')}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
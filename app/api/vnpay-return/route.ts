import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { createClient } from '@/utils/supabase/client';


export async function GET(request: Request) {
    const url = new URL(request.url);
    const vnpParams = Object.fromEntries(url.searchParams);

    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;

    const sortedParams = Object.keys(vnpParams).sort().reduce((acc, key) => {
        acc[key] = vnpParams[key];
        return acc;
    }, {} as { [key: string]: string });

    const signData = new URLSearchParams(sortedParams).toString();
    const checkHash = createHmac('sha512', process.env.VNPAY_HASH_SECRET!)
        .update(signData)
        .digest('hex');

    if (secureHash !== checkHash) {
        return NextResponse.json({ error: 'Invalid checksum' }, { status: 400 });
    }

    const orderId = vnpParams.vnp_TxnRef;
    const responseCode = vnpParams.vnp_ResponseCode;
    const supabase = createClient();
    if (responseCode === '00') {
        const { error } = await supabase
            .from('orders')
            .update({ financial_status: 'paid' })
            .eq('id', orderId);

        if (error) {
            console.error('Update order error:', error);
            return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
        }

        await fetch('https://abcd1234efgh5678ijkl.supabase.co/functions/v1/sync-order', {
            method: 'POST',
            headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
            body: JSON.stringify({ orderId }),
        });

        return NextResponse.redirect(new URL('/thank-you', request.url));
    } else {
        await supabase.from('orders').update({ financial_status: 'cancelled' }).eq('id', orderId);
        return NextResponse.redirect(new URL('/checkout?error=payment_failed', request.url));
    }
}
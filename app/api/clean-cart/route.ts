import { createClientSever } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClientSever();
    const { error } = await supabase.rpc('clean_expired_cart_items');

    if (error) {
      console.error('Clean expired cart items error:', error.message);
      return NextResponse.json({ error: 'Failed to clean expired cart items' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Expired cart items cleaned successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
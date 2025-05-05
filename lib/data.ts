import { createClient } from '@/utils/supabase/client';
import { ProductDetail, ProductVariant, CartItem } from './types';

export async function getProductById(id: string): Promise<ProductDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, title, body_html, vendor, product_type, images, colors, sizes, created_at, updated_at, published_at, options')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.error('getProductById error:', error);
    return null;
  }

  return data as ProductDetail;
}

export async function getVariant(
  productId: string,
  option1: string,
  option2: string
): Promise<ProductVariant | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, product_id, option1, option2, price, inventory_quantity, sku, image_id, created_at, updated_at')
    .eq('product_id', productId)
    .eq('option1', option1)
    .eq('option2', option2)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('getVariant error:', error);
    return null;
  }

  return data as ProductVariant | null;
}

export async function addToCart(
  item: Omit<CartItem, 'id' | 'created_at'>,
  sessionId: string | null
): Promise<CartItem | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cartItem = {
    ...item,
    user_id: user?.id || null,
    session_id: user ? null : sessionId,
  };

  const { data, error } = await supabase
    .from('cart')
    .insert(cartItem)
    .select()
    .single();

  if (error || !data) {
    console.error('Cart insert error:', error);
    return null;
  }

  return data as CartItem;
}

export async function getCartItems(sessionId: string | null): Promise<CartItem[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('cart').select('*, products(title)');

  if (user) {
    query = query.eq('user_id', user.id);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return [];
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Cart fetch error:', error);
    return [];
  }

  return data.map((item) => ({
    ...item,
    product_title: item.products.title,
  })) as CartItem[];
}

export async function removeFromCart(cartItemId: string, sessionId: string | null): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase.from('cart').delete().eq('id', cartItemId);

  if (user) {
    query = query.eq('user_id', user.id);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return false;
  }

  const { error } = await query;

  if (error) {
    console.error('Cart delete error:', error);
    return false;
  }

  return true;
}

export async function mergeCartOnLogin(sessionId: string | null): Promise<boolean> {
  if (!sessionId) return false;

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: guestItems, error: fetchError } = await supabase
    .from('cart')
    .select('*')
    .eq('session_id', sessionId);

  if (fetchError || !guestItems) {
    console.error('Guest cart fetch error:', fetchError);
    return false;
  }

  if (guestItems.length === 0) return true;

  const { error: updateError } = await supabase
    .from('cart')
    .update({ user_id: user.id, session_id: null })
    .eq('session_id', sessionId);

  if (updateError) {
    console.error('Cart merge error:', updateError);
    return false;
  }

  return true;
}
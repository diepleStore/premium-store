import { v4 as uuidv4 } from 'uuid';
import { useProductStore } from '@/lib/store';
import { ProductDetail, ProductVariant, CartItem } from '@/lib/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

export async function getProductById(productId: string): Promise<ProductDetail | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (error || !data) {
    console.error('Error fetching product:', error?.message);
    return null;
  }

  return {
    id: data.id,
    title: data.title,
    body_html: data.body_html,
    vendor: data.vendor,
    product_type: data.product_type,
    images: data.images || [],
    colors: data.colors || [],
    sizes: data.sizes || [],
    created_at: data.created_at,
    updated_at: data.updated_at,
    published_at: data.published_at,
    options: data.options,
  };
}

export async function getVariant(
  productId: string,
  option1: string,
  option2: string
): Promise<ProductVariant | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', productId)
    .eq('option1', option1)
    .eq('option2', option2)
    .single();

  if (error || !data) {
    console.error('Error fetching variant:', error?.message);
    return null;
  }

  return {
    id: data.id,
    product_id: data.product_id,
    option1: data.option1,
    option2: data.option2,
    price: data.price,
    inventory_quantity: data.inventory_quantity,
    reserved_quantity: data.reserved_quantity,
    sku: data.sku,
    image_id: data.image_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function addToCart(
  item: Omit<CartItem, 'id' | 'created_at' | 'expires_at' | 'user_id' | 'session_id'>,
  sessionId: string
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
    console.error('Error adding to cart:', error?.message);
    return null;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    session_id: data.session_id,
    product_id: data.product_id,
    variant_id: data.variant_id,
    option1: data.option1,
    option2: data.option2,
    quantity: data.quantity,
    price: data.price,
    product_title: data.product_title,
    created_at: data.created_at,
    expires_at: data.expires_at,
  };
}

export async function getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
  const supabase = createClient();
  let query = supabase
    .from('cart')
    .select('*')
    .gt('expires_at', new Date().toISOString());

  if (userId) {
    query = query.eq('user_id', userId);
  } else if (sessionId) {
    query = query.eq('session_id', sessionId);
  } else {
    return [];
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error('Error fetching cart items:', error?.message);
    return [];
  }

  return data.map((item) => ({
    id: item.id,
    user_id: item.user_id,
    session_id: item.session_id,
    product_id: item.product_id,
    variant_id: item.variant_id,
    option1: item.option1,
    option2: item.option2,
    quantity: item.quantity,
    price: item.price,
    product_title: item.product_title,
    created_at: item.created_at,
    expires_at: item.expires_at,
  }));
}

export async function removeFromCart(cartItemId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('cart')
    .delete()
    .eq('id', cartItemId);

  if (error) {
    console.error('Error removing from cart:', error.message);
    return false;
  }

  return true;
}

export async function mergeCartOnLogin(userId: string, sessionId: string): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('cart')
    .update({ user_id: userId, session_id: null })
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString());

  if (error) {
    console.error('Error merging cart:', error.message);
    return false;
  }

  useProductStore.getState().setSessionId(uuidv4());
  return true;
}

export async function cleanExpiredCartItems(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.rpc('clean_expired_cart_items');

  if (error) {
    console.error('Error cleaning expired cart items:', error.message);
    return false;
  }

  return true;
}

export interface ProductWithStock extends ProductDetail {
  available_stock: number;
  min_price: number;
}

export interface FilterOptions {
  product_types: string[];
  vendors: string[];
  colors: string[];
  sizes: string[];
}

export async function getProducts(filters: {
  product_type?: string;
  vendor?: string;
  color?: string;
  size?: string;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  limit?: number;
  offset?: number;
}): Promise<{ products: ProductWithStock[]; filterOptions: FilterOptions; total: number }> {
  const supabase = createClient();

  // Count total products for pagination
  let countQuery = supabase.from('products').select('*', { count: 'exact', head: true });

  // Fetch products with pagination
  let productQuery = supabase.from('products').select('*');

  // Apply filters
  if (filters.product_type) {
    productQuery = productQuery.eq('product_type', filters.product_type);
    countQuery = countQuery.eq('product_type', filters.product_type);
  }
  if (filters.vendor) {
    productQuery = productQuery.eq('vendor', filters.vendor);
    countQuery = countQuery.eq('vendor', filters.vendor);
  }
  if (filters.color) {
    productQuery = productQuery.contains('colors', [filters.color]);
    countQuery = countQuery.contains('colors', [filters.color]);
  }
  if (filters.size) {
    productQuery = productQuery.contains('sizes', [filters.size]);
    countQuery = countQuery.contains('sizes', [filters.size]);
  }
  if (filters.search) {
    productQuery = productQuery.ilike('title', `%${filters.search}%`);
    countQuery = countQuery.ilike('title', `%${filters.search}%`);
  }

  // Apply sorting
  if (filters.sort) {
    if (filters.sort === 'name-asc') {
      productQuery = productQuery.order('title', { ascending: true });
    } else if (filters.sort === 'name-desc') {
      productQuery = productQuery.order('title', { ascending: false });
    }
  }

  // Apply pagination
  if (filters.limit && filters.offset !== undefined) {
    productQuery = productQuery.range(filters.offset, filters.offset + filters.limit - 1);
  }

  const { data: productsData, error: productsError } = await productQuery;
  const { count: total, error: countError } = await countQuery;

  if (productsError || !productsData || countError || total === null) {
    console.error('Error fetching products:', productsError?.message || countError?.message);
    return { products: [], filterOptions: { product_types: [], vendors: [], colors: [], sizes: [] }, total: 0 };
  }

  // Fetch variants for stock and price
  const { data: variantsData, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, price, inventory_quantity, reserved_quantity');

  if (variantsError || !variantsData) {
    console.error('Error fetching variants:', variantsError?.message);
    return { products: [], filterOptions: { product_types: [], vendors: [], colors: [], sizes: [] }, total: 0 };
  }

  // Calculate available stock and min price per product
  let productsWithStock: ProductWithStock[] = productsData.map((product) => {
    const variants = variantsData.filter((v) => v.product_id === product.id);
    const available_stock = variants.reduce(
      (sum, v) => sum + (v.inventory_quantity - v.reserved_quantity),
      0
    );
    const min_price = variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

    return {
      ...product,
      images: product.images || [],
      colors: product.colors || [],
      sizes: product.sizes || [],
      available_stock,
      min_price,
    };
  });

  // Apply client-side sorting for price (since price is calculated from variants)
  if (filters.sort === 'price-asc') {
    productsWithStock = productsWithStock.sort((a, b) => a.min_price - b.min_price);
  } else if (filters.sort === 'price-desc') {
    productsWithStock = productsWithStock.sort((a, b) => b.min_price - a.min_price);
  }

  // Get unique filter options (from all products, not just current page)
  const { data: allProductsData } = await supabase.from('products').select('product_type, vendor, colors, sizes');
  const filterOptions: FilterOptions = {
    // @ts-ignore
    product_types: [...new Set(allProductsData?.map((p) => p.product_type).filter(Boolean))] as string[],
    // @ts-ignore
    vendors: [...new Set(allProductsData?.map((p) => p.vendor).filter(Boolean))] as string[],
    // @ts-ignore
    colors: [...new Set(allProductsData?.flatMap((p) => p.colors || []))] as string[],
    // @ts-ignore
    sizes: [...new Set(allProductsData?.flatMap((p) => p.sizes || []))] as string[],
  };

  return { products: productsWithStock, filterOptions, total };
}
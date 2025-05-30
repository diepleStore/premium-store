// @ts-nocheck
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

export async function addToCart(item, user, sessionId) {
  const supabase = createClient();

  // Validate input
  if (!item || !item.variant_id) {
    console.error('addToCart: Invalid item or missing variant_id', { item });
    throw new Error('Invalid item or missing variant_id');
  }

  console.log('addToCart: Attempting to add item with variant_id=', item.variant_id);

  // Verify variant_id exists in product_variants
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('id, product_id, option1, option2, price, inventory_quantity, reserved_quantity')
    .eq('id', item.variant_id)
    .single();

  if (variantError || !variant) {
    console.error('addToCart: Variant not found or error', {
      variant_id: item.variant_id,
      error: variantError?.message,
    });
    throw new Error(`No product variant found for variant_id ${item.variant_id}`);
  }

  // Get authenticated user context
  let authUserId = null;
  try {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.warn('addToCart: Failed to get auth user', { error: authError.message });
    } else {
      authUserId = authData?.user?.id || null;
    }
  } catch (error) {
    console.warn('addToCart: Error fetching auth user', { error: error.message });
  }

  console.log('addToCart: Auth user context', { authUserId, providedUserId: user?.id });

  // Ensure session_id is a valid string for anonymous users
  const validSessionId = sessionId && typeof sessionId === 'string' ? sessionId : uuidv4();

  // Check for existing cart item
  const identifier = authUserId ? { user_id: authUserId } : { session_id: validSessionId };
  const { data: existingItem, error: existingError } = await supabase
    .from('cart')
    .select('id, quantity')
    .eq('variant_id', item.variant_id)
    .match(identifier)
    .single();

  if (existingError && existingError.code !== 'PGRST116') {
    // PGRST116: No rows found, which is expected if no existing item
    console.error('addToCart: Error checking existing cart item', {
      variant_id: item.variant_id,
      error: existingError.message,
    });
    throw new Error(`Failed to check cart: ${existingError.message}`);
  }

  // Validate stock
  const existingQuantity = existingItem?.quantity || 0;
  const totalQuantity = existingQuantity + item.quantity;
  const availableStock = variant.inventory_quantity - variant.reserved_quantity;

  if (totalQuantity > availableStock) {
    console.error('addToCart: Insufficient stock', {
      variant_id: item.variant_id,
      requested: totalQuantity,
      available: availableStock,
    });
    throw new Error('Insufficient stock for this variant');
  }

  let result;
  if (existingItem) {
    // Update existing cart item
    console.log('addToCart: Updating existing cart item', {
      cart_id: existingItem.id,
      variant_id: item.variant_id,
      new_quantity: totalQuantity,
    });

    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: totalQuantity, updated_at: new Date().toISOString() })
      .eq('id', existingItem.id)
      .select()
      .single();

    if (error) {
      console.error('addToCart: Failed to update cart item', {
        cart_id: existingItem.id,
        variant_id: item.variant_id,
        error: error.message,
      });
      throw new Error(`Failed to update cart: ${error.message}`);
    }

    result = data;
  } else {
    // Insert new cart item
    const cartItem = {
      ...item,
      user_id: authUserId || null,
      session_id: authUserId ? null : validSessionId,
      created_at: new Date().toISOString(),
    };

    console.log('addToCart: Adding new cart item', {
      variant_id: cartItem.variant_id,
      product_id: cartItem.product_id,
      option1: cartItem.option1,
      option2: cartItem.option2,
      quantity: cartItem.quantity,
      price: cartItem.price,
      product_title: cartItem.product_title,
      user_id: cartItem.user_id,
      session_id: cartItem.session_id,
    });

    const { data, error } = await supabase
      .from('cart')
      .insert(cartItem)
      .select()
      .single();

    if (error) {
      console.error('addToCart: Failed to insert cart item', {
        variant_id: cartItem.variant_id,
        error: error.message,
        details: error.details,
        hint: error.hint,
        cartItem,
      });
      throw new Error(`Failed to add to cart: ${error.message}`);
    }

    result = data;
  }

  // Verify reserved_quantity after operation
  const { data: variantAfter, error: variantAfterError } = await supabase
    .from('product_variants')
    .select('id, reserved_quantity')
    .eq('id', item.variant_id)
    .single();

  if (variantAfterError) {
    console.error('addToCart: Failed to verify reserved_quantity', {
      variant_id: item.variant_id,
      error: variantAfterError.message,
    });
  } else {
    console.log('addToCart: Reserved quantity after operation', {
      variant_id: item.variant_id,
      reserved_quantity: variantAfter.reserved_quantity,
    });
  }

  console.log('addToCart: Successfully processed cart item', { result });

  return result;
}
export async function updateCartItemQuantity(
  cartItemId: string,
  newQuantity: number
): Promise<CartItem | null> {
  const supabase = createClient();

  // Fetch cart item
  const { data: cartItem, error: cartError } = await supabase
    .from('cart')
    .select('variant_id, quantity')
    .eq('id', cartItemId)
    .single();

  if (cartError || !cartItem) {
    console.error('Error fetching cart item:', cartError?.message);
    return null;
  }

  // Validate stock
  const { data: variant, error: variantError } = await supabase
    .from('product_variants')
    .select('inventory_quantity, reserved_quantity')
    .eq('id', cartItem.variant_id)
    .single();

  if (variantError || !variant) {
    console.error('Error fetching variant:', variantError?.message);
    return null;
  }

  const availableStock = variant.inventory_quantity - variant.reserved_quantity + cartItem.quantity;
  if (newQuantity > availableStock) {
    console.error(`Insufficient stock for variant ${cartItem.variant_id}: requested ${newQuantity}, available ${availableStock}`);
    return null;
  }

  try {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0
      const { error: deleteError } = await supabase
        .from('cart')
        .delete()
        .eq('id', cartItemId);

      if (deleteError) {
        console.error('Error deleting cart item:', deleteError.message);
        throw new Error(`Error deleting cart item: ${deleteError.message}`);
      }

      console.log('Deleted cart item:', cartItemId);
      return null;
    }

    // Update cart item quantity
    const { data, error } = await supabase
      .from('cart')
      .update({ quantity: newQuantity })
      .eq('id', cartItemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error.message);
      throw new Error(`Error updating cart item: ${error.message}`);
    }

    console.log('Updated cart item quantity:', data);
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
  } catch (error: any) {
    console.error('Error in updateCartItemQuantity:', error.message);
    return null;
  }
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

  try {
    const { error } = await supabase
      .from('cart')
      .delete()
      .eq('id', cartItemId);

    if (error) {
      console.error('Error removing from cart:', error.message);
      throw new Error(`Error removing from cart: ${error.message}`);
    }

    console.log('Removed cart item:', cartItemId);
    return true;
  } catch (error: any) {
    console.error('Error in removeFromCart:', error.message);
    return false;
  }
}

export async function mergeCartOnLogin(userId: string, sessionId: string): Promise<boolean> {
  const supabase = createClient();

  // Fetch guest cart items
  const { data: guestItems, error: guestError } = await supabase
    .from('cart')
    .select('*')
    .eq('session_id', sessionId)
    .gt('expires_at', new Date().toISOString());

  if (guestError) {
    console.error('Error fetching guest cart:', guestError.message);
    return false;
  }

  // Fetch user cart items
  const { data: userItems, error: userError } = await supabase
    .from('cart')
    .select('*')
    .eq('user_id', userId)
    .gt('expires_at', new Date().toISOString());

  if (userError) {
    console.error('Error fetching user cart:', userError.message);
    return false;
  }

  // Merge logic: update quantities or insert
  for (const guestItem of guestItems) {
    const existingUserItem = userItems.find((item) => item.variant_id === guestItem.variant_id);

    try {
      if (existingUserItem) {
        // Update existing user item quantity
        const newQuantity = existingUserItem.quantity + guestItem.quantity;

        // Validate stock
        const { data: variant, error: variantError } = await supabase
          .from('product_variants')
          .select('inventory_quantity, reserved_quantity')
          .eq('id', guestItem.variant_id)
          .single();

        if (variantError || !variant) {
          console.error('Error fetching variant for merge:', variantError?.message);
          continue;
        }

        const availableStock = variant.inventory_quantity - variant.reserved_quantity + existingUserItem.quantity;
        if (newQuantity > availableStock) {
          console.error(`Insufficient stock for variant ${guestItem.variant_id}: requested ${newQuantity}, available ${availableStock}`);
          continue;
        }

        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: newQuantity })
          .eq('id', existingUserItem.id);

        if (updateError) {
          console.error('Error updating user cart item:', updateError.message);
          throw new Error(`Error updating user cart item: ${updateError.message}`);
        }
      } else {
        // Insert guest item as user item
        const { error: insertError } = await supabase
          .from('cart')
          .update({ user_id: userId, session_id: null })
          .eq('id', guestItem.id);

        if (insertError) {
          console.error('Error merging cart item:', insertError.message);
          throw new Error(`Error merging cart item: ${insertError.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error merging cart item:', error.message);
      continue;
    }
  }

  useProductStore.getState().setSessionId(uuidv4());
  console.log('Merged cart for user:', userId);
  return true;
}

export async function cleanExpiredCartItems(supabase: SupabaseClient): Promise<boolean> {
  const { error } = await supabase.rpc('clean_expired_cart_items');

  if (error) {
    console.error(' JAR FILE Error cleaning expired cart items:', error.message);
    return false;
  }

  console.log('Cleaned expired cart items');
  return true;
}

export interface ProductWithStock extends ProductDetail {
  available_stock: number;
  min_price: number;
  handle?: string // Optional handle for product URL
  tags?: string; // Optional tags for product filtering
}

export interface FilterOptions {
  product_types: string[];
  vendors: string[];
  colors: string[];
  sizes: string[];
  smart_collections: any[]; // Array of objects with handle and title
}

export async function getProducts(filters: {
  product_type?: string[];
  vendor?: string[];
  color?: string[];
  size?: string[];
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  smart_collection_handle?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}): Promise<{ products: ProductWithStock[]; filterOptions: FilterOptions; total: number }> {
  const supabase = createClient();

  // Lấy smart collections theo tag (body_html)
  let smartCollectionHandles: string[] = [];
  if (filters.tag) {
    const { data: smartCollections } = await supabase
      .from('smart_collection')
      .select('handle')
      .eq('body_html', filters.tag);
    smartCollectionHandles = smartCollections?.map((sc) => sc.handle) || [];
  }

  // Lấy product types theo smart_collection_handle hoặc tag
  let productTypes: string[] = [];
  if (filters.smart_collection_handle) {
    const { data: productTypeData } = await supabase
      .from('product_types')
      .select('name')
      .eq('smart_collection_handle', filters.smart_collection_handle);
    productTypes = productTypeData?.map((pt) => pt.name) || [];
  } else if (filters.tag && smartCollectionHandles.length > 0) {
    const { data: productTypeData } = await supabase
      .from('product_types')
      .select('name')
      .in('smart_collection_handle', smartCollectionHandles);
    productTypes = productTypeData?.map((pt) => pt.name) || [];
  }

  // Count total products
  let countQuery = supabase.from('products').select('*', { count: 'exact', head: true });

  // Fetch products
  let productQuery = supabase
    .from('products')
    .select(`
      id,
      title,
      images,
      product_type,
      vendor,
      colors,
      sizes,
      tags,
      created_at,
      updated_at,
      published_at
    `);

  // Apply filters
  if (filters.tag && smartCollectionHandles.length > 0 && !filters.smart_collection_handle) {
    productQuery = productQuery.in('product_type', productTypes);
    countQuery = countQuery.in('product_type', productTypes);
  } else if (filters.smart_collection_handle && productTypes.length > 0) {
    productQuery = productQuery.in('product_type', productTypes);
    countQuery = countQuery.in('product_type', productTypes);
  }
  if (filters.product_type && filters.product_type.length > 0) {
    productQuery = productQuery.in('product_type', filters.product_type);
    countQuery = countQuery.in('product_type', filters.product_type);
  }
  if (filters.vendor && filters.vendor.length > 0) {
    productQuery = productQuery.in('vendor', filters.vendor);
    countQuery = countQuery.in('vendor', filters.vendor);
  }
  if (filters.color && filters.color.length > 0) {
    productQuery = productQuery.contains('colors', filters.color);
    countQuery = countQuery.contains('colors', filters.color);
  }
  if (filters.size && filters.size.length > 0) {
    productQuery = productQuery.contains('sizes', filters.size);
    countQuery = countQuery.contains('sizes', filters.size);
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
    return { products: [], filterOptions: { product_types: [], vendors: [], colors: [], sizes: [], smart_collections: [] }, total: 0 };
  }

  // Fetch variants for stock and price
  const { data: variantsData, error: variantsError } = await supabase
    .from('product_variants')
    .select('product_id, price, inventory_quantity, reserved_quantity');

  if (variantsError || !variantsData) {
    console.error('Error fetching variants:', variantsError?.message);
    return { products: [], filterOptions: { product_types: [], vendors: [], colors: [], sizes: [], smart_collections: [] }, total: 0 };
  }

  // Calculate available stock and min price
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

  // Apply client-side sorting for price
  if (filters.sort === 'price-asc') {
    productsWithStock = productsWithStock.sort((a, b) => a.min_price - b.min_price);
  } else if (filters.sort === 'price-desc') {
    productsWithStock = productsWithStock.sort((a, b) => b.min_price - a.min_price);
  }

  // Get filter options
  const { data: allProductsData } = await supabase.from('products').select('product_type, colors, sizes');
  const { data: brandsData } = await supabase.from('brands').select('name');
  let smartCollectionsQuery = supabase.from('smart_collection').select('handle, title, body_html');
  if (filters.tag) {
    smartCollectionsQuery = smartCollectionsQuery.eq('body_html', filters.tag);
  }
  const { data: smartCollections } = await smartCollectionsQuery;

  // Lọc product types theo smart_collection_handle hoặc tag
  let filteredProductTypes = allProductsData?.map((p) => p.product_type).filter(Boolean) || [];
  if (filters.smart_collection_handle) {
    filteredProductTypes = filteredProductTypes.filter((pt) =>
      productTypes.includes(pt)
    );
  } else if (filters.tag) {
    filteredProductTypes = filteredProductTypes.filter((pt) =>
      productTypes.includes(pt)
    );
  }
  const filterOptions: FilterOptions = {
    product_types: [...new Set(filteredProductTypes)] as string[],
    vendors: [...new Set(brandsData?.map((b) => b.name))] as string[], // Lấy từ bảng brands
    colors: [...new Set(allProductsData?.flatMap((p) => p.colors || []))] as string[],
    sizes: [...new Set(allProductsData?.flatMap((p) => p.sizes || []))] as string[],
    smart_collections: smartCollections?.map((sc) => ({ handle: sc.handle, title: sc.title })) as string[],
  };

  return { products: productsWithStock, filterOptions, total };
}
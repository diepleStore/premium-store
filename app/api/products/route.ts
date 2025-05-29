import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hot = searchParams.get('hot') === 'true';
  const inStock = searchParams.get('in_stock') === 'true';
  const sort = searchParams.get('sort') || 'newest';
  const vendors = searchParams.getAll('vendor');

  try {
    // Lấy danh sách vendors
    const { data: vendorData } = await supabase
      .from('products')
      .select('vendor')
      .not('vendor', 'is', null);

    const uniqueVendors = Array.from(new Set(vendorData?.map((v: any) => v.vendor))).sort();

    // Xây dựng query sản phẩm
    let query = supabase
      .from('products')
      .select(`
        id,
        title,
        handle,
        images,
        product_type,
        vendor,
        colors,
        sizes,
        tags,
        created_at,
        product_variants(
          id,
          option1,
          option2,
          option3,
          price,
          inventory_quantity,
          reserved_quantity
        )
      `);

    // Áp dụng bộ lọc
    if (hot) {
      query = query.ilike('tags', '%Hot%');
    }

    if (inStock) {
      query = query.filter('product_variants.reserved_quantity', 'lt', 'product_variants.inventory_quantity');
    }

    if (vendors.length > 0) {
      query = query.in('vendor', vendors);
    }

    // Áp dụng sắp xếp
    switch (sort) {
      case 'price_high':
        query = query.order('product_variants.price', { ascending: false });
        break;
      case 'price_low':
        query = query.order('product_variants.price', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    const { data: products, error } = await query;

    if (error) throw error;

    const formattedProducts = products.map((item: any) => ({
      id: item.id,
      title: item.title,
      handle: item.handle,
      images: item.images,
      product_type: item.product_type,
      vendor: item.vendor,
      colors: item.colors,
      sizes: item.sizes,
      tags: item.tags ? item.tags.split(',').map((t: string) => t.trim()) : [],
      created_at: item.created_at,
      variants: item.product_variants,
    }));

    return NextResponse.json({
      products: formattedProducts,
      vendors: uniqueVendors,
    });
  } catch (err) {
    console.error('Fetch products error:', err);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
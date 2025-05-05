import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { ProductDetail } from '@/lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const response = await fetch(
      `https://${process.env.HARAVAN_STORE_DOMAIN}/com/products.json`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HARAVAN_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const haravanProducts = data.products;

    // Sync products
    const products: ProductDetail[] = haravanProducts.map((p: any) => ({
      id: p.id.toString(),
      name: p.title,
      price: parseFloat(p.variants[0]?.price || '0'),
      description: p.body_html || 'No description available',
      brand: p.vendor,
      images: p.images.map((img: any) => img.src),
      colors: Array.from(new Set(p.variants.map((v: any) => v.option1).filter(Boolean))),
      sizes: Array.from(new Set(p.variants.map((v: any) => v.option2).filter(Boolean))),
    }));

    const { error: productError } = await supabase.from('products').upsert(products, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    if (productError) {
      throw new Error(`Supabase product upsert error: ${productError.message}`);
    }

    // Sync variants
    const variants = haravanProducts.flatMap((p: any) =>
      p.variants.map((v: any) => ({
        variant_id: v.id.toString(),
        product_id: p.id.toString(),
        color: v.option1,
        size: v.option2,
        price: parseFloat(v.price || '0'),
        inventory_quantity: v.inventory_quantity || 0,
      }))
    );

    const { error: variantError } = await supabase.from('product_variants').upsert(variants, {
      onConflict: 'variant_id',
      ignoreDuplicates: false,
    });

    if (variantError) {
      throw new Error(`Supabase variant upsert error: ${variantError.message}`);
    }

    return NextResponse.json({ message: `Successfully synced ${products.length} products and ${variants.length} variants` });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync products' }, { status: 500 });
  }
}
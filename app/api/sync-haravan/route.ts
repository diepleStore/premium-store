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
      `https://${process.env.HARAVAN_STORE_DOMAIN}/com/products.json?limit=250`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.HARAVAN_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        await new Promise((resolve) => setTimeout(resolve, parseInt(retryAfter || '1000')));
        return POST(request);
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const haravanProducts = data.products;

    const products: ProductDetail[] = haravanProducts.map((p: any) => ({
      id: p.id.toString(),
      title: p.title || 'Unnamed Product',
      body_html: p.body_html || null,
      vendor: p.vendor || null,
      product_type: p.product_type || null,
      images: (p.images || []).map((img: any) => img.src || '').filter(Boolean),
      colors: Array.from(new Set((p.variants || []).map((v: any) => v.option1 || '').filter(Boolean))),
      sizes: Array.from(new Set((p.variants || []).map((v: any) => v.option2 || '').filter(Boolean))),
      created_at: p.created_at || null,
      updated_at: p.updated_at || null,
      published_at: p.published_at || null,
      options: p.options || [],
    }));

    const { error: productError } = await supabase.from('products').upsert(products, {
      onConflict: 'id',
      ignoreDuplicates: false,
    });

    if (productError) {
      throw new Error(`Supabase product upsert error: ${productError.message}`);
    }

    const variants = haravanProducts.flatMap((p: any) =>
      (p.variants || []).map((v: any) => ({
        id: v.id.toString(),
        product_id: p.id.toString(),
        option1: v.option1 || null,
        option2: v.option2 || null,
        price: parseFloat(v.price || '0'),
        inventory_quantity: v.inventory_quantity || 0,
        sku: v.sku || null,
        image_id: v.image_id ? v.image_id.toString() : null,
        created_at: v.created_at || null,
        updated_at: v.updated_at || null,
      }))
    );

    const { error: variantError } = await supabase.from('product_variants').upsert(variants, {
      onConflict: 'id',
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
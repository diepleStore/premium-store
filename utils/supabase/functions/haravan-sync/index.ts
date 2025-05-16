import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const HARAVAN_API_URL = 'https://yourstore.haravan.com/admin/products.json';
const HARAVAN_API_KEY = Deno.env.get('HARAVAN_API_KEY') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_KEY = Deno.env.get('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

serve(async (req: any) => {
  try {
    // Fetch products from Haravan
    const response = await fetch('https://apis.haravan.com/com/products.json', {
      headers: {
        Authorization: `Bearer FBEE90F171F113FFDD6F3BC5B6FDEFE06457B1B3BD3DCA45A3E7DF21B0972BE9`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Haravan API error: ${response.statusText}`);
    }

    const { products } = await response.json();

    // Transform and upsert products
    const productsData = products.map((p: any) => ({
      id: `product_${p.id}`,
      title: p.title,
      body_html: p.body_html,
      images: p.images.map((img: any) => img.src),
      product_type: p.product_type || '',
      vendor: p.vendor || '',
      colors: p.options.find((o: any) => o.name === 'Color')?.values || [],
      sizes: p.options.find((o: any) => o.name === 'Size')?.values || [],
      created_at: p.created_at,
      updated_at: p.updated_at,
      published_at: p.published_at,
    }));

    const { error: productsError } = await supabase
      .from('products')
      .upsert(productsData, { onConflict: 'id' })
      .select();

    if (productsError) {
      throw new Error(`Failed to upsert products: ${productsError.message}`);
    }

    // Transform and upsert variants (exclude reserved_quantity)
    const variantsData = products.flatMap((p: any) =>
      p.variants.map((v: any) => ({
        id: `variant_${v.id}`,
        product_id: `product_${p.id}`,
        option1: v.option1 || '',
        option2: v.option2 || '',
        option3: v.option3 || '',
        price: parseFloat(v.price),
        inventory_quantity: v.inventory_quantity,
        // Omit reserved_quantity to preserve existing value
      }))
    );

    const { error: variantsError } = await supabase
      .from('product_variants')
      .upsert(variantsData, { onConflict: 'id' })
      .select();

    if (variantsError) {
      throw new Error(`Failed to upsert variants: ${variantsError.message}`);
    }

    return new Response(
      JSON.stringify({ message: 'Sync completed', products: productsData.length, variants: variantsData.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ error: error?.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});

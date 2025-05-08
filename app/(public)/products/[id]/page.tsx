'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { getProductById, getVariant, addToCart } from '@/lib/data';
import { useProductStore } from '@/lib/store';
import { ProductDetail, ProductVariant } from '@/lib/types';
import { createClient } from '@/utils/supabase/client';
import { v4 as uuidv4 } from 'uuid';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { sessionId, setCart } = useProductStore();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [variant, setVariant] = useState<ProductVariant | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stockWarning, setStockWarning] = useState<string | null>(null);

  console.log('ProductDetailPage: sessionId=', sessionId);
  console.log('Selected variant_id:', variant?.id);

  // Fetch product and initial variant
  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const productData = await getProductById(id as string);
      if (!productData) {
        console.error('ProductDetailPage: Product not found', { id });
        setError('Product not found');
        setLoading(false);
        return;
      }
      console.log('ProductDetailPage: Fetched product', { id, title: productData.title, colors: productData.colors, sizes: productData.sizes });
      setProduct(productData);

      // Set default variant (first color and size)
      const defaultColor = productData.colors[0] || '';
      const defaultSize = productData.sizes[0] || '';
      setSelectedColor(defaultColor);
      setSelectedSize(defaultSize);

      const variantData = await getVariant(id as string, defaultColor, defaultSize);
      if (!variantData) {
        console.error('ProductDetailPage: Variant not found', { id, defaultColor, defaultSize });
        setError('Variant not found');
      } else {
        console.log('ProductDetailPage: Fetched initial variant', { variantId: variantData.id, option1: defaultColor, option2: defaultSize });
        setVariant({
          ...variantData,
          sku: variantData.sku || null,
          image_id: variantData.image_id || null,
          created_at: variantData.created_at || new Date().toISOString(),
          updated_at: variantData.updated_at || new Date().toISOString(),
        });
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  // Fetch variant when color or size changes
  useEffect(() => {
    async function fetchVariant() {
      if (selectedColor && selectedSize) {
        const variantData = await getVariant(id as string, selectedColor, selectedSize);
        if (!variantData) {
          console.error('ProductDetailPage: Variant not found', { id, selectedColor, selectedSize });
          setError('Variant not found');
        } else {
          console.log('ProductDetailPage: Fetched variant', { variantId: variantData.id, option1: selectedColor, option2: selectedSize });
          setVariant(variantData);
        }
        setQuantity(1); // Reset quantity on variant change
        setStockWarning(null);
      }
    }
    fetchVariant();
  }, [id, selectedColor, selectedSize]);

  // Real-time subscription for variant stock updates
  useEffect(() => {
    const supabase = createClient();
    if (!variant?.id) return;

    const channel = supabase
      .channel('product_variants')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'product_variants', filter: `id=eq.${variant.id}` },
        (payload: any) => {
          console.log('ProductDetailPage: Variant stock updated', { variantId: variant.id, payload });
          setVariant((prev) => (prev ? { ...prev, ...payload.new } : prev));
          if (payload.new.inventory_quantity - payload.new.reserved_quantity < quantity) {
            setStockWarning('Selected quantity exceeds available stock.');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [variant?.id, quantity]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!variant || !product) {
      console.error('ProductDetailPage: Missing product or variant', { product, variant });
      setError('Please select a valid product and variant');
      return;
    }
    if (quantity > (variant.inventory_quantity - variant.reserved_quantity)) {
      console.error('ProductDetailPage: Insufficient stock', { variantId: variant.id, quantity, available: variant.inventory_quantity - variant.reserved_quantity });
      setStockWarning('Selected quantity exceeds available stock.');
      return;
    }

    const cartItem = {
      product_id: product.id,
      variant_id: variant.id,
      option1: selectedColor,
      option2: selectedSize,
      quantity,
      price: variant.price,
      product_title: product.title,
    };

    const supabase = createClient();
    console.log('Supabase schema:', supabase.schema); // Should be 'public'
    const { data: { user } } = await supabase.auth.getUser();

    // Fallback sessionId
    const validSessionId = sessionId && typeof sessionId === 'string' ? sessionId : uuidv4();

    try {
      console.log('ProductDetailPage: Calling addToCart', { cartItem, user, sessionId: validSessionId });
      const addedItem = await addToCart(cartItem, user, validSessionId);
      setCart((prev) => [...prev, addedItem]);
      setStockWarning(null);
      alert('Item added to cart!');
      router.push('/cart');
    } catch (error: any) {
      console.error('ProductDetailPage: Failed to add to cart', { error: error?.message, cartItem });
      setError(`Failed to add item to cart: ${error?.message}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Skeleton className="h-64 w-full" />
              <div>
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-6 w-24 mb-4" />
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-10 w-48" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error || 'Product not found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div>
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-64 object-cover rounded-md"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 rounded-md flex items-center justify-center">
                  No Image
                </div>
              )}
            </div>
            {/* Product Details */}
            <div>
              <p className="text-gray-600 mb-4">{product.body_html || 'No description available'}</p>
              <p className="text-lg font-semibold mb-4">
                {((variant?.price || 0) / 1000).toFixed(3)} VND
              </p>
              {variant && (
                <p className="text-sm text-gray-500 mb-4">
                  Available Stock: {variant.inventory_quantity - variant.reserved_quantity}
                </p>
              )}
              {stockWarning && <p className="text-red-500 mb-4">{stockWarning}</p>}

              {/* Variant Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Color</label>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Size</label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  max={variant ? variant.inventory_quantity - variant.reserved_quantity : 1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-24"
                />
              </div>

              {/* Add to Cart Button */}
              <Button onClick={handleAddToCart} disabled={!variant || quantity < 1}>
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

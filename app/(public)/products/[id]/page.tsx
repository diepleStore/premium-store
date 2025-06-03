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
import ShopeeProductSearch from '@/components/product-detail-page/ShopeeProductSearch';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State cho ảnh được chọn

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
      setProduct(productData);
      setSelectedImage(productData.images[0] || null); // Chọn ảnh đầu tiên mặc định

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
            setStockWarning('Số lượng sản phẩm vượt quá số lượng có sẵn trong kho!');
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
      setStockWarning('Số lượng sản phẩm vượt quá số lượng có sẵn trong kho!');
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
      <div className="container h-full mx-auto px-4 py-10">
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <span className="ml-4 text-gray-700 text-2xl font-['Mont']">Đang tải dữ liệu sản phẩm...</span>
        </div>
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
            <p className="text-red-500">{error || 'Sản phẩm không tồn tại'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const htmlString = product.body_html || '<p>Sản phẩm không tồn tại</p>';

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Images */}
        <div>
          {/* Main Image */}
          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.title}
              className="w-full object-cover rounded-md mb-4 aspect-[576/786] bg-[#D9D9D9]"
            />
          ) : (
            <div className="w-full h-64 md:h-96 bg-[#D9D9D9] rounded-md flex items-center justify-center mb-4">
              No Image
            </div>
          )}
          {/* Thumbnail Images */}
          {product.images?.length > 0 && (
            <div className="flex !overflow-x-scroll gap-[2%] !scroll-auto scroll-m-2">
              {product.images.map((imgLink, index) => (
                <img
                  key={index}
                  src={imgLink}
                  alt={`${product.title} thumbnail ${index}`}
                  className={`w-[23.5%] h-auto object-contain bg-[#f2f1f1] cursor-pointer aspect-square border-t-2 border-transparent ${selectedImage === imgLink ? '!border-black' : ''}`}
                  onClick={() => setSelectedImage(imgLink)}
                />
              ))}
            </div>
          )}
        </div>
        {/* Product Details */}
        <div className="font-['Mont']">
          <p className="text-2xl font-bold mb-2 uppercase font-['Mont']">{product.vendor || 'Unknown'}</p>
          <p className="text-lg font-semibold mb-4 text-black font-['Mont']">
            Brand: {product.title || 'Unknown'}
          </p>
          <div className='border-b-1' />
          <p className="text-lg font-['Mont-semibold'] mb-4 mt-4">
            {((variant?.price || 0) / 1000).toFixed(3)}đ
          </p>
          {/* {variant && (
            <p className="text-base text-gray-800 mb-4">
              Kho: {variant.inventory_quantity - variant.reserved_quantity}
            </p>
          )} */}
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

          <span className='text-lg font-["Mont-semibold"] mb-2'>Chi tiết sản phẩm</span>
          <div dangerouslySetInnerHTML={{ __html: htmlString }} />

          {/* Add to Cart Button */}
          <Button onClick={handleAddToCart} disabled={!variant || quantity < 1} className='uppercase bg-black text-white font-semibold hover:bg-gray-800 transition-colors duration-200 mt-4 px-10 !rounded-none'>
            Thêm giỏ hàng
          </Button>
        </div>
      </div>

      {/* {product?.title?.length > 0 && <ShopeeProductSearch name={product.title} />} */}
    </div>
  );
}
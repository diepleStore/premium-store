'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import ProductImageGallery from '@/components/product-detail-page/ProductImageGallery';
import ProductColorSelector from '@/components/product-detail-page/ProductColorSelector';
import ProductSizeSelector from '@/components/product-detail-page/ProductSizeSelector';
import ProductQuantitySelector from '@/components/product-detail-page/ProductQuantitySelector';
import { getProductById, getVariant, addToCart } from '@/lib/data';
import { ProductDetail, ProductVariant } from '@/lib/types';
import { useProductStore } from '@/lib/store';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const [selectedOption1, setSelectedOption1] = useState<string | null>(null);
  const [selectedOption2, setSelectedOption2] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const { addToCart: addToStoreCart, sessionId } = useProductStore();

  // Fetch product
  const { data: product, isLoading: productLoading, error: productError } = useQuery({
    queryKey: ['product', params.id],
    queryFn: () => getProductById(params.id),
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  // Set initial color/size when product loads
  useEffect(() => {
    if (product && product.colors.length > 0 && !selectedOption1) {
      setSelectedOption1(product.colors[0]);
    }
    if (product && product.sizes.length > 0 && !selectedOption2) {
      setSelectedOption2(product.sizes[0]);
    }
  }, [product]);

  // Fetch variant
  const { data: variant, isLoading: variantLoading, error: variantError } = useQuery({
    queryKey: ['variant', product?.id, selectedOption1, selectedOption2],
    queryFn: () =>
      product && selectedOption1 && selectedOption2
        ? getVariant(product.id, selectedOption1, selectedOption2)
        : Promise.resolve(null),
    enabled: !!product && !!selectedOption1 && !!selectedOption2,
    staleTime: 30000, // 30 seconds
    retry: 2,
  });

  const handleAddToCart = async () => {
    if (!variant || !product) {
      alert('Please select a valid variant');
      return;
    }

    const cartItem = {
      product_id: product.id,
      variant_id: variant.id,
      option1: selectedOption1!,
      option2: selectedOption2!,
      quantity: selectedQuantity,
      price: variant.price,
      product_title: product.title,
    };

    const result = await addToCart(cartItem, sessionId);
    if (result) {
      addToStoreCart(result);
      alert('Added to cart!');
    } else {
      alert('Failed to add to cart. Please try again.');
    }
  };

  if (productLoading || variantLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/2">
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
          <div className="md:w-1/2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-10 w-48 mb-4" />
                <Skeleton className="h-10 w-32 mb-4" />
                <Skeleton className="h-12 w-40" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-semibold text-red-600">Product Not Found</h2>
        <p className="text-gray-600">The product you’re looking for doesn’t exist or is unavailable.</p>
        <Button asChild className="mt-4">
          <a href="/products">Back to Products</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <ProductImageGallery images={product.images} />
        </div>
        <div className="md:w-1/2">
          <Card>
            <CardContent className="p-6">
              <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl text-gray-800 mb-4">
                {variant ? (variant.price / 1000).toFixed(3) : 'N/A'} VND
              </p>
              <p className="text-gray-600 mb-4">{product.vendor}</p>
              <div
                className="text-gray-700 mb-6"
                dangerouslySetInnerHTML={{ __html: product.body_html || '' }}
              />
              {variantError && <p className="text-red-500 mb-4">Variant not available</p>}
              <ProductColorSelector
                colors={product.colors}
                selectedOption1={selectedOption1}
                setSelectedOption1={setSelectedOption1}
              />
              <ProductSizeSelector
                sizes={product.sizes}
                selectedOption2={selectedOption2}
                setSelectedOption2={setSelectedOption2}
              />
              <ProductQuantitySelector
                selectedQuantity={selectedQuantity}
                setSelectedQuantity={setSelectedQuantity}
                maxQuantity={variant?.inventory_quantity || 0}
              />
              <Button
                className="w-full md:w-auto"
                onClick={handleAddToCart}
                disabled={!variant || variant.inventory_quantity <= 0}
              >
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
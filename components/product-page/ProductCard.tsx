'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Product } from '@/lib/types';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product.id}`}>
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-0">
          <div key={product.id} className="group relative">
            <div className="w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 aspect-[1/1]">
              <img alt={product.name} src={'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg'} className="size-full object-cover" />
            </div>
            <div className='px-4 pb-2'>
              <h3 className="mt-4 text-base text-gray-700">
                  <span className="absolute inset-0" />
                  {product.name}
              </h3>
              <p className="mt-1 text-base text-gray-500">{product.brand}</p>
              <p className="mt-1 text-base font-medium text-gray-900">{product.price}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
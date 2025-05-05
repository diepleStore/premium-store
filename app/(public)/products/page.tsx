'use client';

import { useEffect, useState } from 'react';
import { useProductStore } from '@/lib/store';
import { Product } from '@/lib/types';
import FilterSidebar from '@/components/product-page/FilterSidebar';
import ProductCard from '@/components/product-page/ProductCard';

// Placeholder product data (replace with Supabase query)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Running Shoes',
    price: 99.99,
    image: '/assets/product1.jpg',
    brand: 'Nike',
    colors: ['Red', 'Black'],
    sizes: ['M', 'L'],
  },
  {
    id: '2',
    name: 'Casual Jacket',
    price: 149.99,
    image: '/assets/product2.jpg',
    brand: 'Adidas',
    colors: ['Blue', 'Green'],
    sizes: ['S', 'M'],
  },
  {
    id: '3',
    name: 'Casual Jacket',
    price: 149.99,
    image: '/assets/product2.jpg',
    brand: 'Adidas',
    colors: ['Blue', 'Green'],
    sizes: ['S', 'M'],
  },
  {
    id: '4',
    name: 'Casual Jacket',
    price: 149.99,
    image: '/assets/product2.jpg',
    brand: 'Adidas',
    colors: ['Blue', 'Green'],
    sizes: ['S', 'M'],
  },
  {
    id: '5',
    name: 'Casual Jacket',
    price: 149.99,
    image: '/assets/product2.jpg',
    brand: 'Adidas',
    colors: ['Blue', 'Green'],
    sizes: ['S', 'M'],
  },
  // Add more mock products as needed
];

export default function ProductsPage() {
  const { filters, sort } = useProductStore();
  const [products, setProducts] = useState<Product[]>(mockProducts);

  useEffect(() => {
    // Apply filters and sorting
    let filtered = [...mockProducts];

    // Filter by color
    if (filters.colors.length > 0) {
      filtered = filtered.filter((p) =>
        p.colors.some((color) => filters.colors.includes(color))
      );
    }

    // Filter by size
    if (filters.sizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((size) => filters.sizes.includes(size))
      );
    }

    // Filter by brand
    if (filters.brands.length > 0) {
      filtered = filtered.filter((p) => filters.brands.includes(p.brand));
    }

    // Filter by price
    filtered = filtered.filter(
      (p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Sort
    filtered.sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'name-asc') return a.name.localeCompare(b.name);
      if (sort === 'name-desc') return b.name.localeCompare(a.name);
      return 0;
    });

    setProducts(filtered);
  }, [filters, sort]);

  return (
    <div className="mx-auto px-4 lg:px-8 py-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Danh sách sản phẩm</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <FilterSidebar />
        <div className="flex-1">
          {products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
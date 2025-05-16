'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type ShopeeProduct = {
  name: string;
  price: string;
  image: string;
  shop: string;
  link: string;
};

type ShopeeProductSearchProps = {
  name: string;
};

export default function ShopeeProductSearch({ name }: ShopeeProductSearchProps) {
  const [products, setProducts] = useState<ShopeeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name.trim()) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/shopee-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ searchTerm: name }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const { products } = await response.json();
        setProducts(products);
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Không thể tải sản phẩm từ Shopee. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounce = setTimeout(fetchProducts, 500); // Debounce 500ms
    return () => clearTimeout(delayDebounce);
  }, [name]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">Kết quả tìm kiếm Shopee: {name}</h2>

      {loading && <p className="text-gray-500">Đang tải...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && products.length === 0 && name && (
        <p className="text-gray-500">Không tìm thấy sản phẩm nào.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <div
            key={`${product.link}-${index}`}
            className="border rounded-lg p-4 hover:shadow-lg transition"
          >
            <div className="relative w-full h-48 mb-2">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-contain rounded"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>
            <h3 className="text-base font-medium truncate">{product.name}</h3>
            <p className="text-sm text-gray-600">Giá: {product.price === 'N/A' ? 'N/A' : `₫${parseFloat(product.price).toLocaleString('vi-VN')}`}</p>
            <p className="text-sm text-gray-600">Shop: {product.shop}</p>
            <Link
              href={product.link}
              target="_blank"
              className="text-blue-500 hover:underline text-sm"
            >
              Xem trên Shopee
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
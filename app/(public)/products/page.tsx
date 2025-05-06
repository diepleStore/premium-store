'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { debounce } from 'lodash';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts, ProductWithStock, FilterOptions } from '@/lib/data';
import { createClient } from '@/utils/supabase/client';

const PRODUCTS_PER_PAGE = 9;

export default function ProductListPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    product_types: [],
    vendors: [],
    colors: [],
    sizes: [],
  });
  const [filters, setFilters] = useState<{
    product_type?: string;
    vendor?: string;
    color?: string;
    size?: string;
    search?: string;
    sort?: 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';
  }>({});
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch products and filter options
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { products: fetchedProducts, filterOptions: fetchedOptions, total: fetchedTotal } = await getProducts({
        ...filters,
        limit: PRODUCTS_PER_PAGE,
        offset: page * PRODUCTS_PER_PAGE,
      });
      setProducts(fetchedProducts);
      setFilterOptions(fetchedOptions);
      setTotal(fetchedTotal);
      setLoading(false);
    }
    fetchProducts();
  }, [filters, page]);

  // Real-time subscription for variant stock updates
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('product_variants')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'product_variants' },
        async () => {
          // Refetch products to update stock
          const { products: updatedProducts, total: updatedTotal } = await getProducts({
            ...filters,
            limit: PRODUCTS_PER_PAGE,
            offset: page * PRODUCTS_PER_PAGE,
          });
          setProducts(updatedProducts);
          setTotal(updatedTotal);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, page]);

  // Debounced filter change handler
  const debouncedFilterChange = useMemo(
    () =>
      debounce((key: keyof typeof filters, value: string) => {
        setFilters((prev) => ({
          ...prev,
          [key]: value === 'all' ? undefined : value,
        }));
        setPage(0); // Reset to first page on filter change
      }, 300),
    []
  );

  // Debounced search handler
  const debouncedSearchChange = useMemo(
    () =>
      debounce((value: string) => {
        setFilters((prev) => ({
          ...prev,
          search: value || undefined,
        }));
        setPage(0);
      }, 300),
    []
  );

  // Reset filters
  const resetFilters = () => {
    setFilters({});
    setPage(0);
  };

  // Pagination controls
  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);
  const handlePrevPage = () => setPage((prev) => Math.max(prev - 1, 0));
  const handleNextPage = () => setPage((prev) => Math.min(prev + 1, totalPages - 1));

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array(PRODUCTS_PER_PAGE).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Products ({total} items)</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Search</label>
                <Input
                  placeholder="Search products..."
                  onChange={(e) => debouncedSearchChange(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Product Type</label>
                <Select
                  value={filters.product_type || 'all'}
                  onValueChange={(value) => debouncedFilterChange('product_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.product_types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vendor</label>
                <Select
                  value={filters.vendor || 'all'}
                  onValueChange={(value) => debouncedFilterChange('vendor', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.vendors.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color</label>
                <Select
                  value={filters.color || 'all'}
                  onValueChange={(value) => debouncedFilterChange('color', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <Select
                  value={filters.size || 'all'}
                  onValueChange={(value) => debouncedFilterChange('size', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {filterOptions.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sort By</label>
                <Select
                  value={filters.sort || 'all'}
                  onValueChange={(value) =>
                    debouncedFilterChange('sort', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Default</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="name-asc">Name: A-Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={resetFilters}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Product Grid */}
        <div className="col-span-1 md:col-span-3">
          {products.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-gray-500">No products found matching your filters.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id}>
                    <CardContent className="pt-6">
                      {product.images[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-full h-32 object-cover rounded-md mb-4"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-200 rounded-md flex items-center justify-center mb-4">
                          No Image
                        </div>
                      )}
                      <h2 className="text-lg font-semibold">{product.title}</h2>
                      <p className="text-sm text-gray-500">{product.vendor}</p>
                      <p className="text-sm font-medium mt-2">
                        From {(product.min_price / 1000).toFixed(3)} VND
                      </p>
                      <p className="text-sm text-gray-500">
                        Available Stock: {product.available_stock}
                      </p>
                      <Link href={`/products/${product.id}`}>
                        <Button className="mt-4 w-full">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={handlePrevPage}
                  disabled={page === 0}
                  variant="outline"
                >
                  Previous
                </Button>
                <span>
                  Page {page + 1} of {totalPages}
                </span>
                <Button
                  onClick={handleNextPage}
                  disabled={page >= totalPages - 1}
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts, ProductWithStock, FilterOptions } from '@/lib/data';
import { Checkbox } from '@/components/ui/checkbox';

// Hàm debounce tùy chỉnh
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    product_types: [],
    vendors: [],
    colors: [],
    sizes: [],
    smart_collections: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    hot: false,
    inStock: false,
    sort: 'newest',
    selectedVendors: [] as string[],
    selectedColors: [] as string[],
    selectedSizes: [] as string[],
    selectedProductTypes: [] as string[],
    selectedSmartCollection: '' as string,
    search: '',
    limit: 20,
    offset: 0,
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { products, filterOptions, total } = await getProducts({
        product_type: filters.selectedProductTypes.length > 0 ? filters.selectedProductTypes : undefined,
        vendor: filters.selectedVendors.length > 0 ? filters.selectedVendors : undefined,
        color: filters.selectedColors.length > 0 ? filters.selectedColors : undefined,
        size: filters.selectedSizes.length > 0 ? filters.selectedSizes : undefined,
        search: filters.search || undefined,
        sort: filters.sort === 'price_high' ? 'price-desc' :
          filters.sort === 'price_low' ? 'price-asc' :
            filters.sort === 'newest' ? 'name-desc' : undefined,
        smart_collection_handle: filters.selectedSmartCollection || undefined,
        limit: filters.limit,
        offset: filters.offset,
      });

      let filteredProducts = products;
      if (filters.hot) {
        filteredProducts = filteredProducts.filter((p) => p.tags?.toLowerCase().includes('hot'));
      }
      if (filters.inStock) {
        filteredProducts = filteredProducts.filter((p) => p.available_stock > 0);
      }

      setProducts((prev) => (filters.offset === 0 ? filteredProducts : [...prev, ...filteredProducts]));
      setFilterOptions(filterOptions);
      setTotal(total);
    } catch (err) {
      setError('Không thể tải sản phẩm.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((searchValue: string) => {
      setFilters((prev) => ({
        ...prev,
        search: searchValue,
        offset: 0,
      }));
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0,
      ...(key === 'selectedSmartCollection' ? { selectedProductTypes: [] } : {}), // Reset product types khi chọn collection
    }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  return (
    <div className="p-4">

      {/* Div cuộn ngang cho Smart Collections */}
      <div className='min-h-[120px] md:ml-[25%] xl:ml-[20%] flex flex-col item-start justify-start '>
        <div className='w-full relative flex justify-between items-center'>
          <div className="overflow-x-auto flex gap-2 sm:gap-12  no-scrollbar mb-2 relative pr-[60px] sm:pr-[100px] mr-[50px] sm:mr-[70px]">
            <button
              className={`pl-0 sm:pl-4  px-4 py-2 text-xl whitespace-nowrap transition font-['Mont'] !outline-0 uppercase ${filters.selectedSmartCollection === ''
                ? "font-['Mont-semibold']"
                : 'font-[400] scale-95'
                }`}
              onClick={() => handleFilterChange('selectedSmartCollection', '')}
            >
              Xem tất cả
            </button>
            {filterOptions.smart_collections.map((collection) => (
              <button
                key={collection.handle}
                className={`pl-0 sm:pl-4 px-4 py-2 text-xl whitespace-nowrap transition font-['Mont'] !outline-0 uppercase ${filters.selectedSmartCollection === collection.handle
                  ? "font-['Mont-semibold']"
                  : 'font-[400] scale-95'
                  }`}
                onClick={() => handleFilterChange('selectedSmartCollection', collection.handle)}
              >
                {collection.title}
              </button>
            ))}

          </div>

          <div className='absolute right-0 top-0 z-10'>
            <img
              src={'/assets/icons/right-arrow-cate.svg'}
              alt='DiepLeHouse'
              className='w-[36px] h-[36px] sm:h-[40px] sm:w-[40px]'
            />
          </div>
        </div>

        {/* Div cuộn ngang cho Product Types (chỉ hiển thị nếu không chọn "Xem tất cả") */}
        {filters.selectedSmartCollection && (
          <div className='w-full relative flex justify-between items-center'>
            <div className="mb-4 overflow-x-auto flex gap-2 no-scrollbar pr-[60px] sm:pr-[100px] mr-[50px] sm:mr-[70px] relative">
              {filterOptions.product_types.map((type) => (
                <button
                  key={type}
                  className={`pl-0 sm:pl-4  px-4 py-2 text-base whitespace-nowrap border-0 transition !outline-0 font-['Mont'] uppercase ${filters.selectedProductTypes.includes(type)
                    ? "font-['Mont-semibold']"
                    : "font-[500] scale-99"
                    }`}
                  onClick={() => {
                    const newTypes = filters.selectedProductTypes.includes(type)
                      ? filters.selectedProductTypes.filter((t) => t !== type)
                      : [...filters.selectedProductTypes, type];
                    handleFilterChange('selectedProductTypes', newTypes);
                  }}
                >
                  {type.replace(/^.*_/, '')}
                </button>
              ))}
            </div>
            <div className='absolute right-0 top-0 z-10'>
              <img
                src={'/assets/icons/right-arrow-cate.svg'}
                alt='DiepLeHouse'
                className='w-[36px] h-[36px] sm:h-[40px] sm:w-[40px]'
              />
            </div>
          </div>
        )}
      </div>


      <div className="flex flex-col md:flex-row gap-6">
        {/* Bộ lọc - Desktop */}
        <div className="hidden md:block w-full md:w-1/4 xl:w-1/5">
          <div className="bg-white p-4">
            <div className='bg-[#F0EEE1] flex mb-4 justify-between items-center px-3 py-1 w-[80%] max-w-[150px]'>
              <span className="text-lg font-['Mont'] self-start text-start flex uppercase">Lọc Theo</span>

              <img
                src={'/assets/icons/arrow-down-icon.svg'}
                alt='DiepLeHouse'
                className='w-[14px] h-[14px] sm:h-[14px] sm:w-[14px]'
              />
            </div>



            <div className='bg-[#F0EEE1] flex flex-col justify-start items-start px-3 py-6 pb-3 mb-6'>
              {/* Tìm kiếm */}
              <div className="mb-4 w-full">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  defaultValue=""
                  onChange={handleSearchChange}
                  className="w-full p-2 border placeholder:text-gray-500 placeholder:font-['Mont']"
                />
              </div>
              {/* Deal Hot */}
              <div className="mb-3 mt-1">
                {/* <label className="flex items-center font-['Mont']">
                  <input
                    type="checkbox"
                    checked={filters.hot}
                    onChange={(e) => handleFilterChange('hot', e.target.checked)}
                    className="px-4 mr-2 py-2 text-base border-1 bg-[#D9D9D9] border-[#D9D9D9] rounded-sm data-[state=checked]:bg-[#D9D9D9] data-[state=checked]:border-[#D9D9D9]"
                  />
                  Deal Hot
                </label> */}
                <label className="custom-checkbox font-['Mont']">
                  <input
                    type="checkbox"
                    checked={filters.hot}
                    onChange={(e) => handleFilterChange('hot', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Deal Hot
                </label>
              </div>

              {/* Còn hàng */}
              <div className="mb-0">
                {/* <label className="flex items-center font-['Mont']">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                    className="mr-2"
                  />
                  Sản Phẩm Còn hàng
                </label> */}
                <label className="custom-checkbox font-['Mont']">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Sản Phẩm Còn hàng
                </label>
              </div>
            </div>


            {/* Sắp xếp */}
            <div className="mb-4">
              <div className='bg-[#F0EEE1] flex mb-4 self-start justify-between items-center px-3 py-1 w-[80%] max-w-[150px]'>
                <span className="text-lg font-['Mont'] self-start text-start flex uppercase">Sắp xếp</span>
                <img
                  src={'/assets/icons/arrow-down-icon.svg'}
                  alt='DiepLeHouse'
                  className='w-[14px] h-[14px] sm:h-[14px] sm:w-[14px]'
                />
              </div>
              <div className='flex flex-col'>
                {[
                  { value: 'newest', label: ' Sản Phẩm Mới Nhất' },
                  { value: 'price_high', label: 'Giá (Cao Đến Thấp)' },
                  { value: 'price_low', label: 'Giá (Thấp Đến Cao)' },
                ].map((option) => (
                  <label key={option.value} className="custom-checkbox flex items-center mb-3 font-['Mont']">
                    <input
                      type="radio"
                      name="sort"
                      value={option.value}
                      checked={filters.sort === option.value}
                      onChange={(e) => handleFilterChange('sort', e.target.value)}
                      className="mr-2"
                    />
                    <span className="checkmark"></span>

                    {option.label}
                  </label>
                ))}
              </div>

            </div>

            {/* Thương hiệu */}
            <div className="mb-4">
              <div className='bg-[#F0EEE1] flex mb-4 self-start justify-between items-center px-3 py-1 w-[80%] max-w-[150px]'>
                <span className="text-lg font-['Mont'] self-start text-start flex uppercase">BRAND</span>
                <img
                  src={'/assets/icons/arrow-down-icon.svg'}
                  alt='DiepLeHouse'
                  className='w-[14px] h-[14px] sm:h-[14px] sm:w-[14px]'
                />
              </div>

              <div className='flex flex-col'>
                {filterOptions.vendors.map((vendor) => (
                  <label key={vendor} className="custom-checkbox mb-3 font-['Mont'] uppercase">
                    <input
                      type="checkbox"
                      checked={filters.selectedVendors.includes(vendor)}
                      onChange={(e) => {
                        const newVendors = e.target.checked
                          ? [...filters.selectedVendors, vendor]
                          : filters.selectedVendors.filter((v) => v !== vendor);
                        handleFilterChange('selectedVendors', newVendors);
                      }}
                    />
                    <span className="checkmark"></span>
                    {vendor}
                  </label>
                ))}
              </div>

            </div>

            {/* Màu sắc */}
            {/* <div className="mb-4">
              <h3 className="font-medium mb-2">Màu sắc</h3>
              {filterOptions.colors.map((color) => (
                <label key={color} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={filters.selectedColors.includes(color)}
                    onChange={(e) => {
                      const newColors = e.target.checked
                        ? [...filters.selectedColors, color]
                        : filters.selectedColors.filter((c) => c !== color);
                      handleFilterChange('selectedColors', newColors);
                    }}
                    className="mr-2"
                  />
                  {color}
                </label>
              ))}
            </div> */}

            {/* Kích thước */}
            {/* <div className="mb-4">
              <h3 className="font-medium mb-2">Kích thước</h3>
              {filterOptions.sizes.map((size) => (
                <label key={size} className="flex items-center mb-1">
                  <input
                    type="checkbox"
                    checked={filters.selectedSizes.includes(size)}
                    onChange={(e) => {
                      const newSizes = e.target.checked
                        ? [...filters.selectedSizes, size]
                        : filters.selectedSizes.filter((s) => s !== size);
                      handleFilterChange('selectedSizes', newSizes);
                    }}
                    className="mr-2"
                  />
                  {size}
                </label>
              ))}
            </div> */}
          </div>
        </div>

        {/* Bộ lọc - Mobile */}
        <div className="md:hidden flex gap-2 mb-4">
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => alert('Popup Lọc theo')} // Gắn popup sau
          >
            Lọc theo
          </button>
          <button
            className="bg-gray-200 px-4 py-2 rounded"
            onClick={() => alert('Popup Bộ lọc')} // Gắn popup sau
          >
            Bộ lọc
          </button>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="w-full md:w-3/4">
          {loading && products.length === 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white p-2 rounded-lg shadow">
                  <div className="relative w-full" style={{ paddingBottom: '133.33%' }}>
                    <Skeleton className="h-full w-full rounded" />
                  </div>
                  <Skeleton className="mt-2 h-5 w-4/5" />
                  <Skeleton className="h-4 w-3/5" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="text-gray-500">Không có sản phẩm nào phù hợp.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <Link href={`/products/${product.id}`} key={product.id}>
                  <div className="bg-white hover:cursor-pointer transition">
                    <div className="relative w-full" style={{ paddingBottom: '133.33%' /* 392/294 */ }}>
                      {product.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#D9D9D9] flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg text-center font-medium mt-2 line-clamp-2 font-['Mont-semibold'] h-[56px]">{product.title}</h3>
                    <p className="text-gray-600 text-center text-lg font-['Mont']">
                      {product.min_price.toLocaleString('vi-VN')}₫
                    </p>
                  </div>
                </Link>
              ))}
              {loading && products.length > 0 && (
                <>
                  {[...Array(4)].map((_, index) => (
                    <div key={`skeleton-${index}`} className="bg-white p-2 rounded-lg shadow">
                      <div className="relative w-full" style={{ paddingBottom: '133.33%' }}>
                        <Skeleton className="h-full w-full rounded" />
                      </div>
                      <Skeleton className="mt-2 h-5 w-4/5" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
          {products.length < total && !loading && (
            <div className="text-center mt-6">
              <button
                onClick={handleLoadMore}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Tải thêm
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-checkbox {
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          font-size: 16px;
        }

        .custom-checkbox input {
          display: none;
        }

        .custom-checkbox .checkmark {
          width: 20px;
          height: 20px;
          border: 0px solid #999;
          border-radius: 0px;
          background-color: #D9D9D9;
          margin-right: 8px;
          position: relative;
          transition: all 0.2s;
        }

        .custom-checkbox input:checked + .checkmark {
          background-color: #D9D9D9;
          border-color: #D9D9D9;
        }

        .custom-checkbox .checkmark::after {
          content: "";
          position: absolute;
          display: none;
          left: 7px;
          top: 3px;
          width: 6px;
          height: 10px;
          border: solid black;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }

        .custom-checkbox input:checked + .checkmark::after {
          display: block;
        }
      `}</style>
    </div>
  );
}
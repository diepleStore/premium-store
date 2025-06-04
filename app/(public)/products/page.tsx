'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { getProducts, ProductWithStock, FilterOptions } from '@/lib/data';
import './products.css'; // Import CSS styles for products page
import { Dialog, DialogBackdrop, DialogPanel } from '@headlessui/react';

// Hàm debounce tùy chỉnh
const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag') || 'my-pham'; // Lấy tag từ URL, mặc định là 'my-pham'
  const tags = searchParams.get('tags') || ''; // Lấy tags từ query string
  let isSepecialTag = false;

  if (tag && ['diep-le-pass', 'diep-le-collab', 'diep-le-choices', 'dai-su-doc-quyen'].includes(tag)) {
    isSepecialTag = true;
  }
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    product_types: [],
    vendors: [],
    colors: [],
    sizes: [],
    smart_collections: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
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
    tags: tags, // Thêm tags vào filters
    limit: 20,
    offset: 0,
  });
  const [isOpenFilter, setOpenFilter] = useState(false)

  console.log('filters', filters);

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
        tag: tag || undefined, // Truyền tag vào getProducts
        tags: filters.tags || undefined, // Truyền tags
        limit: filters.limit,
        offset: filters.offset,
        hot: filters.hot || undefined, // Truyền filter hot
        inStock: filters.inStock || false, // Truyền filter inStock
      });

      setProducts((prev) => (filters.offset === 0 ? products : [...prev, ...products]));
      filterOptions && setFilterOptions(filterOptions);
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
  }, [filters, tag]); // Thêm tag vào dependencies

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      offset: 0,
      ...(key === 'selectedSmartCollection' ? { selectedProductTypes: [] } : {}), // Reset product types khi chọn collection
    }));
    setFilterOptions((prev) => ({
      ...prev,
      product_types: key === 'selectedSmartCollection' ? [] : prev.product_types, // Reset product types khi chọn collection
    }));
  };

  const handleLoadMore = () => {
    setFilters((prev) => ({
      ...prev,
      offset: prev.offset + prev.limit,
    }));
  };

  if (error) return <p className="text-red-500 text-center p-4">{error}</p>;

  const convertTagToName = (tag: string) => {
    switch (tag) {
      case 'diep-le-pass':
        return 'Diep Le Pass';
      case 'diep-le-collab':
        return 'Diep Le Collab';
      case 'diep-le-choices':
        return 'Diep Le Choices';
      case 'dai-su-doc-quyen':
        return 'Đại Sứ Độc Quyền';
      default:
        return 'Xem tất cả';
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-4">
        {/* Div cuộn ngang cho Smart Collections */}
        <div style={isSepecialTag ? { minHeight: 60 } : {}}  className='min-h-[120px] md:ml-[25%] xl:ml-[20%] flex flex-col item-start justify-start '>
          <div className='w-full relative flex justify-between items-center'>
            <div className="overflow-x-auto flex gap-2 sm:gap-12 no-scrollbar mb-2 relative pr-[60px] sm:pr-[100px] mr-[50px] sm:mr-[70px]">
              <button
                className={`hover:cursor-pointer pl-0 sm:pl-0 px-4 py-2 text-xl whitespace-nowrap transition font-['Mont'] !outline-0 uppercase ${filters.selectedSmartCollection === ''
                  ? "font-['Mont-semibold']"
                  : 'font-[400] scale-95'
                  }`}
                onClick={() => handleFilterChange('selectedSmartCollection', '')}
              >
                {isSepecialTag ? convertTagToName(tag) : 'Xem tất cả'}
              </button>
              {!isSepecialTag && filterOptions.smart_collections.map((collection) => (
                <button
                  key={collection.handle}
                  className={`hover:cursor-pointer pl-0 sm:pl-4 px-4 py-2 text-xl whitespace-nowrap transition font-['Mont'] !outline-0 uppercase ${filters.selectedSmartCollection === collection.handle
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
              {
                loading && !filterOptions.product_types && (
                  <div className="absolute h-[50px] inset-0 flex items-center justify-center bg-[#D9D9D9] z-10 pr-[60px] sm:pr-[100px] mr-[50px] sm:mr-[70px]">
                    <Skeleton translate='yes' className="h-[50px] w-32" />
                  </div>
                )
              }
              <div className="mb-4 overflow-x-auto flex gap-2 no-scrollbar pr-[60px] sm:pr-[100px] mr-[50px] sm:mr-[70px] relative">
                {filterOptions.product_types.map((type, typeIndex) => (
                  <button
                    key={type}
                    className={`hover:cursor-pointer pl-0 sm:pl-4 px-4 py-2 text-base whitespace-nowrap border-0 transition !outline-0 font-['Mont'] uppercase ${filters.selectedProductTypes.includes(type)
                      ? "font-['Mont-semibold']"
                      : "font-[500] scale-99"
                      } ${typeIndex === 0 ? '!pl-1' : ''}`}
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

        <div className="flex flex-col md:flex-row gap-0">
          {/* Bộ lọc - Desktop */}
          <div className="hidden md:block w-full md:w-1/4 xl:w-1/5">
            <div className="bg-white p-4 pt-0">
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
                <div className='flex flex-col max-h-[300px] overflow-y-auto'>
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
            </div>
          </div>

          {/* Bộ lọc - Mobile */}
          <div className="md:hidden flex mb-4 justify-between">
            {/* <div
              className='bg-[#F0EEE1] mb-4 flex justify-between items-center px-3 py-1 w-[80%] max-w-[150px]'
              onClick={() => setOpenFilter(!isOpenFilter)}
            >
              <span className="text-lg font-['Mont'] self-start text-start flex uppercase">Lọc Theo</span>
              <img
                src={'/assets/icons/arrow-down-icon.svg'}
                alt='DiepLeHouse'
                className='w-[14px] h-[14px] sm:h-[14px] sm:w-[14px]'
              />
            </div> */}

            <button
              className="bg-gray-200 px-2 py-2 flex justify-between items-center h-[36px]"
              onClick={() => setOpenFilter(!isOpenFilter)} // Gắn popup sau
            >
              <span className="mr-2 text-base font-['Mont']">Bộ lọc</span>
              <img
                src={'/assets/icons/filter-icon.svg'}
                alt='DiepLeHouse'
                className='w-[22px] h-[22px] sm:h-[22px] sm:w-[22px]'
              />
            </button>
          </div>


          <Dialog open={isOpenFilter} onClose={setOpenFilter} className="relative z-40">
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-black/25 transition-opacity duration-300 ease-linear data-closed:opacity-0"
            />

            <div className="fixed inset-0 z-40 flex">
              <DialogPanel
                transition
                className="relative flex w-full max-w-xs transform flex-col overflow-y-auto bg-white pb-12 shadow-xl transition duration-300 ease-in-out data-closed:-translate-x-full"
              >
                <div className='mt-20 ml-0 flex flex-col gap-7' >
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
                      <div className='flex flex-col max-h-[300px] overflow-y-auto'>
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
                  </div>
                </div>


              </DialogPanel>
            </div>
          </Dialog>




          {/* Danh sách sản phẩm */}
          <div className="w-full md:w-3/4">
            {loading && products.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, index) => (
                  <div key={`skeleton-${index}`} className="bg-[#D9D9D9] p-2">
                    <div className="relative w-full" style={{ paddingBottom: '133.33%' }}>
                      <Skeleton translate='yes' className="h-full w-full rounded" />
                    </div>
                    <Skeleton className="mt-5 h-10 w-4/5" />
                    <Skeleton className="h-10 w-3/5" />
                  </div>
                ))}
              </div>
            ) : !loading && products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 font-['Mont']">
                <p className="text-gray-500">Không có sản phẩm nào phù hợp.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {!loading && products.length > 0 && products.map((product) => (
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
                            <span className="text-gray-500">Không có hình ảnh</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg text-center font-medium mt-2 text-black/80 line-clamp-2 font-['Mont-semibold'] h-[50px] sm:h-[56px]">{product.title}</h3>
                      <p className="text-gray-600 text-center text-base sm:text-lg font-['Mont']">
                        {product.min_price.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  </Link>
                ))}
                {loading && products.length > 0 && (
                  <>
                    {[...Array(12)].map((_, index) => (
                      <div key={`skeleton-${index}`} className="bg-[#D9D9D9] p-2">
                        <div className="relative w-full" style={{ paddingBottom: '133.33%' }}>
                          <Skeleton translate='yes' className="h-full w-full rounded" />
                        </div>
                        <Skeleton className="mt-5 h-10 w-4/5" />
                        <Skeleton className="h-10 w-3/5" />
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            {products.length < total && products.length >= 20 && !loading && (
              <div className="text-center mt-6">
                <button
                  onClick={handleLoadMore}
                  className="border-1 hover:cursor-pointer hover:opacity-80 hover:border-1 hover:border-[#D9D9D9]"
                >
                  <img
                    src={'/assets/icons/show-more-button.svg'}
                    alt='DiepLeHouse'
                    className='w-[100px] h-[auto] sm:h-[auto] sm:w-[140px]'
                  />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
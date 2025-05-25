const products = [
  {
    id: 1,
    name: 'BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML',
    color: 'Natural',
    price: '890.000đ',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg',
    imageAlt: 'Hand stitched, orange BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML.',
  },
  {
    id: 2,
    name: 'BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML',
    color: 'Natural',
    price: '890.000đ',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg',
    imageAlt: 'Hand stitched, orange BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML.',
  },
  {
    id: 3,
    name: 'BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML',
    color: 'Natural',
    price: '890.000đ',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg',
    imageAlt: 'Hand stitched, orange BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML.',
  },
  {
    id: 4,
    name: 'BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML',
    color: 'Natural',
    price: '890.000đ',
    href: '#',
    imageSrc: 'https://tailwindcss.com/plus-assets/img/ecommerce-images/home-page-04-trending-product-02.jpg',
    imageAlt: 'Hand stitched, orange BỘ SỮA CHỐNG NẮNG DƯỠNG DA DỊU NHẸ - 60ML.',
  },
  // More products...
]

export default function SaleProduct() {
  return (
    <div className="bg-[#FFFCF7]">
      <div className="px-4 mx-auto max-w-2xl py-8 sm:py-16 lg:max-w-7xl">
        <div className="flex items-center justify-between text-center">
          <span className="text-bold w-full text-center text-lg md:text-3xl lg:text-4xl xl:text-5xl text-black font-bold">
            SẢN PHẨM GIÁ TỐT
          </span>
          {/* <a href="/products" className="hidden text-xl font-medium text-indigo-600 hover:text-indigo-500 md:block">
            Tất cả sản phẩm
            <span aria-hidden="true"> &rarr;</span>
          </a> */}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-4 md:gap-y-10 lg:gap-x-8">
          {products.map((product) => (
            <div key={product.id} className="group relative text-center font-['Mont']">
              <div className="h-56 w-full overflow-hidden bg-[#D9D9D9] group-hover:opacity-75 lg:h-72 xl:h-80">
                {/* <img alt={product.imageAlt} src={product.imageSrc} className="size-full object-cover" /> */}
              </div>
              <p className="mt-4 text-base text-black font-[600] font-['Mont'] text-center line-clamp-2 h-[50px]">
                {product.name} {product.name}
              </p>
              <p className="mt-1 text-base font-['Mont'] text-center text-gray-900">{product.price}</p>
            </div>
          ))}
        </div>

        <div className="w-full flex items-center justify-center mt-8">
          <img
            src={'/assets/icons/show-more-button.svg'}
            alt='DiepLeHouse'
            className='w-[120px] h-[35px] sm:h-[50px] sm:w-[140px]'
          />
        </div>

      </div>
    </div>
  )
}

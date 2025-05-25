import { ImageTrailHero } from "@/components/banner/dieplehouse-banner";
import { SaleBannerHome } from "@/components/banner/sale-banner";
import EmblaCarousel from "@/components/home-page/EmblaCarousel";
import Incentives from "@/components/home-page/incentive";
import SaleProduct from "@/components/home-page/sale-product";
import TalkContent from "@/components/home-page/talk-content";
import TrendingProduct from "@/components/home-page/trending-product";
import { EmblaOptionsType } from 'embla-carousel'

export default async function Home() {
  const OPTIONS: EmblaOptionsType = {
    dragFree: true,
    containScroll: 'keepSnaps',
    watchSlides: false,
    watchResize: false
  }
  const SLIDE_COUNT = 5
  const SLIDES = Array.from(Array(SLIDE_COUNT).keys())


  return (
    <>
      <div className="bg-[#D9D9D9] p-4 flex items-center justify-center text-center">
        <span className="text-bold text-base md:text-3xl lg:text-4xl xl:text-5xl text-black">
          IT’S NOT ABOUT BRAND <span className="font-sans">-</span> IT’S ABOUT STYLE
        </span>
      </div>

      <div className="w-full relative bg-[#272525]">
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>

      <div className="bg-[#FFFFFF] px-2 py-10 sm:py-22  flex flex-col items-center justify-center text-center">
        <span className="text-bold text-lg md:text-3xl lg:text-4xl xl:text-5xl text-black font-bold">
          " TỪ CÔ CHỦ NHỎ ĐẾN ĐẠI SỨ BÁN HÀNG "
        </span>

        <span className="max-w-[1000px] xl:max-w-[1200px] px-4 font-['Mont'] text-base md:text-xl lg:text-2xl xl:text-3xl text-black mt-4">
          Năm 2014, Diệp chỉ là một newbie tập tành khởi nghiệp với những cửa hàng thời trang thanh lý nhỏ xíu. Làm nghề ký gửi, tức là giúp khách chọn lọc và định giá sản phẩm nên ngày qua ngày, Diệp học được cách quan sát, lắng nghe và hiểu rất rõ thói quen tiêu dùng của mọi người.
        </span>
      </div>

      <div className="w-full relative bg-[#FFFCF7]">
        <EmblaCarousel slides={SLIDES} options={OPTIONS} />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-2 py-10 sm:py-22">
        <span className="text-bold text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-black font-bold mb-8 md:mb-18">
          DIỆP LÊ CHOICES
        </span>
        <img
          src={'/assets/icons/show-more-button.svg'}
          alt='DiepLeHouse'
          className='w-[120px] h-[35px] sm:h-[50px] sm:w-[140px]'
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-2 py-10 sm:py-22">
        <span className="text-bold text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-black font-bold mb-8 md:mb-18">
          DIỆP LÊ COLLAB
        </span>
        <img
          src={'/assets/icons/show-more-button.svg'}
          alt='DiepLeHouse'
          className='w-[120px] h-[35px] sm:h-[50px] sm:w-[140px]'
        />
      </div>


      <div className="flex flex-col items-center justify-center text-center px-2 py-10 sm:py-22">
        <span className="text-bold text-3xl md:text-5xl lg:text-6xl xl:text-7xl text-black font-bold mb-8 md:mb-18">
          DIỆP LÊ PASS
        </span>
        <img
          src={'/assets/icons/show-more-button.svg'}
          alt='DiepLeHouse'
          className='w-[120px] h-[35px] sm:h-[50px] sm:w-[140px]'
        />
      </div>
      <SaleProduct />


      {/* <ImageTrailHero />
      <SaleBannerHome />
      <main className="flex-1 mx-auto flex flex-col px-4">
        <TrendingProduct />
        <SaleProduct />

        <div className="border-t border-gray-200 pb-4">
          <Incentives />
        </div>
      </main>
      <TalkContent /> */}
    </>
  );
}

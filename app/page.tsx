import { ImageTrailHero } from "@/components/banner/dieplehouse-banner";
import { SaleBannerHome } from "@/components/banner/sale-banner";
import Incentives from "@/components/home-page/incentive";
import SaleProduct from "@/components/home-page/sale-product";
import TalkContent from "@/components/home-page/talk-content";
import TrendingProduct from "@/components/home-page/trending-product";

export default async function Home() {
  return (
    <>
      <ImageTrailHero />
      <SaleBannerHome />
      <main className="flex-1 mx-auto flex flex-col px-4">
        <TrendingProduct />
        <SaleProduct />

        <div className="border-t border-gray-200 pb-4">
          <Incentives />
        </div>
      </main>
      <TalkContent />
    </>
  );
}

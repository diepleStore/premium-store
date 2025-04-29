import { ImageTrailHero } from "@/components/banner/dieplehouse-banner";
import Hero from "@/components/hero";
import Incentives from "@/components/home-page/incentive";
import TalkContent from "@/components/home-page/talk-content";
import TrendingProduct from "@/components/home-page/trending-product";
import ConnectSupabaseSteps from "@/components/tutorial/connect-supabase-steps";
import SignUpUserSteps from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";

export default async function Home() {
  return (
    <>
      <ImageTrailHero />
      <main className="flex-1 mx-auto flex flex-col max-w-6xl px-4">
        <Incentives />
        <TrendingProduct />
      </main>
      <TalkContent />
    </>
  );
}

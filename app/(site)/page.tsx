import type { Metadata } from "next";
import { Shell } from "@/site/components/layout/shell";
import { site } from "@/site/lib/ctx";
import { pageMeta } from "@/site/lib/meta";
import { HomeBanner } from "./_home/banner";
import { HomeCategories } from "./_home/categories";
import { HomeCta } from "./_home/cta";
import { HomeFaq } from "./_home/faq";
import { HomeHero } from "./_home/hero";
import { HomeIndustries } from "./_home/industries";
import { HomeNewsBlock } from "./_home/news-block";
import { HomePartners } from "./_home/partners";
import { HomeReviews } from "./_home/reviews";

export async function generateMetadata(): Promise<Metadata> {
  const s = await site();
  return pageMeta({
    title: s.settings.title,
    description: s.settings.description,
    keywords: s.settings.keyword,
    path: "/",
    image: s.t("home_tab_1"),
  });
}

export default function Home() {
  return (
    <Shell here={{ home: true }}>
      <HomeHero />
      <HomeCta />
      <HomeCategories />
      <HomeIndustries />
      <HomePartners />
      <HomeBanner />
      <HomeReviews />
      <HomeNewsBlock cls="ams-index-news" hook="news_slider" title="home_text_15" slug="tin-tuc" />
      <HomeNewsBlock
        cls="ams-index-event"
        hook="event_slider"
        title="home_text_17"
        slug="su-kien"
      />
      <HomeFaq />
    </Shell>
  );
}

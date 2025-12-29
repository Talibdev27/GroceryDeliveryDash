import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import HeroSection from "@/components/home/HeroSection";
import CategoriesCarousel from "@/components/home/CategoriesCarousel";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import DeliveryFeatures from "@/components/home/DeliveryFeatures";
import AppPromotion from "@/components/home/AppPromotion";

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <>
      <Helmet>
        <title>{t("seo.home.title")}</title>
        <meta name="description" content={t("seo.home.description")} />
        <meta property="og:title" content={t("seo.home.title")} />
        <meta property="og:description" content={t("seo.home.description")} />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <HeroSection />
      <CategoriesCarousel />
      <FeaturedProducts />
      <DeliveryFeatures />
      <AppPromotion />
    </>
  );
}

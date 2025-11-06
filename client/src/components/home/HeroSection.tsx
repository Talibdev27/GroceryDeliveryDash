import { useTranslation } from "react-i18next";
import { Truck, Leaf, Shield } from "lucide-react";
import DeliveryZoneBanner from "@/components/ui/DeliveryZoneBanner";

export default function HeroSection() {
  const { t } = useTranslation();

  return (
    <section className="relative bg-primary text-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary to-secondary opacity-90"></div>
      <img 
        src="https://images.unsplash.com/photo-1584263347416-85a696b4eda7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600" 
        alt={t("hero.imageAlt")}
        className="absolute object-cover w-full h-full mix-blend-overlay"
      />
      
      <div className="container mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="max-w-2xl">
          <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white/90">
            {t("hero.subtitle")}
          </p>
          
          {/* Delivery Zone Banner */}
          <div className="mb-4 max-w-xl">
            <DeliveryZoneBanner variant="warning" dismissible={true} />
          </div>
          
          {/* Delivery features */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Truck className="h-5 w-5" />
              </div>
              <span className="ms-3 font-medium">{t("hero.features.fastDelivery")}</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Leaf className="h-5 w-5" />
              </div>
              <span className="ms-3 font-medium">{t("hero.features.freshProducts")}</span>
            </div>
            <div className="flex items-center">
              <div className="bg-white/20 p-2 rounded-full">
                <Shield className="h-5 w-5" />
              </div>
              <span className="ms-3 font-medium">{t("hero.features.safePackaging")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

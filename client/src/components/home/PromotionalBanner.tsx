import { useTranslation } from "react-i18next";
import { Link } from "wouter";

export default function PromotionalBanner() {
  const { t } = useTranslation();
  
  return (
    <section className="py-6 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm relative h-48 md:h-64">
            <img 
              src="https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt={t("promotions.vegetables.alt")}
              className="absolute h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-transparent"></div>
            <div className="absolute top-0 left-0 p-6 md:p-8 max-w-xs text-white">
              <h3 className="font-heading font-bold text-xl md:text-2xl mb-2">
                {t("promotions.vegetables.title")}
              </h3>
              <p className="mb-4">
                {t("promotions.vegetables.description")}
              </p>
              <Link 
                href="/products?category=vegetables&sale=true" 
                className="bg-white text-primary font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors inline-block"
              >
                {t("promotions.shopNow")}
              </Link>
            </div>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-sm relative h-48 md:h-64">
            <img 
              src="https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
              alt={t("promotions.mealKits.alt")}
              className="absolute h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-secondary/80 to-transparent"></div>
            <div className="absolute top-0 left-0 p-6 md:p-8 max-w-xs text-white">
              <h3 className="font-heading font-bold text-xl md:text-2xl mb-2">
                {t("promotions.mealKits.title")}
              </h3>
              <p className="mb-4">
                {t("promotions.mealKits.description")}
              </p>
              <Link 
                href="/products?category=meal-kits" 
                className="bg-white text-secondary font-medium py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors inline-block"
              >
                {t("promotions.explore")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

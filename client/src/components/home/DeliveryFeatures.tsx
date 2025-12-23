import { useTranslation } from "react-i18next";
import { Truck, Leaf, Smile } from "lucide-react";

export default function DeliveryFeatures() {
  const { t } = useTranslation();
  
  return (
    <section className="py-10 bg-neutral-100 dark:bg-gray-800">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-heading font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
          {t("whyChooseUs.title")}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              {t("whyChooseUs.delivery.title")}
            </h3>
            <p className="text-neutral-600 dark:text-gray-400">
              {t("whyChooseUs.delivery.description")}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              {t("whyChooseUs.fresh.title")}
            </h3>
            <p className="text-neutral-600 dark:text-gray-400">
              {t("whyChooseUs.fresh.description")}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm text-center border border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Smile className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-heading font-bold text-lg mb-2 text-gray-900 dark:text-gray-100">
              {t("whyChooseUs.satisfaction.title")}
            </h3>
            <p className="text-neutral-600 dark:text-gray-400">
              {t("whyChooseUs.satisfaction.description")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

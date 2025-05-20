import { useTranslation } from "react-i18next";

export default function AppPromotion() {
  const { t } = useTranslation();
  
  return (
    <section className="py-10 bg-primary text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:max-w-md">
            <h2 className="text-2xl md:text-3xl font-heading font-bold mb-4">
              {t("appPromotion.title")}
            </h2>
            <p className="mb-6">
              {t("appPromotion.description")}
            </p>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <a href="#" className="block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt={t("appPromotion.googlePlay")}
                  className="h-10 w-auto"
                />
              </a>
              <a href="#" className="block">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt={t("appPromotion.appStore")}
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>
          
          <div className="relative h-64 w-72 md:h-80 md:w-96">
            <img 
              src="https://images.unsplash.com/photo-1601972599720-36938d4ecd31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800" 
              alt={t("appPromotion.appScreenshot")}
              className="absolute top-0 left-0 w-full h-full object-contain z-10"
            />
            <div className="absolute top-1/4 left-1/4 w-1/2 h-1/2 bg-accent rounded-full blur-3xl opacity-20 z-0"></div>
          </div>
        </div>
      </div>
    </section>
  );
}

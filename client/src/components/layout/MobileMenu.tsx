import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/use-language";
import { X, ChevronRight } from "lucide-react";

export default function MobileMenu() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  
  useEffect(() => {
    // Close menu when clicking outside
    const closeOnOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#mobileMenu") && !target.closest('[data-event="click:toggleMobileMenu"]')) {
        document.getElementById("mobileMenuOverlay")?.classList.add("hidden");
        document.getElementById("mobileMenu")?.classList.add("-translate-x-full");
        document.getElementById("mobileMenu")?.classList.add("rtl:translate-x-full");
      }
    };
    
    document.addEventListener("click", closeOnOutsideClick);
    
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, []);
  
  const closeMobileMenu = () => {
    document.getElementById("mobileMenuOverlay")?.classList.add("hidden");
    document.getElementById("mobileMenu")?.classList.add("-translate-x-full");
    document.getElementById("mobileMenu")?.classList.add("rtl:translate-x-full");
  };

  const getLanguageFlag = (lang: string) => {
    switch (lang) {
      case "en":
        return "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/us.svg";
      case "ru":
        return "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/ru.svg";
      case "uz":
        return "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/uz.svg";
      default:
        return "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/us.svg";
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 hidden" id="mobileMenuOverlay">
      <div className="fixed top-0 left-0 rtl:left-auto rtl:right-0 h-full w-4/5 max-w-xs bg-white shadow-lg transform transition-transform duration-300 -translate-x-full rtl:translate-x-full" id="mobileMenu">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                <path d="M12 2C7.03 2 3 6.03 3 11v5.5c0 1.38 1.12 2.5 2.5 2.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5h-1c-.44 0-.85.09-1.23.27C4.73 6.82 8.06 4 12 4s7.27 2.82 8.73 7.27c-.38-.18-.79-.27-1.23-.27h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c1.38 0 2.5-1.12 2.5-2.5V11c0-4.97-4.03-9-9-9z" />
              </svg>
              <span className="font-heading font-bold text-lg text-neutral-800">
                {t("header.brand")}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="text-neutral-500">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <nav className="flex flex-col py-2">
              <Link href="/" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("nav.home")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/products" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("nav.categories")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/products?onSale=true" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("nav.deals")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/recipes" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("nav.recipes")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/account" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("header.account")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/account/orders" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("header.orders")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
              <Link href="/help" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 flex items-center justify-between">
                <span>{t("nav.helpSupport")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 rtl:rotate-180" />
              </Link>
            </nav>
            
            <div className="p-4 border-t border-neutral-200 mt-4">
              <div className="flex flex-col space-y-2">
                <p className="font-medium text-neutral-800">{t("mobileMenu.changeLanguage")}</p>
                <div className="flex space-x-2 rtl:space-x-reverse">
                  <Button 
                    variant={currentLanguage === "en" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-1 rtl:space-x-reverse" 
                    onClick={() => setLanguage("en")}
                  >
                    <img src={getLanguageFlag("en")} alt="English" className="w-4 h-4 rounded-sm" />
                    <span>English</span>
                  </Button>
                  <Button 
                    variant={currentLanguage === "ru" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-1 rtl:space-x-reverse" 
                    onClick={() => setLanguage("ru")}
                  >
                    <img src={getLanguageFlag("ru")} alt="Russian" className="w-4 h-4 rounded-sm" />
                    <span>Russian</span>
                  </Button>
                  <Button 
                    variant={currentLanguage === "uz" ? "default" : "outline"}
                    size="sm"
                    className="flex items-center space-x-1 rtl:space-x-reverse" 
                    onClick={() => setLanguage("uz")}
                  >
                    <img src={getLanguageFlag("uz")} alt="Uzbek" className="w-4 h-4 rounded-sm" />
                    <span>Uzbek</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-neutral-200">
            <Link href="#" onClick={closeMobileMenu} className="flex items-center justify-center space-x-2 rtl:space-x-reverse bg-primary text-white py-3 rounded-lg hover:bg-primary/90">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 16l-5-5h3V4h4v7h3l-5 5zm9-9v11c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V7c0-1.1.9-2 2-2h3v2H5v11h14V7h-3V5h3c1.1 0 2 .9 2 2z" />
              </svg>
              <span>{t("header.downloadApp")}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

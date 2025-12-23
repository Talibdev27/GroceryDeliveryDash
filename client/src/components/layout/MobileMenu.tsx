import { useEffect } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import Logo from "@/components/ui/Logo";
import { useLanguage } from "@/hooks/use-language";
import { X, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  
  useEffect(() => {
    // Close menu when clicking outside
    const closeOnOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest("#mobileMenu") && !target.closest('[aria-label="Menu"]')) {
        onClose();
      }
    };
    
    if (isOpen) {
    document.addEventListener("click", closeOnOutsideClick);
      // Prevent body scroll when menu is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);
  
  const closeMobileMenu = () => {
    onClose();
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
    <div 
      className={cn(
        "fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300",
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )} 
      id="mobileMenuOverlay" 
      onClick={onClose}
    >
      <div 
        className={cn(
          "fixed top-0 left-0 rtl:left-auto rtl:right-0 h-full w-4/5 max-w-xs bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )} 
        id="mobileMenu"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <Logo size="sm" showText={false} />
              <span className="text-lg font-bold text-primary">Diyor Market</span>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} className="text-neutral-500 dark:text-gray-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            <nav className="flex flex-col py-2">
              <Link href="/" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("nav.home")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
              <Link href="/products" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("nav.categories")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
              <Link href="/products?onSale=true" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("nav.deals")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
              <Link href="/account" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("header.account")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
              <Link href="/account/orders" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("header.orders")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
              <Link href="/help" onClick={closeMobileMenu} className="px-4 py-3 border-b border-neutral-100 dark:border-gray-700 hover:bg-neutral-50 dark:hover:bg-gray-700 flex items-center justify-between">
                <span className="text-gray-900 dark:text-gray-100">{t("nav.helpSupport")}</span>
                <ChevronRight className="h-4 w-4 text-neutral-400 dark:text-gray-500 rtl:rotate-180" />
              </Link>
            </nav>
            
            <div className="p-4 border-t border-neutral-200 dark:border-gray-700 mt-4">
              <div className="flex flex-col space-y-2">
                <p className="font-medium text-neutral-800 dark:text-gray-100">{t("mobileMenu.changeLanguage")}</p>
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
          
          <div className="p-4 border-t border-neutral-200 dark:border-gray-700">
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

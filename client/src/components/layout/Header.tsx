import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import CartButton from "@/components/ui/CartButton";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";
import {
  Search,
  User,
  Package,
  ChevronDown,
  Menu,
  Moon,
  Sun,
} from "lucide-react";

export default function Header() {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileSearch = () => {
    setMobileSearchVisible(!mobileSearchVisible);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.getElementById("mobileMenuOverlay")?.classList.toggle("hidden");
    document.getElementById("mobileMenu")?.classList.toggle("-translate-x-full");
    document.getElementById("mobileMenu")?.classList.toggle("rtl:translate-x-full");
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

  const getLanguageName = (lang: string) => {
    switch (lang) {
      case "en":
        return "English";
      case "ru":
        return "Russian";
      case "uz":
        return "Uzbek";
      default:
        return "English";
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto">
        {/* Top bar with language and account */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-200">
          <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 rtl:space-x-reverse">
                <img 
                  src={getLanguageFlag(currentLanguage)}
                  alt={getLanguageName(currentLanguage)}
                  className="w-4 h-4 rounded-sm"
                />
                <span>{getLanguageName(currentLanguage)}</span>
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setLanguage("en")} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("en")}
                    alt="English"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("ru")} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("ru")}
                    alt="Russian"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>Russian</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("uz")} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("uz")}
                    alt="Uzbek"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>Uzbek</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="hidden md:block">
              <Link href="#" className="text-primary hover:underline">
                {t("header.downloadApp")}
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Link href="/account" className="flex items-center space-x-1 rtl:space-x-reverse hover:text-primary">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{t("header.account")}</span>
            </Link>
            <Link href="/account/orders" className="flex items-center space-x-1 rtl:space-x-reverse hover:text-primary">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">{t("header.orders")}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8 p-0"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Main navigation bar */}
        <div className="py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
              <path d="M12 2C7.03 2 3 6.03 3 11v5.5c0 1.38 1.12 2.5 2.5 2.5h1c.28 0 .5-.22.5-.5v-7c0-.28-.22-.5-.5-.5h-1c-.44 0-.85.09-1.23.27C4.73 6.82 8.06 4 12 4s7.27 2.82 8.73 7.27c-.38-.18-.79-.27-1.23-.27h-1c-.28 0-.5.22-.5.5v7c0 .28.22.5.5.5h1c1.38 0 2.5-1.12 2.5-2.5V11c0-4.97-4.03-9-9-9z" />
            </svg>
            <span className="font-heading font-bold text-xl text-neutral-800">
              {t("header.brand")}
            </span>
          </Link>
          
          {/* Search bar */}
          <div className="hidden md:block flex-grow max-w-xl mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                className="w-full py-2 px-4 bg-neutral-100 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button variant="ghost" className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full px-3 text-neutral-500 hover:text-primary">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <Button variant="ghost" className="md:hidden text-neutral-700 hover:text-primary p-2" aria-label="Search" onClick={toggleMobileSearch}>
              <Search className="h-5 w-5" />
            </Button>
            
            <CartButton />
            
            <Button variant="ghost" className="md:hidden text-neutral-700 hover:text-primary p-2" aria-label="Menu" onClick={toggleMobileMenu}>
              <Menu className="h-5 w-5" />
            </Button>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
              <Link href="/" className="font-medium hover:text-primary">
                {t("nav.home")}
              </Link>
              <Link href="/products" className="font-medium hover:text-primary">
                {t("nav.categories")}
              </Link>
              <Link href="/products?onSale=true" className="font-medium hover:text-primary">
                {t("nav.deals")}
              </Link>
              <Link href="/recipes" className="font-medium hover:text-primary">
                {t("nav.recipes")}
              </Link>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Mobile search bar (hidden by default) */}
      <div className={cn("md:hidden border-t border-neutral-200", { hidden: !mobileSearchVisible })}>
        <div className="p-3">
          <div className="relative">
            <Input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              className="w-full py-2 px-4 bg-neutral-100 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <Button variant="ghost" className="absolute right-0 rtl:right-auto rtl:left-0 top-0 h-full px-3 text-neutral-500 hover:text-primary">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

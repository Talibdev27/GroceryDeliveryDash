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
import Logo from "@/components/ui/Logo";
import AdminNotifications from "@/components/admin/AdminNotifications";
import AppComingSoonDialog from "@/components/ui/AppComingSoonDialog";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Search,
  User,
  Package,
  ChevronDown,
  Menu,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

interface HeaderProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Header({ mobileMenuOpen, setMobileMenuOpen }: HeaderProps) {
  const { t } = useTranslation();
  const { currentLanguage, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const [appDialogOpen, setAppDialogOpen] = useState(false);

  const toggleMobileSearch = () => {
    setMobileSearchVisible(!mobileSearchVisible);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
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
                <DropdownMenuItem onClick={() => {
                  console.log("Header: English language clicked");
                  setLanguage("en");
                }} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("en")}
                    alt="English"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>English</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  console.log("Header: Russian language clicked");
                  setLanguage("ru");
                }} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("ru")}
                    alt="Russian"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>Russian</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  console.log("Header: Uzbek language clicked");
                  setLanguage("uz");
                }} className="cursor-pointer">
                  <img 
                    src={getLanguageFlag("uz")}
                    alt="Uzbek"
                    className="w-4 h-4 rounded-sm mr-2 rtl:ml-2 rtl:mr-0"
                  />
                  <span>Uzbek</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="hidden md:block">
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => setAppDialogOpen(true)}
                aria-label="App Coming Soon"
              >
                {t("header.appComingSoon")}
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            {user ? (
              <>
                <Link href="/account" className="flex items-center space-x-1 rtl:space-x-reverse hover:text-primary">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user.firstName || user.username}</span>
                </Link>
                <Link href="/orders" className="flex items-center space-x-1 rtl:space-x-reverse hover:text-primary">
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("header.orders")}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={logout}
                  className="h-8 w-8 p-0"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth" className="flex items-center space-x-1 rtl:space-x-reverse hover:text-primary">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{t("header.account")}</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Main navigation bar */}
        <div className="py-3 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 rtl:space-x-reverse">
            <Logo size="md" showText={false} />
            <span className="text-xl font-bold text-primary">Diyor Market</span>
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
            
            {/* Notification Bell for Admins, Super Admins, and Riders */}
            {(user?.role === "admin" || user?.role === "super_admin" || user?.role === "rider") && (
              <AdminNotifications />
            )}
            
            <Button 
              variant="ghost" 
              className="md:hidden text-neutral-700 hover:text-primary p-2" 
              aria-label="Menu" 
              onClick={toggleMobileMenu}
              data-event="click:toggleMobileMenu"
            >
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
              {user && user.role === "admin" && (
                <Link href="/admin" className="font-medium hover:text-primary text-blue-600">
                  Admin Dashboard
                </Link>
              )}
              {user && user.role === "super_admin" && (
                <Link href="/super-admin" className="font-medium hover:text-primary text-red-600">
                  Super Admin
                </Link>
              )}
              {user && user.role === "rider" && (
                <Link href="/rider" className="font-medium hover:text-primary text-green-600">
                  Rider
                </Link>
              )}
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
      <AppComingSoonDialog open={appDialogOpen} onOpenChange={setAppDialogOpen} />
    </header>
  );
}

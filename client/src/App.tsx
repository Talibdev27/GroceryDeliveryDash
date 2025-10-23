import { Switch, Route, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import Products from "@/pages/Products";
import Product from "@/pages/Product";
import Checkout from "@/pages/Checkout";
import Orders from "@/pages/Orders";
import Account from "@/pages/Account";
import Auth from "@/pages/Auth";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import RiderDashboard from "@/pages/RiderDashboard";
import LoginTest from "@/pages/LoginTest";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import ShoppingCart from "@/components/shop/ShoppingCart";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/product/:id" component={Product} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/orders" component={Orders} />
      <Route path="/account/:section?" component={Account} />
      <Route path="/auth" component={Auth} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/rider" component={RiderDashboard} />
      <Route path="/login-test" component={LoginTest} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const { currentLanguage } = useLanguage();
  const { theme } = useTheme();
  const [location] = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Set html direction and lang attributes
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = currentLanguage;
    htmlElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    htmlElement.className = theme;
  }, [currentLanguage, theme]);

  return (
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen bg-neutral-100 text-neutral-700 font-sans">
            <Toaster />
            <Header />
            <MobileMenu />
            <ShoppingCart />
            <main className="flex-grow">
              <Router />
            </main>
            <Footer />
          </div>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

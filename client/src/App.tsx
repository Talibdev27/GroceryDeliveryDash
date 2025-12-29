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
import Location from "@/pages/Location";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileMenu from "@/components/layout/MobileMenu";
import ShoppingCart from "@/components/shop/ShoppingCart";
import { useLanguage } from "@/hooks/use-language";
import { useTheme } from "@/hooks/use-theme";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
      <Route path="/location" component={Location} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/super-admin" component={SuperAdminDashboard} />
      <Route path="/rider" component={RiderDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Cart Toast Listener - Handles toast notifications when items are added to cart
function CartToastListener() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const { removeFromCart, openCart } = useCart();
  
  useEffect(() => {
    const handleCartItemAdded = (e: Event) => {
      const customEvent = e as CustomEvent<{ product: any; quantity: number }>;
      const { product, quantity } = customEvent.detail;
      
      toast({
        title: t("cart.addedToCart") || "Added to cart",
        description: (
          <div className="flex items-center gap-3">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">
                {t("cart.addedToCartWithQuantity", { quantity, productName: product.name }) || `Added ${quantity}x to cart`}
              </p>
            </div>
          </div>
        ),
        action: (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => removeFromCart(product.id)}
            >
              {t("cart.undo") || "Undo"}
            </Button>
            <Button 
              size="sm"
              onClick={() => openCart()}
            >
              {t("cart.viewCart") || "View Cart"}
            </Button>
          </div>
        ),
        duration: 3000,
      });
    };
    
    window.addEventListener('cart:item-added', handleCartItemAdded as EventListener);
    return () => window.removeEventListener('cart:item-added', handleCartItemAdded as EventListener);
  }, [toast, t, removeFromCart, openCart]);
  
  return null;
}

function App() {
  const { currentLanguage } = useLanguage();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Set html direction and lang attributes
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.lang = currentLanguage;
    htmlElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    // Theme class is managed by ThemeContext, don't override it here
  }, [currentLanguage]);

  return (
    <>
      <CartToastListener />
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-gray-900 text-neutral-700 dark:text-gray-100 font-sans">
          <Toaster />
          <Header mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
          <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          <ShoppingCart />
          <main className="flex-grow">
            <Router />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
    </>
  );
}

export default App;

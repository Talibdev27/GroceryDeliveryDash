import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/currency";
import { Plus, Minus, Trash2, X } from "lucide-react";

export default function ShoppingCart() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    addToCart,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  const handleViewCart = (e: React.MouseEvent) => {
    e.preventDefault();
    closeCart();
    setLocation("/cart");
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={closeCart}>
      <div 
        className="fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 translate-x-0" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
            <h2 className="font-heading font-bold text-lg dark:text-neutral-100">
              {t("cart.yourCart")} <span className="text-neutral-500 dark:text-neutral-400 font-medium">({cartItems.length} {t("cart.items")})</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={closeCart} className="text-neutral-500 dark:text-neutral-400">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4">
            {cartItems.length > 0 ? (
              <>
                {/* Cart items */}
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b border-neutral-200 dark:border-neutral-700">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-grow mx-4">
                      <h4 className="font-semibold text-base dark:text-neutral-100">{item.name}</h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">{item.unit}</p>
                      <div className="flex items-center mt-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 p-0 dark:border-neutral-600 dark:text-neutral-200" 
                          onClick={() => decrementQuantity(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-6 text-center font-semibold dark:text-neutral-100">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 p-0 dark:border-neutral-600 dark:text-neutral-200" 
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold dark:text-neutral-100">
                        {item.sale && item.salePrice ? (
                          <div className="flex flex-col">
                            <span>{formatPrice(item.salePrice)}</span>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500 line-through font-normal">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        ) : (
                          <span>{formatPrice(item.price)}</span>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-neutral-400 dark:text-neutral-500 hover:text-destructive dark:hover:text-destructive mt-2 h-8 w-8" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-semibold text-lg mb-2 dark:text-neutral-100">{t("cart.emptyCart")}</h3>
                <p className="text-neutral-600 dark:text-neutral-300 text-center mb-4 font-medium">{t("cart.emptyCartMessage")}</p>
                <Button
                  variant="outline"
                  onClick={closeCart}
                  className="dark:border-neutral-600 dark:text-neutral-100"
                >
                  {t("cart.startShopping")}
                </Button>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300 font-semibold">{t("cart.subtotal")}</span>
                  <span className="font-semibold dark:text-neutral-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300 font-semibold">{t("cart.deliveryFee")}</span>
                  <span className="font-semibold dark:text-neutral-100">{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 dark:border-neutral-700 pt-2 mt-2">
                  <span className="font-bold text-base dark:text-neutral-100">{t("cart.total")}</span>
                  <span className="font-bold text-lg dark:text-neutral-100">{formatPrice(total)}</span>
                </div>
              </div>
              
              <Button
                onClick={handleViewCart}
                className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-accent/90 transition-colors"
              >
                {t("cart.viewCart") || "View Cart"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Plus, Minus, Trash2, X } from "lucide-react";

export default function ShoppingCart() {
  const { t } = useTranslation();
  const {
    isCartOpen,
    closeCart,
    cartItems,
    recommended,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    addToCart,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 ${isCartOpen ? "" : "hidden"}`} onClick={closeCart}>
      <div 
        className="fixed top-0 right-0 rtl:right-auto rtl:left-0 h-full w-full max-w-md bg-white shadow-lg transform transition-transform duration-300 translate-x-0" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="font-heading font-bold text-lg">
              {t("cart.yourCart")} <span className="text-neutral-500">({cartItems.length} {t("cart.items")})</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={closeCart} className="text-neutral-500">
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="overflow-y-auto flex-grow p-4">
            {cartItems.length > 0 ? (
              <>
                {/* Cart items */}
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center py-4 border-b border-neutral-200">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-grow mx-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-neutral-500">{item.unit}</p>
                      <div className="flex items-center mt-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 p-0" 
                          onClick={() => decrementQuantity(item.id)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="mx-2 w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 p-0" 
                          onClick={() => incrementQuantity(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-neutral-400 hover:text-destructive mt-2 h-8 w-8" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* Recommended items */}
                <div className="mt-6">
                  <h3 className="font-medium text-neutral-800 mb-3">{t("cart.youMightAlsoLike")}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recommended.map((item) => (
                      <div key={item.id} className="bg-neutral-50 rounded-lg p-3 transition-all hover:shadow-md">
                        <img src={item.image} alt={item.name} className="w-full h-24 object-cover rounded-md mb-2" />
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-neutral-500">{item.unit}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="font-medium">{formatCurrency(item.price)}</span>
                          <Button
                            size="icon"
                            className="h-7 w-7 rounded-full bg-primary text-white hover:bg-primary/90"
                            onClick={() => addToCart(item)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-neutral-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="font-medium text-lg mb-2">{t("cart.emptyCart")}</h3>
                <p className="text-neutral-500 text-center mb-4">{t("cart.emptyCartMessage")}</p>
                <Button
                  variant="outline"
                  onClick={closeCart}
                >
                  {t("cart.startShopping")}
                </Button>
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="p-4 border-t border-neutral-200">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("cart.subtotal")}</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">{t("cart.deliveryFee")}</span>
                  <span className="font-medium">{formatCurrency(deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 mt-2">
                  <span className="font-medium">{t("cart.total")}</span>
                  <span className="font-bold text-lg">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <Link href="/checkout" onClick={closeCart} className="block w-full bg-accent text-white font-medium py-3 rounded-lg text-center hover:bg-accent/90 transition-colors">
                {t("cart.proceedToCheckout")}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

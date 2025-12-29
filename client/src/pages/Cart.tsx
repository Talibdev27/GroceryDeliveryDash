import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/context/AuthContext";
import { formatPrice } from "@/lib/currency";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function Cart() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    subtotal,
    deliveryFee,
    total,
  } = useCart();

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // Redirect to auth page with return URL
      setLocation("/auth?returnUrl=/checkout");
    } else {
      // User is authenticated, proceed to checkout
      setLocation("/checkout");
    }
  };

  return (
    <>
      <Helmet>
        <title>{t("cart.yourCart")} | Diyor Market</title>
        <meta name="description" content={t("cart.yourCart")} />
      </Helmet>

      <div className="bg-neutral-50 dark:bg-gray-900 py-8 min-h-screen">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-heading font-bold mb-6 dark:text-neutral-100">
              {t("cart.yourCart")}
            </h1>

            {cartItems.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-8 md:p-12 text-center">
                <ShoppingBag className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h2 className="text-xl font-heading font-bold mb-2 dark:text-neutral-100">
                  {t("cart.emptyCart")}
                </h2>
                <p className="text-neutral-600 dark:text-neutral-300 mb-6">
                  {t("cart.emptyCartMessage")}
                </p>
                <Link href="/products">
                  <Button>
                    {t("cart.startShopping")}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
                    <div className="p-4 md:p-6">
                      <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">
                        {t("checkout.cartItems", { count: cartItems.length }) || `${t("cart.yourCart")} (${cartItems.length})`}
                      </h2>
                      
                      <div className="space-y-4">
                        {cartItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 py-4 border-b border-neutral-200 dark:border-neutral-700 last:border-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-md shrink-0"
                            />
                            <div className="flex-grow min-w-0">
                              <h3 className="font-semibold text-base md:text-lg mb-1 dark:text-neutral-100">
                                {item.name}
                              </h3>
                              <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium mb-2">
                                {item.unit}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 p-0 dark:border-neutral-600 dark:text-neutral-200"
                                  onClick={() => decrementQuantity(item.id)}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-semibold dark:text-neutral-100">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 p-0 dark:border-neutral-600 dark:text-neutral-200"
                                  onClick={() => incrementQuantity(item.id)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="font-semibold text-base md:text-lg mb-2 dark:text-neutral-100">
                                {item.sale && item.salePrice ? (
                                  <div className="flex flex-col items-end">
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
                                className="text-neutral-400 dark:text-neutral-500 hover:text-destructive dark:hover:text-destructive h-8 w-8"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 md:p-6 sticky top-24">
                    <h2 className="text-lg font-semibold mb-4 dark:text-neutral-100">
                      {t("checkout.orderSummary")}
                    </h2>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                          {t("cart.subtotal")}
                        </span>
                        <span className="font-semibold dark:text-neutral-100">
                          {formatPrice(subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm md:text-base">
                        <span className="text-neutral-600 dark:text-neutral-300 font-semibold">
                          {t("cart.deliveryFee")}
                        </span>
                        <span className="font-semibold dark:text-neutral-100">
                          {formatPrice(deliveryFee)}
                        </span>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-between mb-6">
                      <span className="font-bold text-base md:text-lg dark:text-neutral-100">
                        {t("cart.total")}
                      </span>
                      <span className="font-bold text-lg md:text-xl dark:text-neutral-100">
                        {formatPrice(total)}
                      </span>
                    </div>
                    
                    <Button
                      onClick={handleCheckout}
                      className="w-full bg-accent text-white font-semibold py-3 rounded-lg hover:bg-accent/90 transition-colors"
                    >
                      {t("cart.proceedToCheckout")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    
                    <Link href="/products" className="block mt-4">
                      <Button
                        variant="outline"
                        className="w-full dark:border-neutral-600 dark:text-neutral-100"
                      >
                        {t("cart.continueShopping")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


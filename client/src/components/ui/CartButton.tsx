import { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";

export default function CartButton() {
  const { toggleCart, cartItems } = useCart();
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const [prevCount, setPrevCount] = useState(itemCount);
  const [badgeAnimate, setBadgeAnimate] = useState(false);
  
  useEffect(() => {
    if (itemCount > prevCount) {
      // Trigger bounce/scale animation when count increases
      setBadgeAnimate(true);
      setTimeout(() => setBadgeAnimate(false), 500);
    }
    setPrevCount(itemCount);
  }, [itemCount, prevCount]);
  
  const handleClick = () => {
    console.log("CartButton: Clicked! Current item count:", itemCount);
    toggleCart();
  };
  
  return (
    <Button
      variant="ghost"
      className="relative group p-2"
      aria-label="Shopping cart"
      onClick={handleClick}
    >
      <ShoppingCart className="h-5 w-5 text-neutral-700 group-hover:text-primary" />
      {itemCount > 0 && (
        <span className={cn(
          "absolute -top-2 -right-2 rtl:-right-auto rtl:-left-2",
          "bg-accent text-white text-xs font-bold rounded-full",
          "w-5 h-5 flex items-center justify-center",
          "transition-all duration-300",
          badgeAnimate && "animate-bounce scale-125"
        )}>
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </Button>
  );
}

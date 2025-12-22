import React, { createContext, useState, useEffect } from "react";
import { generateUniqueId } from "@/lib/utils";
import { formatPrice, DEFAULT_CURRENCY } from "@/lib/currency";

export interface CartProduct {
  id: number;
  name: string;
  image: string;
  price: string;
  quantity: number;
  unit: string;
  categoryId: number;
  inStock: boolean;
  featured?: boolean;
  sale?: boolean;
  salePrice?: string;
}

interface RecommendedProduct extends Omit<CartProduct, "quantity"> {}

interface CartContextType {
  cartItems: CartProduct[];
  recommended: RecommendedProduct[];
  addToCart: (product: Omit<CartProduct, "quantity">) => void;
  removeFromCart: (productId: number) => void;
  incrementQuantity: (productId: number) => void;
  decrementQuantity: (productId: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
  openCart: () => void;
  subtotal: number;
  deliveryFee: number;
  total: number;
}

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  recommended: [],
  addToCart: () => {},
  removeFromCart: () => {},
  incrementQuantity: () => {},
  decrementQuantity: () => {},
  clearCart: () => {},
  isCartOpen: false,
  toggleCart: () => {},
  closeCart: () => {},
  openCart: () => {},
  subtotal: 0,
  deliveryFee: DEFAULT_CURRENCY === 'UZS' ? 19000 : 2.99,
  total: 0,
});

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartProduct[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recommended, setRecommended] = useState<RecommendedProduct[]>([
    {
      id: 1,
      name: "Fresh Strawberries",
      image: "https://images.unsplash.com/photo-1518635017480-01fe63a46f50?w=800&auto=format&fit=crop",
      price: DEFAULT_CURRENCY === 'UZS' ? "62500" : "4.99",
      unit: "1 lb package",
      categoryId: 1,
      inStock: true,
    },
    {
      id: 2,
      name: "Organic Eggs",
      image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop",
      price: DEFAULT_CURRENCY === 'UZS' ? "68750" : "5.49",
      unit: "12 count",
      categoryId: 2,
      inStock: true,
    },
  ]);

  // Delivery fee in Uzbek Som (approximately $2.99 USD)
  const deliveryFee = DEFAULT_CURRENCY === 'UZS' ? 19000 : 2.99;

  // Try to load cart from localStorage on initial load
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Failed to parse saved cart", e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Omit<CartProduct, "quantity">) => {
    console.log("CartContext: Adding product to cart:", product);
    let newQuantity = 1;
    
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        newQuantity = existingItem.quantity + 1;
        const newItems = prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
        console.log("CartContext: Updated existing item, new cart:", newItems);
        return newItems;
      } else {
        newQuantity = 1;
        const newItems = [...prevItems, { ...product, quantity: 1 }];
        console.log("CartContext: Added new item, new cart:", newItems);
        return newItems;
      }
    });
    
    // Dispatch custom event for toast notification
    window.dispatchEvent(new CustomEvent('cart:item-added', { 
      detail: { 
        product,
        quantity: newQuantity
      } 
    }));
  };

  const removeFromCart = (productId: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const incrementQuantity = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === productId) {
          const newQuantity = item.quantity - 1;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    console.log("CartContext: toggleCart called, current state:", isCartOpen);
    setIsCartOpen((prev) => {
      console.log("CartContext: Setting cart open to:", !prev);
      return !prev;
    });
  };

  const closeCart = () => {
    console.log("CartContext: closeCart called");
    setIsCartOpen(false);
  };

  const openCart = () => {
    console.log("CartContext: openCart called");
    setIsCartOpen(true);
  };

  // Calculate subtotal and total
  const subtotal = cartItems.reduce(
    (total, item) => {
      const price = item.sale && item.salePrice ? parseFloat(item.salePrice) : parseFloat(item.price);
      return total + price * item.quantity;
    },
    0
  );
  
  const total = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        recommended,
        addToCart,
        removeFromCart,
        incrementQuantity,
        decrementQuantity,
        clearCart,
        isCartOpen,
        toggleCart,
        closeCart,
        openCart,
        subtotal,
        deliveryFee,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

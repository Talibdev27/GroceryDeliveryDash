import React, { createContext, useState, useEffect } from "react";
import { generateUniqueId } from "@/lib/utils";

export interface CartProduct {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  unit: string;
  category: string;
}

interface RecommendedProduct extends Omit<CartProduct, "quantity"> {}

interface CartContextType {
  cartItems: CartProduct[];
  recommended: RecommendedProduct[];
  addToCart: (product: Omit<CartProduct, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  incrementQuantity: (productId: string) => void;
  decrementQuantity: (productId: string) => void;
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
  deliveryFee: 2.99,
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
      id: generateUniqueId(),
      name: "Fresh Strawberries",
      image: "https://images.unsplash.com/photo-1518635017480-01fe63a46f50?w=800&auto=format&fit=crop",
      price: 4.99,
      unit: "1 lb package",
      category: "Fruits",
    },
    {
      id: generateUniqueId(),
      name: "Organic Eggs",
      image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&auto=format&fit=crop",
      price: 5.49,
      unit: "12 count",
      category: "Dairy",
    },
  ]);

  const deliveryFee = 2.99;

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
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
    
    // Open cart when adding a new item
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const incrementQuantity = (productId: string) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementQuantity = (productId: string) => {
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
    setIsCartOpen((prev) => !prev);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const openCart = () => {
    setIsCartOpen(true);
  };

  // Calculate subtotal and total
  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
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

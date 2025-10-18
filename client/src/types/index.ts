// Product Category
export interface Category {
  id: number;
  name: string;
  nameEs: string;
  nameAr: string;
  image: string;
  slug: string;
}

// Product
export interface Product {
  id: number;
  name: string;
  nameEs: string;
  nameAr: string;
  description: string;
  descriptionEs: string;
  descriptionAr: string;
  price: number;
  image: string;
  category: Category;
  unit: string;
  unitEs: string;
  unitAr: string;
  inStock: boolean;
  featured?: boolean;
  sale?: boolean;
  salePrice?: number;
  nutrition?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
  };
  allergens?: string[];
}

// User Address
export interface Address {
  id: number;
  title: string;
  addressType: 'home' | 'work' | 'other';
  fullName: string;
  phone?: string; // NEW: Add phone field (optional)
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

// User
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  addresses: Address[];
  phone?: string;
  role?: string;
}

// Order Item
export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
}

// Order Status
export type OrderStatus = 'pending' | 'processing' | 'picked' | 'out_for_delivery' | 'delivered' | 'cancelled';

// Order
export interface Order {
  id: number;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  createdAt: string;
  estimatedDelivery: string;
  address: Address;
  paymentMethod: string;
}

// Banner
export interface Banner {
  id: number;
  title: string;
  titleEs: string;
  titleAr: string;
  description: string;
  descriptionEs: string;
  descriptionAr: string;
  image: string;
  link: string;
  bgColor: string;
}

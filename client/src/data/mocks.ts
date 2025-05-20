import { generateUniqueId } from "@/lib/utils";

// Common interface for product data
export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  slug: string;
  description?: string;
  longDescription?: string;
  nutritionalInfo?: {
    calories: number;
    fat: number;
    carbs: number;
    protein: number;
  };
  allergens?: string[];
  isOrganic?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
}

// Export products data
export const products: Product[] = [
  {
    id: generateUniqueId(),
    name: "Organic Apples",
    image: "https://images.unsplash.com/photo-1584306670957-acf935f5033c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 3.99,
    unit: "1 lb bag",
    category: "Fruits",
    slug: "organic-apples",
    description: "Fresh organic apples, locally sourced and perfect for snacking or baking.",
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.5,
    reviews: 24,
    nutritionalInfo: {
      calories: 95,
      fat: 0.3,
      carbs: 25,
      protein: 0.5
    },
    allergens: []
  },
  {
    id: generateUniqueId(),
    name: "Organic Milk",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 4.99,
    unit: "1 gallon",
    category: "Dairy",
    slug: "organic-milk",
    description: "Organic whole milk from grass-fed cows, rich and creamy.",
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: false,
    inStock: true,
    rating: 4.7,
    reviews: 18,
    nutritionalInfo: {
      calories: 150,
      fat: 8,
      carbs: 12,
      protein: 8
    },
    allergens: ["milk"]
  },
  {
    id: generateUniqueId(),
    name: "Whole Grain Bread",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 3.49,
    unit: "1 loaf",
    category: "Bakery",
    slug: "whole-grain-bread",
    description: "Freshly baked whole grain bread with a soft interior and crunchy crust.",
    isOrganic: false,
    isVegan: true,
    isGlutenFree: false,
    isDairyFree: true,
    inStock: true,
    rating: 4.2,
    reviews: 32,
    nutritionalInfo: {
      calories: 110,
      fat: 1.5,
      carbs: 20,
      protein: 4
    },
    allergens: ["wheat", "gluten"]
  },
  {
    id: generateUniqueId(),
    name: "Organic Avocados",
    image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 4.99,
    unit: "2 count",
    category: "Fruits",
    slug: "organic-avocados",
    description: "Perfectly ripe organic avocados, great for guacamole or toast.",
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.8,
    reviews: 45,
    nutritionalInfo: {
      calories: 240,
      fat: 22,
      carbs: 12,
      protein: 3
    },
    allergens: []
  },
  {
    id: generateUniqueId(),
    name: "Organic Eggs",
    image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 5.49,
    unit: "12 count",
    category: "Dairy",
    slug: "organic-eggs",
    description: "Farm-fresh organic eggs from free-range chickens.",
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.6,
    reviews: 29,
    nutritionalInfo: {
      calories: 70,
      fat: 5,
      carbs: 0,
      protein: 6
    },
    allergens: ["eggs"]
  },
  {
    id: generateUniqueId(),
    name: "Organic Tomatoes",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 2.99,
    unit: "1 lb",
    category: "Vegetables",
    slug: "organic-tomatoes",
    description: "Juicy organic tomatoes, perfect for salads and cooking.",
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.3,
    reviews: 16,
    nutritionalInfo: {
      calories: 22,
      fat: 0.2,
      carbs: 4.8,
      protein: 1.1
    },
    allergens: []
  },
  {
    id: generateUniqueId(),
    name: "Organic Chicken",
    image: "https://images.unsplash.com/photo-1623059678066-176639ed7069?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 8.99,
    unit: "1 lb",
    category: "Meat",
    slug: "organic-chicken",
    description: "Organic, free-range chicken breast. Hormone-free and antibiotic-free.",
    isOrganic: true,
    isVegan: false,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.4,
    reviews: 22,
    nutritionalInfo: {
      calories: 165,
      fat: 3.6,
      carbs: 0,
      protein: 31
    },
    allergens: []
  },
  {
    id: generateUniqueId(),
    name: "Organic Bananas",
    image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
    price: 1.99,
    unit: "1 bunch",
    category: "Fruits",
    slug: "organic-bananas",
    description: "Sweet organic bananas, perfect for snacking or baking.",
    isOrganic: true,
    isVegan: true,
    isGlutenFree: true,
    isDairyFree: true,
    inStock: true,
    rating: 4.5,
    reviews: 38,
    nutritionalInfo: {
      calories: 105,
      fat: 0.4,
      carbs: 27,
      protein: 1.3
    },
    allergens: []
  }
];

// Categories for the site
export const categories = [
  {
    id: "1",
    name: "Fruits",
    slug: "fruits",
    image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "2",
    name: "Vegetables",
    slug: "vegetables",
    image: "https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "3",
    name: "Dairy",
    slug: "dairy",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "4",
    name: "Bakery",
    slug: "bakery",
    image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "5",
    name: "Meat",
    slug: "meat",
    image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "6",
    name: "Seafood",
    slug: "seafood",
    image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "7",
    name: "Frozen",
    slug: "frozen",
    image: "https://images.unsplash.com/photo-1604322184324-eed6e0cb3378?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  },
  {
    id: "8",
    name: "Snacks",
    slug: "snacks",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"
  }
];

// Promotional banners
export const promotionalBanners = [
  {
    id: "promo1",
    title: "Fresh Vegetables",
    description: "Up to 30% off on fresh, organic vegetables this week!",
    image: "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    link: "/products?category=vegetables&sale=true",
    buttonText: "Shop Now",
    colorClass: "from-primary/80"
  },
  {
    id: "promo2",
    title: "Meal Kits",
    description: "Try our new meal kits with easy recipes and pre-measured ingredients!",
    image: "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
    link: "/products?category=meal-kits",
    buttonText: "Explore",
    colorClass: "from-secondary/80"
  }
];

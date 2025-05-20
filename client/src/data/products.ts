import { Product } from '@/types';
import { categories } from './categories';

export const products: Product[] = [
  {
    id: 1,
    name: 'Organic Apples',
    nameEs: 'Manzanas Orgánicas',
    nameAr: 'تفاح عضوي',
    description: 'Fresh and crisp organic apples, perfect for snacking or baking.',
    descriptionEs: 'Manzanas orgánicas frescas y crujientes, perfectas para picar o hornear.',
    descriptionAr: 'تفاح عضوي طازج ومقرمش، مثالي للوجبات الخفيفة أو الخبز.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1584306670957-acf935f5033c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
    category: categories[0], // Fruits
    unit: '1 lb bag',
    unitEs: 'Bolsa de 1 lb',
    unitAr: 'كيس 1 رطل',
    inStock: true,
    featured: true,
    nutrition: {
      calories: 95,
      fat: 0.3,
      carbs: 25,
      protein: 0.5
    },
    allergens: []
  },
  {
    id: 2,
    name: 'Organic Milk',
    nameEs: 'Leche Orgánica',
    nameAr: 'حليب عضوي',
    description: 'Fresh organic whole milk from grass-fed cows.',
    descriptionEs: 'Leche entera orgánica fresca de vacas alimentadas con pasto.',
    descriptionAr: 'حليب كامل عضوي طازج من أبقار تتغذى على العشب.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
    category: categories[2], // Dairy
    unit: '1 gallon',
    unitEs: '1 galón',
    unitAr: '1 جالون',
    inStock: true,
    featured: true,
    nutrition: {
      calories: 150,
      fat: 8,
      carbs: 12,
      protein: 8
    },
    allergens: ['milk']
  },
  {
    id: 3,
    name: 'Whole Grain Bread',
    nameEs: 'Pan de Grano Entero',
    nameAr: 'خبز الحبوب الكاملة',
    description: 'Freshly baked whole grain bread with a crispy crust.',
    descriptionEs: 'Pan de grano entero recién horneado con corteza crujiente.',
    descriptionAr: 'خبز الحبوب الكاملة المخبوز حديثًا بقشرة مقرمشة.',
    price: 3.49,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
    category: categories[3], // Bakery
    unit: '1 loaf',
    unitEs: '1 barra',
    unitAr: '1 رغيف',
    inStock: true,
    featured: true,
    nutrition: {
      calories: 80,
      fat: 1,
      carbs: 15,
      protein: 4
    },
    allergens: ['gluten', 'wheat']
  },
  {
    id: 4,
    name: 'Organic Avocados',
    nameEs: 'Aguacates Orgánicos',
    nameAr: 'أفوكادو عضوي',
    description: 'Perfectly ripe organic avocados, ready to eat.',
    descriptionEs: 'Aguacates orgánicos perfectamente maduros, listos para comer.',
    descriptionAr: 'أفوكادو عضوي ناضج بشكل مثالي، جاهز للأكل.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300',
    category: categories[0], // Fruits
    unit: '2 count',
    unitEs: '2 unidades',
    unitAr: '2 حبة',
    inStock: true,
    featured: true,
    nutrition: {
      calories: 240,
      fat: 22,
      carbs: 12,
      protein: 3
    },
    allergens: []
  },
  {
    id: 5,
    name: 'Fresh Strawberries',
    nameEs: 'Fresas Frescas',
    nameAr: 'فراولة طازجة',
    description: 'Sweet and juicy fresh strawberries, perfect for desserts or snacking.',
    descriptionEs: 'Fresas frescas dulces y jugosas, perfectas para postres o como snack.',
    descriptionAr: 'فراولة طازجة حلوة وعصيرية، مثالية للحلويات أو كوجبة خفيفة.',
    price: 4.99,
    image: 'https://pixabay.com/get/g539b916a30e5c348d36d51069dc7782044134958643c3b257165b8134af39c3d6284dfb6196e3b27befd187e0e066733b2bf7ea045746d6f4a00cb53891b45b0_1280.jpg',
    category: categories[0], // Fruits
    unit: '1 lb package',
    unitEs: 'Paquete de 1 lb',
    unitAr: 'عبوة 1 رطل',
    inStock: true,
    sale: true,
    salePrice: 3.99,
    nutrition: {
      calories: 50,
      fat: 0.5,
      carbs: 11,
      protein: 1
    },
    allergens: []
  },
  {
    id: 6,
    name: 'Organic Eggs',
    nameEs: 'Huevos Orgánicos',
    nameAr: 'بيض عضوي',
    description: 'Farm-fresh organic eggs from free-range chickens.',
    descriptionEs: 'Huevos orgánicos frescos de granja de gallinas camperas.',
    descriptionAr: 'بيض عضوي طازج من المزرعة من دجاج طليق.',
    price: 5.49,
    image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150',
    category: categories[2], // Dairy
    unit: '12 count',
    unitEs: '12 unidades',
    unitAr: '12 حبة',
    inStock: true,
    nutrition: {
      calories: 70,
      fat: 5,
      carbs: 0,
      protein: 6
    },
    allergens: ['eggs']
  }
];

export const featuredProducts = products.filter(product => product.featured);

export const recommendedProducts = [
  products[4], // Strawberries
  products[5]  // Eggs
];

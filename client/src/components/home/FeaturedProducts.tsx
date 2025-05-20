import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import ProductCard from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { generateUniqueId } from "@/lib/utils";

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  
  const featuredProducts = [
    {
      id: generateUniqueId(),
      name: t("products.apples.name"),
      image: "https://images.unsplash.com/photo-1584306670957-acf935f5033c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 3.99,
      unit: t("products.apples.unit"),
      category: t("categories.fruits"),
      slug: "organic-apples",
    },
    {
      id: generateUniqueId(),
      name: t("products.milk.name"),
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 4.99,
      unit: t("products.milk.unit"),
      category: t("categories.dairy"),
      slug: "organic-milk",
    },
    {
      id: generateUniqueId(),
      name: t("products.bread.name"),
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 3.49,
      unit: t("products.bread.unit"),
      category: t("categories.bakery"),
      slug: "whole-grain-bread",
    },
    {
      id: generateUniqueId(),
      name: t("products.avocados.name"),
      image: "https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 4.99,
      unit: t("products.avocados.unit"),
      category: t("categories.fruits"),
      slug: "organic-avocados",
    }
  ];

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-heading font-bold">
            {t("featuredProducts.title")}
          </h2>
          <Link href="/products" className="text-primary hover:underline hidden md:block">
            {t("featuredProducts.viewAll")}
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={() => addToCart(product)}
            />
          ))}
        </div>
        
        <div className="mt-6 text-center md:hidden">
          <Link href="/products">
            <Button variant="link" className="text-primary">
              {t("featuredProducts.viewAllProducts")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

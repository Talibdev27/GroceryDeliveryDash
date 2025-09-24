import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import ProductCard from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useFeaturedProducts } from "@/hooks/use-api";

export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { data: featuredData, loading, error } = useFeaturedProducts();
  
  const featuredProducts = featuredData?.products || [];

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
        
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
                <div className="w-full h-40 bg-neutral-200 animate-pulse"></div>
                <div className="p-4 space-y-2">
                  <div className="w-12 h-3 bg-neutral-200 animate-pulse"></div>
                  <div className="w-32 h-4 bg-neutral-200 animate-pulse"></div>
                  <div className="w-24 h-3 bg-neutral-200 animate-pulse"></div>
                  <div className="flex justify-between">
                    <div className="w-12 h-4 bg-neutral-200 animate-pulse"></div>
                    <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading featured products</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={() => addToCart(product)}
              />
            ))}
          </div>
        )}
        
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

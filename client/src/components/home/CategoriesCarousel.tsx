import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { useCategories } from "@/hooks/use-api";

export default function CategoriesCarousel() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRtl = currentLanguage === "ar";
  const categoriesRef = useRef<HTMLDivElement>(null);
  const { data: categoriesData, loading, error } = useCategories();
  
  const categories = categoriesData?.categories || [];
  
  const scrollCategories = (direction: "left" | "right") => {
    if (categoriesRef.current) {
      const scrollAmount = 300;
      const scrollDirection = isRtl ? -1 : 1;
      const scrollOffset = direction === "right" ? scrollAmount : -scrollAmount;
      
      categoriesRef.current.scrollBy({
        left: scrollOffset * scrollDirection,
        behavior: "smooth"
      });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-heading font-bold mb-6">
          {t("categories.title")}
        </h2>
        
        <div className="relative">
          <div 
            ref={categoriesRef}
            className="overflow-x-auto pb-4 no-scrollbar"
          >
            <div className="flex space-x-4 rtl:space-x-reverse min-w-max">
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="w-24 h-24 bg-neutral-200 rounded-full animate-pulse mb-2"></div>
                    <div className="w-16 h-4 bg-neutral-200 animate-pulse"></div>
                  </div>
                ))
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">Error loading categories</p>
                </div>
              ) : (
                categories.map((category) => (
                  <Link 
                    key={category.id}
                    href={`/products?category=${category.name}`}
                    className="flex flex-col items-center group"
                  >
                    <div 
                      className="w-24 h-24 bg-neutral-100 rounded-full overflow-hidden mb-2 group-hover:ring-2 ring-primary transition-all"
                      style={{ 
                        backgroundImage: `url('${category.image}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center"
                      }}
                    ></div>
                    <span className="text-sm font-medium group-hover:text-primary">{category.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
          
          {/* Navigation arrows */}
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-0 rtl:left-auto rtl:right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-600 hover:text-primary focus:outline-none z-10"
            onClick={() => scrollCategories("left")}
          >
            {isRtl ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-0 rtl:right-auto rtl:left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-neutral-600 hover:text-primary focus:outline-none z-10"
            onClick={() => scrollCategories("right")}
          >
            {isRtl ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </section>
  );
}

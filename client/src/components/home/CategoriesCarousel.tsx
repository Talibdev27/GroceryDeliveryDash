import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";

interface Category {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export default function CategoriesCarousel() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRtl = currentLanguage === "ar";
  const categoriesRef = useRef<HTMLDivElement>(null);
  
  const categories: Category[] = [
    {
      id: "1",
      name: t("categories.fruits"),
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "fruits"
    },
    {
      id: "2",
      name: t("categories.vegetables"),
      image: "https://images.unsplash.com/photo-1557844352-761f2565b576?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "vegetables"
    },
    {
      id: "3",
      name: t("categories.dairy"),
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "dairy"
    },
    {
      id: "4",
      name: t("categories.bakery"),
      image: "https://images.unsplash.com/photo-1608198093002-ad4e005484ec?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "bakery"
    },
    {
      id: "5",
      name: t("categories.meat"),
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "meat"
    },
    {
      id: "6",
      name: t("categories.seafood"),
      image: "https://images.unsplash.com/photo-1510130387422-82bed34b37e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "seafood"
    },
    {
      id: "7",
      name: t("categories.frozen"),
      image: "https://images.unsplash.com/photo-1604322184324-eed6e0cb3378?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "frozen"
    },
    {
      id: "8",
      name: t("categories.snacks"),
      image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      slug: "snacks"
    }
  ];
  
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
              {categories.map((category) => (
                <Link 
                  key={category.id}
                  href={`/products?category=${category.slug}`}
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
              ))}
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

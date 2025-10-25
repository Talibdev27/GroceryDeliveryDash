import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ui/ProductCard";
import { useCart } from "@/hooks/use-cart";
import { useProducts, useCategories } from "@/hooks/use-api";
import { useLanguage } from "@/hooks/use-language";
import { formatPrice, getCurrencySymbol } from "@/lib/currency";
import { Search, RefreshCw, SlidersHorizontal, ChevronRight } from "lucide-react";

export default function Products() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { addToCart } = useCart();
  const { currentLanguage } = useLanguage();
  
  // API data
  const { data: productsData, loading: productsLoading, error: productsError } = useProducts();
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("popularity");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Get products and categories from API
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Helper function to get category name based on current language
  const getCategoryName = (category: any) => {
    switch (currentLanguage) {
      case 'ru': return category.nameRu || category.name;
      case 'uz': return category.nameUz || category.name;
      case 'es': return category.nameEs || category.name;
      case 'ar': return category.nameAr || category.name;
      default: return category.name;
    }
  };
  
  // Calculate price range from actual products
  const maxPrice = Math.max(...products.map(p => parseFloat(p.price)), 50);
  const [priceRange, setPriceRange] = useState([0, maxPrice]);
  
  // Update price range when products load
  useEffect(() => {
    if (products.length > 0) {
      const newMaxPrice = Math.max(...products.map(p => parseFloat(p.price)), 50);
      setPriceRange([0, newMaxPrice]);
    }
  }, [products]);
  
  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category (using categoryId)
    if (selectedCategory) {
      const category = categories.find(cat => cat.name === selectedCategory);
      if (category && product.categoryId !== category.id) {
        return false;
      }
    }
    
    // Filter by price range
    const productPrice = parseFloat(product.price);
    if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
      return false;
    }
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      default:
        return 0;
    }
  });
  
  const toggleMobileFilters = () => {
    setMobileFiltersVisible(!mobileFiltersVisible);
  };

  return (
    <>
      <Helmet>
        <title>{t("seo.products.title")}</title>
        <meta name="description" content={t("seo.products.description")} />
      </Helmet>
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-neutral-500 space-x-2 rtl:space-x-reverse">
            <a href="/" className="hover:text-primary">{t("breadcrumb.home")}</a>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-neutral-800">{t("breadcrumb.products")}</span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-heading font-bold mb-4 md:mb-0">
            {selectedCategory || t("products.allProducts")}
          </h1>
          
          <div className="w-full md:w-auto flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder={t("products.searchProducts")}
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              className="md:hidden"
              onClick={toggleMobileFilters}
            >
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
            
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px] hidden md:flex">
                <SelectValue placeholder={t("products.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">{t("products.sortOptions.popularity")}</SelectItem>
                <SelectItem value="price-asc">{t("products.sortOptions.priceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("products.sortOptions.priceDesc")}</SelectItem>
                <SelectItem value="name-asc">{t("products.sortOptions.nameAsc")}</SelectItem>
                <SelectItem value="name-desc">{t("products.sortOptions.nameDesc")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className={`w-full md:w-64 md:block ${mobileFiltersVisible ? "block" : "hidden"}`}>
            <div className="bg-white p-4 rounded-lg border border-neutral-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-lg">{t("products.filters")}</h3>
                <Button variant="ghost" size="sm" className="text-primary" onClick={() => {
                  setSearchQuery("");
                  setPriceRange([0, 50]);
                  setSelectedCategory(null);
                }}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t("products.resetFilters")}
                </Button>
              </div>
              
              <Accordion type="multiple" defaultValue={["categories", "price", "dietary"]}>
                <AccordionItem value="categories">
                  <AccordionTrigger>{t("products.filterCategories")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div key={category.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category.id}`} 
                            checked={selectedCategory === category.name}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategory(category.name);
                              } else if (selectedCategory === category.name) {
                                setSelectedCategory(null);
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {getCategoryName(category)}
                          </label>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="price">
                  <AccordionTrigger>{t("products.filterPrice")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <Slider
                        value={priceRange}
                        max={maxPrice}
                        step={0.5}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                      />
                      <div className="flex items-center justify-between">
                        <span>{formatPrice(priceRange[0].toString())}</span>
                        <span>{formatPrice(priceRange[1].toString())}</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="dietary">
                  <AccordionTrigger>{t("products.filterDietary")}</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="organic" />
                        <label 
                          htmlFor="organic"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("products.dietaryOptions.organic")}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="vegan" />
                        <label 
                          htmlFor="vegan"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("products.dietaryOptions.vegan")}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="glutenFree" />
                        <label 
                          htmlFor="glutenFree"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("products.dietaryOptions.glutenFree")}
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="dairyFree" />
                        <label 
                          htmlFor="dairyFree"
                          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {t("products.dietaryOptions.dairyFree")}
                        </label>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
          
          <div className="flex-1">
            {productsError ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-lg border border-neutral-200">
                <div className="text-red-500 mb-4">Error loading products</div>
                <p className="text-neutral-500 text-center">{productsError}</p>
              </div>
            ) : productsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
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
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => addToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-white p-6 rounded-lg border border-neutral-200">
                <Search className="h-12 w-12 text-neutral-300 mb-4" />
                <h3 className="font-medium text-lg mb-2">{t("products.noResults")}</h3>
                <p className="text-neutral-500 text-center">{t("products.tryAdjustingFilters")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

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
import { useProductsPaginated, useCategories } from "@/hooks/use-api";
import { useLanguage } from "@/hooks/use-language";
import { formatPrice, getCurrencySymbol } from "@/lib/currency";
import { Search, RefreshCw, SlidersHorizontal, ChevronRight } from "lucide-react";

export default function Products() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const { addToCart } = useCart();
  const { currentLanguage } = useLanguage();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState("popularity");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const itemsPerPage = 24;
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // API data with pagination
  const { data: productsData, loading: productsLoading, error: productsError } = useProductsPaginated({
    page: currentPage,
    limit: itemsPerPage,
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 1000 ? priceRange[1] : undefined,
    sort: sortOption !== "popularity" ? sortOption : undefined
  });
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  
  // Get products and categories from API
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];
  const pagination = productsData?.pagination || { page: 1, limit: itemsPerPage, total: 0, totalPages: 1 };

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
  
  // Price range state (will be calculated from first page or use default)
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // Update price range when categories load (use a reasonable default)
  useEffect(() => {
    // Set a reasonable default max price
    setPriceRange([0, 1000]);
  }, []);
  
  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1] || "");
    const categoryId = params.get("categoryId");
    const page = params.get("page");
    
    if (categoryId) {
      const id = parseInt(categoryId, 10);
      if (!isNaN(id)) {
        setSelectedCategory(id);
      }
    } else {
      // Clear category if not in URL
      setSelectedCategory(null);
    }
    
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        setCurrentPage(pageNum);
      }
    }
  }, [location]);
  
  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set("categoryId", selectedCategory.toString());
    if (currentPage > 1) params.set("page", currentPage.toString());
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000) params.set("maxPrice", priceRange[1].toString());
    if (sortOption !== "popularity") params.set("sort", sortOption);
    
    const newUrl = `/products${params.toString() ? `?${params.toString()}` : ''}`;
    if (location !== newUrl) {
      setLocation(newUrl, { replace: true });
    }
  }, [selectedCategory, currentPage, debouncedSearch, priceRange, sortOption]);
  
  // Products are already filtered and sorted by the server
  const sortedProducts = products;
  
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
            {selectedCategory 
              ? (() => {
                  const category = categories.find(cat => cat.id === selectedCategory);
                  return category ? getCategoryName(category) : t("products.allProducts");
                })()
              : t("products.allProducts")}
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
            
            <Select value={sortOption} onValueChange={(value) => {
              setSortOption(value);
              setCurrentPage(1); // Reset to first page when sort changes
            }}>
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
                  // Update URL to remove categoryId param, preserve other params
                  const params = new URLSearchParams(location.split("?")[1] || "");
                  params.delete("categoryId");
                  const newQuery = params.toString();
                  setLocation(newQuery ? `/products?${newQuery}` : "/products");
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
                            checked={selectedCategory === category.id}
                            onCheckedChange={(checked) => {
                              // Get current query params to preserve other params
                              const params = new URLSearchParams(location.split("?")[1] || "");
                              
                              if (checked) {
                                setSelectedCategory(category.id);
                                // Update URL with categoryId
                                params.set("categoryId", category.id.toString());
                              } else if (selectedCategory === category.id) {
                                setSelectedCategory(null);
                                // Remove categoryId from URL
                                params.delete("categoryId");
                              }
                              
                              // Update URL with new params
                              const newQuery = params.toString();
                              setLocation(newQuery ? `/products?${newQuery}` : "/products");
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
                        max={1000}
                        step={0.5}
                        onValueChange={(value) => {
                          setPriceRange([value[0], value[1]]);
                          setCurrentPage(1); // Reset to first page when price changes
                        }}
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
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={() => addToCart(product)}
                    />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
                
                {/* Results count */}
                <div className="mt-4 text-center text-sm text-neutral-500">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, pagination.total)} of {pagination.total} products
                </div>
              </>
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

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
import { generateUniqueId } from "@/lib/utils";
import { Search, RefreshCw, SlidersHorizontal, ChevronRight } from "lucide-react";

export default function Products() {
  const { t } = useTranslation();
  const [location] = useLocation();
  const { addToCart } = useCart();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 50]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("popularity");
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  
  // Parse query params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    const category = params.get("category");
    
    if (category) {
      setSelectedCategory(category);
    }
    
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  }, [location]);
  
  // Sample product data
  const products = [
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
    },
    {
      id: generateUniqueId(),
      name: t("products.eggs.name"),
      image: "https://images.unsplash.com/photo-1506976785307-8732e854ad03?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 5.49,
      unit: t("products.eggs.unit"),
      category: t("categories.dairy"),
      slug: "organic-eggs",
    },
    {
      id: generateUniqueId(),
      name: t("products.tomatoes.name"),
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 2.99,
      unit: t("products.tomatoes.unit"),
      category: t("categories.vegetables"),
      slug: "organic-tomatoes",
    },
    {
      id: generateUniqueId(),
      name: t("products.chicken.name"),
      image: "https://images.unsplash.com/photo-1623059678066-176639ed7069?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 8.99,
      unit: t("products.chicken.unit"),
      category: t("categories.meat"),
      slug: "organic-chicken",
    },
    {
      id: generateUniqueId(),
      name: t("products.bananas.name"),
      image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
      price: 1.99,
      unit: t("products.bananas.unit"),
      category: t("categories.fruits"),
      slug: "organic-bananas",
    }
  ];
  
  // Filter products
  const filteredProducts = products.filter(product => {
    // Filter by search query
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filter by category
    if (selectedCategory && product.category !== selectedCategory) {
      return false;
    }
    
    // Filter by price range
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    return true;
  });
  
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
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
                      {["fruits", "vegetables", "dairy", "bakery", "meat", "seafood", "frozen", "snacks"].map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`category-${category}`} 
                            checked={selectedCategory === t(`categories.${category}`)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCategory(t(`categories.${category}`));
                              } else if (selectedCategory === t(`categories.${category}`)) {
                                setSelectedCategory(null);
                              }
                            }}
                          />
                          <label 
                            htmlFor={`category-${category}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {t(`categories.${category}`)}
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
                        defaultValue={[priceRange[0], priceRange[1]]}
                        max={50}
                        step={1}
                        onValueChange={(value) => setPriceRange([value[0], value[1]])}
                      />
                      <div className="flex items-center justify-between">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}</span>
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
            {isLoading ? (
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

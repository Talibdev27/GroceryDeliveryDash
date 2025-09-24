import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useCart } from "@/hooks/use-cart";
import { useProduct, useCategories } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/utils";
import { 
  Minus, 
  Plus, 
  Star, 
  ChevronRight, 
  ShoppingCart, 
  Heart, 
  Share2, 
  ArrowLeft 
} from "lucide-react";

export default function Product() {
  const { t } = useTranslation();
  const [, params] = useRoute<{ id: string }>("/product/:id");
  const { addToCart } = useCart();
  
  const [quantity, setQuantity] = useState(1);
  const { data: productData, loading: isLoading, error } = useProduct(params?.id || "");
  const { data: categoriesData } = useCategories();
  
  const product = productData?.product;
  const categories = categoriesData?.categories || [];

  // Debug logging
  console.log("Product page: Product ID from URL:", params?.id);
  console.log("Product page: Product data from API:", productData);
  console.log("Product page: Product object:", product);
  console.log("Product page: Loading state:", isLoading);
  console.log("Product page: Error state:", error);
  
  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    console.log("Product page: Add to cart clicked");
    console.log("Product page: Product data:", product);
    console.log("Product page: Quantity:", quantity);
    
    if (product) {
      console.log("Product page: Calling addToCart with:", {
        ...product,
        quantity: quantity
      });
      addToCart({
        ...product,
        quantity: quantity
      });
    } else {
      console.log("Product page: No product data available");
    }
  };
  
  // Get category name for breadcrumb
  const getCategoryName = () => {
    if (!product || !product.categoryId) return "";
    const category = categories.find(cat => cat.id === product.categoryId);
    return category?.name || "";
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-neutral-200 h-96 rounded-lg animate-pulse"></div>
          <div className="space-y-4">
            <div className="w-1/3 h-4 bg-neutral-200 animate-pulse"></div>
            <div className="w-2/3 h-8 bg-neutral-200 animate-pulse"></div>
            <div className="w-1/4 h-6 bg-neutral-200 animate-pulse"></div>
            <div className="w-full h-24 bg-neutral-200 animate-pulse"></div>
            <div className="w-full h-12 bg-neutral-200 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || (!isLoading && !product)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold mb-4">{t("product.notFound")}</h1>
            <p className="text-neutral-500 mb-6">{error || t("product.notFoundMessage")}</p>
            <Link href="/products">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t("product.backToProducts")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{`${product.name} | ${t("header.brand")}`}</title>
        <meta name="description" content={`${product.name} - ${product.description || product.category}`} />
      </Helmet>
      
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-neutral-500 space-x-2 rtl:space-x-reverse">
            <Link href="/" className="hover:text-primary">{t("breadcrumb.home")}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/products" className="hover:text-primary">{t("breadcrumb.products")}</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/products?category=${encodeURIComponent(getCategoryName())}`} className="hover:text-primary">
              {getCategoryName()}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-neutral-800 truncate max-w-[150px]">
              {product.name}
            </span>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="rounded-lg overflow-hidden bg-white border border-neutral-200">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Product Details */}
          <div>
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <div className="text-sm text-primary font-medium mb-2">{getCategoryName()}</div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold mb-2">{product.name}</h1>
              
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-neutral-600">(24 {t("product.reviews")})</span>
              </div>
              
              <div className="text-2xl font-bold mb-4">
                {product.sale && product.salePrice ? (
                  <div className="flex items-center space-x-2">
                    <span>{formatCurrency(parseFloat(product.salePrice))}</span>
                    <span className="text-lg text-neutral-400 line-through">
                      {formatCurrency(parseFloat(product.price))}
                    </span>
                  </div>
                ) : (
                  formatCurrency(parseFloat(product.price))
                )}
              </div>
              
              <p className="text-neutral-600 mb-6">
                {product.description || t("product.defaultDescription")}
              </p>
              
              <div className="border-t border-b border-neutral-200 py-4 mb-6">
                <div className="flex items-center mb-4">
                  <span className="text-neutral-600 mr-4">{t("product.quantity")}</span>
                  <div className="flex items-center">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10" 
                      onClick={decrementQuantity}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="mx-4 text-lg font-medium w-8 text-center">{quantity}</span>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-10 w-10" 
                      onClick={incrementQuantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-neutral-500 mb-2">
                  <span className="font-medium">{t("product.unit")}:</span> {product.unit}
                </div>
                
                <div className="text-sm text-neutral-500 mb-2">
                  <span className="font-medium">{t("product.availability")}:</span> 
                  {product.inStock ? t("product.inStock") : t("product.outOfStock")}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.inStock ? t("product.addToCart") : t("product.outOfStock")}
                </Button>
                
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Heart className="h-5 w-5" />
                </Button>
                
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="description" className="mt-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="description">{t("product.tabs.description")}</TabsTrigger>
                <TabsTrigger value="nutrition">{t("product.tabs.nutrition")}</TabsTrigger>
                <TabsTrigger value="reviews">{t("product.tabs.reviews")}</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="bg-white border border-neutral-200 rounded-lg p-6 mt-4">
                <h3 className="font-medium text-lg mb-3">{t("product.descriptionTitle")}</h3>
                <p className="text-neutral-600">
                  {product.longDescription || t("product.longDescription")}
                </p>
                
                <h3 className="font-medium text-lg mt-6 mb-3">{t("product.benefits")}</h3>
                <ul className="list-disc list-inside space-y-2 text-neutral-600">
                  <li>{t("product.benefitItems.item1")}</li>
                  <li>{t("product.benefitItems.item2")}</li>
                  <li>{t("product.benefitItems.item3")}</li>
                </ul>
              </TabsContent>
              
              <TabsContent value="nutrition" className="bg-white border border-neutral-200 rounded-lg p-6 mt-4">
                <h3 className="font-medium text-lg mb-3">{t("product.nutritionFacts")}</h3>
                
                <div className="border rounded-lg mb-4">
                  <div className="p-4 border-b">
                    <div className="flex justify-between font-medium">
                      <span>{t("product.servingSize")}</span>
                      <span>100g</span>
                    </div>
                  </div>
                  
                  <div className="divide-y">
                    <div className="flex justify-between p-3">
                      <span>{t("product.nutritionItems.calories")}</span>
                      <span className="font-medium">150</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span>{t("product.nutritionItems.fat")}</span>
                      <span className="font-medium">5g</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span>{t("product.nutritionItems.carbs")}</span>
                      <span className="font-medium">20g</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span>{t("product.nutritionItems.protein")}</span>
                      <span className="font-medium">3g</span>
                    </div>
                  </div>
                </div>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="allergens">
                    <AccordionTrigger>{t("product.allergens")}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-neutral-600">{t("product.allergensText")}</p>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="storage">
                    <AccordionTrigger>{t("product.storage")}</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-neutral-600">{t("product.storageText")}</p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
              
              <TabsContent value="reviews" className="bg-white border border-neutral-200 rounded-lg p-6 mt-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-medium text-lg">{t("product.customerReviews")}</h3>
                  <Button>{t("product.writeReview")}</Button>
                </div>
                
                <div className="space-y-6">
                  {/* Sample reviews - in a real app, these would come from an API */}
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= 5 ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">Jane D.</span>
                    </div>
                    <p className="text-neutral-600 mb-1">{t("product.reviewSample1")}</p>
                    <div className="text-sm text-neutral-500">2 {t("product.daysAgo")}</div>
                  </div>
                  
                  <div className="border-b pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= 4 ? "text-yellow-400 fill-yellow-400" : "text-neutral-300"}`}
                          />
                        ))}
                      </div>
                      <span className="font-medium">Mike T.</span>
                    </div>
                    <p className="text-neutral-600 mb-1">{t("product.reviewSample2")}</p>
                    <div className="text-sm text-neutral-500">1 {t("product.weekAgo")}</div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

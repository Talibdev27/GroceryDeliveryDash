import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatPrice } from "@/lib/currency";

interface Product {
  id: number;
  name: string;
  image: string;
  price: string;
  unit: string;
  categoryId: number;
  inStock: boolean;
  featured?: boolean;
  sale?: boolean;
  salePrice?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Adding product to cart:", product.name);
    onAddToCart();
  };
  
  const displayPrice = product.sale && product.salePrice ? product.salePrice : product.price;
  const originalPrice = product.sale ? product.price : null;
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all hover:shadow-md">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-40 object-cover"
          />
          {product.featured && (
            <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">
              Featured
            </div>
          )}
          {product.sale && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Sale
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-neutral-500 mb-2">{product.unit}</p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold">{formatPrice(displayPrice)}</span>
              {originalPrice && (
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {!product.inStock && (
            <div className="text-xs text-red-500 mt-1">Out of Stock</div>
          )}
        </div>
      </Link>
    </div>
  );
}

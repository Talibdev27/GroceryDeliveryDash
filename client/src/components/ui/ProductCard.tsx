import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  category: string;
  slug: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart();
  };
  
  return (
    <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden transition-all hover:shadow-md">
      <Link href={`/product/${product.slug}`} className="block">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-40 object-cover"
        />
        <div className="p-4">
          <div className="text-xs text-primary font-medium mb-1">{product.category}</div>
          <h3 className="font-medium">{product.name}</h3>
          <p className="text-sm text-neutral-500 mb-2">{product.unit}</p>
          <div className="flex items-center justify-between">
            <span className="font-bold">{formatCurrency(product.price)}</span>
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90"
              onClick={handleAddToCart}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Link>
    </div>
  );
}

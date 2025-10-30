import { useState } from "react";

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  salePrice: string;
  categoryId: string;
  stockQuantity: string;
  featured: boolean;
  sale: boolean;
  image: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  salePrice?: string;
  categoryId: number;
  inStock: boolean;
  stockQuantity: number;
  featured: boolean;
  sale: boolean;
  image: string;
  category?: {
    id: number;
    name: string;
  };
}

export const useProductManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const normalize = (data: any) => {
    const parsedPrice = parseFloat((data.price || '').toString());
    const parsedSale = parseFloat((data.salePrice || '').toString());
    const parsedStock = parseInt((data.stockQuantity || '').toString(), 10);
    // Preserve translations and units explicitly; keep nutrition as-is (server parses)
    return {
      // Translations
      name: data.name ?? '',
      nameRu: data.nameRu ?? '',
      nameUz: data.nameUz ?? '',
      description: data.description ?? '',
      descriptionRu: data.descriptionRu ?? '',
      descriptionUz: data.descriptionUz ?? '',
      unit: data.unit ?? '',
      unitRu: data.unitRu ?? '',
      unitUz: data.unitUz ?? '',
      image: data.image ?? '',
      featured: !!data.featured,
      sale: !!data.sale,
      nutrition: data.nutrition || undefined,
      price: Number.isFinite(parsedPrice) ? String(parsedPrice) : '0',
      salePrice: Number.isFinite(parsedSale) ? String(parsedSale) : '',
      stockQuantity: Number.isFinite(parsedStock) ? String(parsedStock) : '0',
      categoryId: data.categoryId || '',
    };
  };

  const createProduct = async (productData: ProductFormData): Promise<Product | null> => {
    setLoading(true);
    setError(null);

    try {
      const payload = normalize(productData);
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create product");
      }

      const result = await response.json();
      return result.product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create product";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (productId: number, productData: ProductFormData): Promise<Product | null> => {
    setLoading(true);
    setError(null);

    try {
      const payload = normalize(productData);
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const result = await response.json();
      return result.product;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product";
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete product");
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createProduct,
    updateProduct,
    deleteProduct,
    loading,
    error,
  };
};

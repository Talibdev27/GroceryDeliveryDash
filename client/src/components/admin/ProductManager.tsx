import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  Upload, 
  Package, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-api";
import { useProductManagement } from "@/hooks/use-product-management";
import { useToast } from "@/hooks/use-toast";
import { formatPrice, getCurrencySymbol, DEFAULT_CURRENCY } from "@/lib/currency";
import { translateProductToEnglish, translateProductToRussian } from "@/lib/translate";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  salePrice?: string;
  categoryId?: number;
  inStock: boolean;
  stockQuantity?: number;
  featured: boolean;
  sale: boolean;
  image: string;
  category?: {
    id: number;
    name: string;
  };
}

export default function ProductManager() {
  const { t } = useTranslation();
  const { data: productsData, loading: productsLoading, error: productsError, refetch: refetchProducts } = useProducts();
  const { data: categoriesData, loading: categoriesLoading } = useCategories();
  const { toast } = useToast();
  
  // Extract the actual arrays from the API response
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];
  const { createProduct, updateProduct, deleteProduct, loading: actionLoading, error: actionError } = useProductManagement();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Form state for creating/editing products
  const [formData, setFormData] = useState({
    name: "",
    nameRu: "",
    nameUz: "",
    description: "",
    descriptionRu: "",
    descriptionUz: "",
    price: "",
    salePrice: "",
    categoryId: "",
    stockQuantity: "",
    featured: false,
    sale: false,
    image: "",
    unit: "",
    unitRu: "",
    unitUz: ""
  });

  // Filter products based on search and filters
  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoryId?.toString() === selectedCategory;
    const matchesStock = stockFilter === "all" || 
                        (stockFilter === "in-stock" && product.inStock) ||
                        (stockFilter === "out-of-stock" && !product.inStock);
    
    return matchesSearch && matchesCategory && matchesStock;
  }) || [];

  // Statistics
  const totalProducts = products?.length || 0;
  const inStockProducts = products?.filter(p => p.inStock).length || 0;
  const outOfStockProducts = products?.filter(p => !p.inStock).length || 0;
  const featuredProducts = products?.filter(p => p.featured).length || 0;
  const saleProducts = products?.filter(p => p.sale).length || 0;

  const handleCreateProduct = async () => {
    const result = await createProduct(formData);
    if (result) {
      setIsCreateDialogOpen(false);
      resetForm();
      // Refresh the products list to show the new product
      await refetchProducts();
      toast({
        title: "Success",
        description: "Product created successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      salePrice: product.salePrice || "",
      categoryId: product.categoryId?.toString() || "",
      stockQuantity: product.stockQuantity?.toString() || "0",
      featured: product.featured,
      sale: product.sale,
      image: product.image
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;
    
    const result = await updateProduct(selectedProduct.id, formData);
    if (result) {
      setIsEditDialogOpen(false);
      resetForm();
      // Refresh the products list to show the updated product
      await refetchProducts();
      toast({
        title: "Success",
        description: "Product updated successfully!",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const success = await deleteProduct(productId);
      if (success) {
        // Refresh the products list to show the updated product list
        await refetchProducts();
        toast({
          title: "Success",
          description: "Product deleted successfully!",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameRu: "",
      nameUz: "",
      description: "",
      descriptionRu: "",
      descriptionUz: "",
      price: "",
      salePrice: "",
      categoryId: "",
      stockQuantity: "",
      featured: false,
      sale: false,
      image: "",
      unit: "",
      unitRu: "",
      unitUz: ""
    });
  };

  // Translation functions
  const handleTranslateToEnglish = async () => {
    if (!formData.nameUz || !formData.descriptionUz || !formData.unitUz) {
      toast({
        title: "Error",
        description: "Please fill in Uzbek fields first",
        variant: "destructive",
      });
      return;
    }

    try {
      const translations = await translateProductToEnglish({
        nameUz: formData.nameUz,
        descriptionUz: formData.descriptionUz,
        unitUz: formData.unitUz
      });

      setFormData(prev => ({
        ...prev,
        name: translations.name,
        description: translations.description,
        unit: translations.unit
      }));

      toast({
        title: "Success",
        description: "English translation completed!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate to English",
        variant: "destructive",
      });
    }
  };

  const handleTranslateToRussian = async () => {
    if (!formData.nameUz || !formData.descriptionUz || !formData.unitUz) {
      toast({
        title: "Error",
        description: "Please fill in Uzbek fields first",
        variant: "destructive",
      });
      return;
    }

    try {
      const translations = await translateProductToRussian({
        nameUz: formData.nameUz,
        descriptionUz: formData.descriptionUz,
        unitUz: formData.unitUz
      });

      setFormData(prev => ({
        ...prev,
        nameRu: translations.nameRu,
        descriptionRu: translations.descriptionRu,
        unitRu: translations.unitRu
      }));

      toast({
        title: "Success",
        description: "Russian translation completed!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to translate to Russian",
        variant: "destructive",
      });
    }
  };

  if (productsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading products: {productsError}
        </div>
      </div>
    );
  }

  if (actionError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error: {actionError}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Product Manager</h1>
          <p className="text-gray-600 mt-2">Manage your product catalog, inventory, and pricing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2" disabled={actionLoading}>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm 
              formData={formData}
              setFormData={setFormData}
              categories={categories || []}
              onSubmit={handleCreateProduct}
              onCancel={() => setIsCreateDialogOpen(false)}
              actionLoading={actionLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{inStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold text-gray-900">{featuredProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">On Sale</p>
                <p className="text-2xl font-bold text-gray-900">{saleProducts}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories?.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stock</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category?.name || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{formatPrice(product.price)}</div>
                      {product.sale && product.salePrice && (
                        <div className="text-sm text-green-600">Sale: {formatPrice(product.salePrice)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.inStock ? "default" : "destructive"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Qty: {product.stockQuantity || 0}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {product.featured && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {product.sale && (
                        <Badge variant="outline">On Sale</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        disabled={actionLoading}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={actionLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm 
            formData={formData}
            setFormData={setFormData}
            categories={categories || []}
            onSubmit={handleUpdateProduct}
            onCancel={() => setIsEditDialogOpen(false)}
            actionLoading={actionLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Product Form Component
interface ProductFormProps {
  formData: any;
  setFormData: (data: any) => void;
  categories: any[];
  onSubmit: () => void;
  onCancel: () => void;
  actionLoading: boolean;
}

function ProductForm({ formData, setFormData, categories, onSubmit, onCancel, actionLoading }: ProductFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter product name"
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter product description"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="price">Price ({getCurrencySymbol()})</Label>
          <Input
            id="price"
            type="number"
            step={DEFAULT_CURRENCY === 'UZS' ? '1' : '0.01'}
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder={DEFAULT_CURRENCY === 'UZS' ? '50000' : '0.00'}
          />
        </div>
        <div>
          <Label htmlFor="salePrice">Sale Price ({getCurrencySymbol()})</Label>
          <Input
            id="salePrice"
            type="number"
            step={DEFAULT_CURRENCY === 'UZS' ? '1' : '0.01'}
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
            placeholder={DEFAULT_CURRENCY === 'UZS' ? '45000' : '0.00'}
          />
        </div>
        <div>
          <Label htmlFor="stockQuantity">Stock Quantity</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={formData.stockQuantity}
            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image">Image URL</Label>
        <Input
          id="image"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="featured">Featured Product</Label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="sale"
            checked={formData.sale}
            onChange={(e) => setFormData({ ...formData, sale: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="sale">On Sale</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={actionLoading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={actionLoading}>
          {actionLoading ? "Saving..." : "Save Product"}
        </Button>
      </div>
    </div>
  );
}

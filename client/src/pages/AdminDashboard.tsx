import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Settings,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  UserCheck,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useProducts, useCategories } from "@/hooks/use-api";

// Import admin sections
import AdminOverview from "@/components/admin/AdminOverview";
import ProductManager from "@/components/admin/ProductManager";
import UserManagement from "@/components/admin/UserManagement";
import OrderManagement from "@/components/admin/OrderManagement";
import Analytics from "@/components/admin/Analytics";
import AdminSettings from "@/components/admin/Settings";

type AdminSection = "overview" | "products" | "users" | "orders" | "analytics" | "settings";

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: productsData } = useProducts();
  const { data: categoriesData } = useCategories();
  
  const [activeSection, setActiveSection] = useState<AdminSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract the actual arrays from the API response
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Quick stats for overview
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const outOfStockProducts = products.filter(p => !p.inStock).length;
  const totalCategories = categories.length;

  const navigationItems = [
    {
      id: "overview" as AdminSection,
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and key metrics"
    },
    {
      id: "products" as AdminSection,
      label: "Product Manager",
      icon: Package,
      description: "Manage products, inventory, and pricing"
    },
    {
      id: "users" as AdminSection,
      label: "User Management",
      icon: Users,
      description: "Manage users and permissions"
    },
    {
      id: "orders" as AdminSection,
      label: "Order Management",
      icon: ShoppingCart,
      description: "View and manage orders"
    },
    {
      id: "analytics" as AdminSection,
      label: "Analytics",
      icon: BarChart3,
      description: "Business insights and reports"
    },
    {
      id: "settings" as AdminSection,
      label: "Settings",
      icon: Settings,
      description: "System configuration"
    }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <ProductManager />;
      case "users":
        return <UserManagement />;
      case "orders":
        return <OrderManagement />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <AdminSettings />;
      default:
        return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-14 px-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Admin Panel</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* User info */}
        <div className="px-3 py-2 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              <Badge variant="secondary" className="text-xs mt-0.5 h-4">Admin</Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.label}</p>
                  <p className={`text-xs truncate ${
                    activeSection === item.id ? 'text-white/80' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-56 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-14 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navigationItems.find(item => item.id === activeSection)?.label}
                </h1>
                <p className="text-sm text-gray-500">
                  {navigationItems.find(item => item.id === activeSection)?.description}
                </p>
              </div>
            </div>

            {/* Quick stats for overview */}
            {activeSection === "overview" && (
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{inStockProducts}</p>
                  <p className="text-xs text-gray-500">In Stock</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{outOfStockProducts}</p>
                  <p className="text-xs text-gray-500">Out of Stock</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{totalCategories}</p>
                  <p className="text-xs text-gray-500">Categories</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingCart, 
  Truck,
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
import RiderManagement from "@/components/admin/RiderManagement";

type AdminSection = "overview" | "products" | "users" | "orders" | "riders" | "analytics" | "settings";

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

  // Define role-based access to navigation items
  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "product_manager":
        return "Product Manager";
      case "rider":
        return "Rider";
      default:
        return "User";
    }
  };

  const allNavigationItems = [
    {
      id: "overview" as AdminSection,
      label: "Overview",
      icon: LayoutDashboard,
      description: "Dashboard overview and key metrics",
      allowedRoles: ["super_admin", "admin"]
    },
    {
      id: "products" as AdminSection,
      label: "Product Manager",
      icon: Package,
      description: "Manage products, inventory, and pricing",
      allowedRoles: ["super_admin", "admin", "product_manager"]
    },
    {
      id: "users" as AdminSection,
      label: "User Management",
      icon: Users,
      description: "Manage users and permissions",
      allowedRoles: ["super_admin", "admin"]
    },
    {
      id: "orders" as AdminSection,
      label: "Order Management",
      icon: ShoppingCart,
      description: "View and manage orders",
      allowedRoles: ["super_admin", "admin"]
    },
    {
      id: "riders" as AdminSection,
      label: "Rider Management",
      icon: Truck,
      description: "Manage delivery riders and assignments",
      allowedRoles: ["super_admin", "admin"]
    },
    {
      id: "analytics" as AdminSection,
      label: "Analytics",
      icon: BarChart3,
      description: "Business insights and reports",
      allowedRoles: ["super_admin", "admin"]
    },
    {
      id: "settings" as AdminSection,
      label: "Settings",
      icon: Settings,
      description: "System configuration",
      allowedRoles: ["super_admin", "admin"]
    }
  ];

  // Filter navigation items based on user role
  const navigationItems = allNavigationItems.filter(item => 
    item.allowedRoles.includes(user?.role || "customer")
  );

  // Set active section to first allowed item when user loads or role changes
  useEffect(() => {
    if (user && navigationItems.length > 0) {
      const allowedIds = new Set(navigationItems.map(item => item.id));
      
      // If current section is not allowed, switch to first allowed section
      if (!allowedIds.has(activeSection)) {
        setActiveSection(navigationItems[0].id);
      }
    }
  }, [user, navigationItems]);

  // Check if user is authorized to access admin dashboard
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const isAuthorizedRole = ["super_admin", "admin", "product_manager"].includes(user.role);
  
  if (!isAuthorizedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const renderActiveSection = () => {
    // Check if user has access to the current section
    const allowedIds = new Set(navigationItems.map(item => item.id));
    
    if (!allowedIds.has(activeSection)) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this section.</p>
        </div>
      );
    }

    switch (activeSection) {
      case "overview":
        return <AdminOverview />;
      case "products":
        return <ProductManager />;
      case "users":
        return <UserManagement />;
      case "orders":
        return <OrderManagement />;
      case "riders":
        return <RiderManagement />;
      case "analytics":
        return <Analytics />;
      case "settings":
        return <AdminSettings />;
      default:
        // Fallback to first allowed section component (non-recursive)
        if (navigationItems.length > 0) {
          const firstSection = navigationItems[0].id;
          switch (firstSection) {
            case "overview":
              return <AdminOverview />;
            case "products":
              return <ProductManager />;
            case "users":
              return <UserManagement />;
            case "orders":
              return <OrderManagement />;
            case "riders":
              return <RiderManagement />;
            case "analytics":
              return <Analytics />;
            case "settings":
              return <AdminSettings />;
            default:
              return null;
          }
        }
        return null;
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
      <div className={`fixed inset-y-0 left-0 z-50 w-52 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 lg:flex-shrink-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-12 px-3 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <LayoutDashboard className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-base font-bold text-gray-900">Admin</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden h-7 w-7 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* User info */}
        <div className="px-2 py-2 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-xs">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <Badge variant="secondary" className="text-[10px] mt-0.5 h-4 px-1">
                {getRoleDisplayName(user?.role || "customer")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center space-x-2.5 px-2.5 py-2 rounded text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-52 flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-12 px-4">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-8 w-8 p-0"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeSection)?.label || "Dashboard"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick stats for overview */}
              {activeSection === "overview" && (
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{totalProducts}</p>
                    <p className="text-[10px] text-gray-500">Products</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{inStockProducts}</p>
                    <p className="text-[10px] text-gray-500">In Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-600">{outOfStockProducts}</p>
                    <p className="text-[10px] text-gray-500">Out of Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{totalCategories}</p>
                    <p className="text-[10px] text-gray-500">Categories</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-3 lg:p-4 min-h-screen">
          {renderActiveSection()}
        </main>
      </div>
    </div>
  );
}


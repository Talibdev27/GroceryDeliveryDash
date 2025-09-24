import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  BarChart3
} from "lucide-react";
import { useProducts, useCategories } from "@/hooks/use-api";

export default function AdminOverview() {
  const { data: productsData } = useProducts();
  const { data: categoriesData } = useCategories();

  // Extract the actual arrays from the API response
  const products = productsData?.products || [];
  const categories = categoriesData?.categories || [];

  // Calculate statistics
  const totalProducts = products.length;
  const inStockProducts = products.filter(p => p.inStock).length;
  const outOfStockProducts = products.filter(p => !p.inStock).length;
  const featuredProducts = products.filter(p => p.featured).length;
  const saleProducts = products.filter(p => p.sale).length;
  const totalCategories = categories.length;

  // Mock data for demo (in real app, this would come from API)
  const totalUsers = 1247;
  const totalOrders = 89;
  const pendingOrders = 12;
  const completedOrders = 77;
  const totalRevenue = 45678.90;
  const monthlyGrowth = 12.5;

  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      change: `+${monthlyGrowth}%`,
      changeType: "positive" as const,
      icon: DollarSign,
      description: "This month"
    },
    {
      title: "Total Orders",
      value: totalOrders.toString(),
      change: "+8.2%",
      changeType: "positive" as const,
      icon: ShoppingCart,
      description: "This month"
    },
    {
      title: "Total Users",
      value: totalUsers.toLocaleString(),
      change: "+15.3%",
      changeType: "positive" as const,
      icon: Users,
      description: "Registered users"
    },
    {
      title: "Total Products",
      value: totalProducts.toString(),
      change: outOfStockProducts > 0 ? `${outOfStockProducts} out of stock` : "All in stock",
      changeType: outOfStockProducts > 0 ? "negative" as const : "positive" as const,
      icon: Package,
      description: "In catalog"
    }
  ];

  const quickStats = [
    {
      title: "Products in Stock",
      value: inStockProducts,
      total: totalProducts,
      percentage: totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0,
      color: "green"
    },
    {
      title: "Featured Products",
      value: featuredProducts,
      total: totalProducts,
      percentage: totalProducts > 0 ? Math.round((featuredProducts / totalProducts) * 100) : 0,
      color: "blue"
    },
    {
      title: "Products on Sale",
      value: saleProducts,
      total: totalProducts,
      percentage: totalProducts > 0 ? Math.round((saleProducts / totalProducts) * 100) : 0,
      color: "orange"
    },
    {
      title: "Categories",
      value: totalCategories,
      total: 10, // Assuming 10 is a good target
      percentage: Math.round((totalCategories / 10) * 100),
      color: "purple"
    }
  ];

  const recentActivities = [
    {
      type: "order",
      message: "New order #1234 received",
      time: "2 minutes ago",
      icon: ShoppingCart,
      color: "blue"
    },
    {
      type: "product",
      message: "Product 'Organic Bananas' is out of stock",
      time: "15 minutes ago",
      icon: AlertTriangle,
      color: "red"
    },
    {
      type: "user",
      message: "New user registered: john.doe@example.com",
      time: "1 hour ago",
      icon: Users,
      color: "green"
    },
    {
      type: "product",
      message: "Product 'Fresh Apples' added to catalog",
      time: "2 hours ago",
      icon: Package,
      color: "blue"
    }
  ];

  return (
    <div className="space-y-4">
      {/* Welcome message */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-lg p-4 text-white">
        <h2 className="text-xl font-bold mb-1">Welcome to Admin Dashboard</h2>
        <p className="text-white/90 text-sm">
          Manage your grocery delivery platform with ease. Here's what's happening today.
        </p>
      </div>

      {/* Main stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Icon className="h-6 w-6 text-primary mb-1" />
                    <Badge 
                      variant={stat.changeType === "positive" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick stats and recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${stat.color}-500`}></div>
                  <span className="text-xs font-medium text-gray-700">{stat.title}</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">
                    {stat.value}/{stat.total}
                  </p>
                  <p className="text-xs text-gray-500">{stat.percentage}%</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-start gap-2">
                  <div className={`p-1.5 rounded-full bg-${activity.color}-100`}>
                    <Icon className={`h-3 w-3 text-${activity.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and notifications */}
      {outOfStockProducts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-900 text-sm">Inventory Alert</h3>
                <p className="text-xs text-red-700">
                  {outOfStockProducts} product{outOfStockProducts > 1 ? 's' : ''} are out of stock. 
                  Consider restocking to avoid customer disappointment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Package className="h-5 w-5 text-primary mb-1" />
              <h3 className="font-medium text-gray-900 text-sm">Add New Product</h3>
              <p className="text-xs text-gray-500">Add a new product to your catalog</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="h-5 w-5 text-primary mb-1" />
              <h3 className="font-medium text-gray-900 text-sm">View Users</h3>
              <p className="text-xs text-gray-500">Manage user accounts and permissions</p>
            </button>
            <button className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <ShoppingCart className="h-5 w-5 text-primary mb-1" />
              <h3 className="font-medium text-gray-900 text-sm">View Orders</h3>
              <p className="text-xs text-gray-500">Check recent orders and status</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


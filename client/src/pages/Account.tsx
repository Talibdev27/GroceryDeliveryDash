import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useRoute, useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/hooks/use-theme";
import { userApi, orderApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/utils";
import AddressManager from "@/components/account/AddressManager";
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Heart, 
  Bell, 
  Settings, 
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";

interface Order {
  id: number;
  status: string;
  total: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    quantity: number;
    price: string;
    productName?: string;
    productImage?: string;
  }>;
}

interface Address {
  id: number;
  title: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export default function Account() {
  const { t } = useTranslation();
  const [, params] = useRoute("/account/:section?");
  const [activeTab, setActiveTab] = useState(params?.section || "profile");
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  
  // State for real data
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/auth");
    }
  }, [loading, user, setLocation]);

  // Sync activeTab with current route
  useEffect(() => {
    if (params?.section) {
      setActiveTab(params.section);
    }
  }, [params?.section]);

  // Sync profile data with user data
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user]);

  // Fetch orders when user is available
  useEffect(() => {
    if (user && activeTab === "orders") {
      fetchOrders();
    }
  }, [user, activeTab]);


  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      const data = await orderApi.getOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrdersError("Failed to load orders. Please try again.");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);

      // Update profile
      await userApi.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      });

      // If password fields are filled, update password
      if (profileData.newPassword) {
        if (profileData.newPassword !== profileData.confirmPassword) {
          setSaveMessage({type: 'error', text: 'Passwords do not match'});
          return;
        }
        await userApi.updatePassword({
          currentPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        });
        // Clear password fields
        setProfileData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }

      setSaveMessage({type: 'success', text: 'Profile updated successfully!'});
    } catch (error) {
      setSaveMessage({type: 'error', text: 'Failed to update profile'});
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
      case "in_transit":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "preparing":
        return "Preparing";
      case "ready":
        return "Ready";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };
  
  // Mock payment methods
  const paymentMethods = [
    {
      id: "pm1",
      type: "visa",
      lastFour: "4242",
      expiryDate: "04/25",
      isDefault: true
    },
    {
      id: "pm2",
      type: "mastercard",
      lastFour: "8888",
      expiryDate: "06/24",
      isDefault: false
    }
  ];
  
  // Mock favorites
  const favorites = [
    {
      id: "prod1",
      name: "Organic Apples",
      image: "https://images.unsplash.com/photo-1584306670957-acf935f5033c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      price: 3.99,
      unit: "1 lb bag"
    },
    {
      id: "prod2",
      name: "Organic Milk",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      price: 4.99,
      unit: "1 gallon"
    },
    {
      id: "prod3",
      name: "Whole Grain Bread",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      price: 3.49,
      unit: "1 loaf"
    }
  ];
  
  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-amber-100 text-amber-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-neutral-100 text-neutral-800";
    }
  };
  
  const formatOrderDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getCardIcon = (type: string) => {
    switch (type) {
      case "visa":
        return "https://cdn-icons-png.flaticon.com/512/196/196578.png";
      case "mastercard":
        return "https://cdn-icons-png.flaticon.com/512/196/196561.png";
      case "amex":
        return "https://cdn-icons-png.flaticon.com/512/196/196539.png";
      default:
        return "https://cdn-icons-png.flaticon.com/512/6404/6404078.png";
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{t("seo.account.title")}</title>
        <meta name="description" content={t("seo.account.description")} />
      </Helmet>
      
      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/4">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
                <div className="p-6 border-b border-neutral-200">
                  <div className="flex items-center">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`} alt={user?.username || 'User'} />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0] || user?.username?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h2 className="font-heading font-bold text-lg">
                        {user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Guest User'}
                      </h2>
                      <p className="text-neutral-500 text-sm">{user?.email || 'Not logged in'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2">
                  <nav className="space-y-1">
                    <Link href="/account/profile">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <User className="h-5 w-5 mr-3" />
                        {t("account.profile")}
                      </a>
                    </Link>
                    <Link href="/account/orders">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "orders" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <Package className="h-5 w-5 mr-3" />
                        {t("account.orders")}
                      </a>
                    </Link>
                    <Link href="/account/addresses">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "addresses" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <MapPin className="h-5 w-5 mr-3" />
                        {t("account.addresses")}
                      </a>
                    </Link>
                    <Link href="/account/payment">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "payment" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <CreditCard className="h-5 w-5 mr-3" />
                        {t("account.payment")}
                      </a>
                    </Link>
                    <Link href="/account/favorites">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "favorites" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <Heart className="h-5 w-5 mr-3" />
                        {t("account.favorites")}
                      </a>
                    </Link>
                    <Link href="/account/notifications">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "notifications" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <Bell className="h-5 w-5 mr-3" />
                        {t("account.notifications")}
                      </a>
                    </Link>
                    <Link href="/account/settings">
                      <a className={`flex items-center px-4 py-2 rounded-md ${activeTab === "settings" ? "bg-primary text-white" : "hover:bg-neutral-100"}`}>
                        <Settings className="h-5 w-5 mr-3" />
                        {t("account.settings")}
                      </a>
                    </Link>
                    <Separator className="my-2" />
                    <button 
                      onClick={logout}
                      className="flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-neutral-100 w-full text-left"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {t("account.signOut")}
                    </button>
                  </nav>
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-3/4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                {/* Profile Tab */}
                <TabsContent value="profile">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account.personalInformation")}</CardTitle>
                      <CardDescription>
                        {t("account.personalInfoDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t("account.firstName")}</Label>
                          <Input 
                            id="firstName" 
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("account.lastName")}</Label>
                          <Input 
                            id="lastName" 
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("account.email")}</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            value={profileData.email}
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("account.phone")}</Label>
                          <Input 
                            id="phone" 
                            type="tel" 
                            value={profileData.phone}
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.changePassword")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">{t("account.currentPassword")}</Label>
                            <Input 
                              id="currentPassword" 
                              type="password" 
                              value={profileData.currentPassword}
                              onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">{t("account.newPassword")}</Label>
                            <Input 
                              id="newPassword" 
                              type="password" 
                              value={profileData.newPassword}
                              onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t("account.confirmPassword")}</Label>
                            <Input 
                              id="confirmPassword" 
                              type="password" 
                              value={profileData.confirmPassword}
                              onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
                            />
                          </div>
                        </div>
                      </div>
                      
                      {/* Save message display */}
                      {saveMessage && (
                        <div className={`p-3 rounded-md ${
                          saveMessage.type === 'success' 
                            ? 'bg-green-50 text-green-800 border border-green-200' 
                            : 'bg-red-50 text-red-800 border border-red-200'
                        }`}>
                          {saveMessage.text}
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={isSaving}>
                          {isSaving ? 'Saving...' : t("account.saveChanges")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Orders Tab */}
                <TabsContent value="orders">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account.orderHistory")}</CardTitle>
                      <CardDescription>
                        {t("account.orderHistoryDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {ordersLoading ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-neutral-500">Loading orders...</p>
                        </div>
                      ) : ordersError ? (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-red-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">Error Loading Orders</h3>
                          <p className="text-neutral-500 mb-6">{ordersError}</p>
                          <Button onClick={fetchOrders}>Try Again</Button>
                        </div>
                      ) : orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg overflow-hidden">
                              <div className="bg-neutral-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-b">
                                <div>
                                  <div className="font-medium text-lg">Order #{order.id}</div>
                                  <div className="text-sm text-neutral-500">{formatDate(order.createdAt)}</div>
                                </div>
                                <div className="mt-2 md:mt-0 flex items-center space-x-4">
                                  <Badge className={getStatusColor(order.status)}>
                                    {getStatusText(order.status)}
                                  </Badge>
                                  <Link href="/orders">
                                    <Button variant="outline" size="sm">
                                      <Eye className="h-4 w-4 mr-2" />
                                      View Details
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between text-sm">
                                  <span>{order.items.length} items</span>
                                  <span className="font-medium">{formatCurrency(parseFloat(order.total))}</span>
                                </div>
                                <div className="mt-3 space-x-2">
                                  <Link href="/orders">
                                    <Button variant="outline" size="sm">
                                      Track Order
                                    </Button>
                                  </Link>
                                  <Button variant="outline" size="sm">
                                    Reorder
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">No Orders Yet</h3>
                          <p className="text-neutral-500 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
                          <Link href="/products">
                            <Button>Start Shopping</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Addresses Tab */}
                <TabsContent value="addresses">
                  <AddressManager mode="management" />
                </TabsContent>
                
                {/* Payment Methods Tab */}
                <TabsContent value="payment">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>{t("account.paymentMethods")}</CardTitle>
                        <CardDescription>
                          {t("account.paymentMethodsDescription")}
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        {t("account.addNewPayment")}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {paymentMethods.length > 0 ? (
                        <div className="space-y-4">
                          {paymentMethods.map((payment) => (
                            <div key={payment.id} className="border rounded-lg p-4 flex justify-between items-center">
                              <div className="flex items-center">
                                <img 
                                  src={getCardIcon(payment.type)} 
                                  alt={payment.type} 
                                  className="h-10 w-auto mr-4"
                                />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium capitalize">{payment.type}</span>
                                    <span>•••• {payment.lastFour}</span>
                                    {payment.isDefault && (
                                      <Badge variant="outline" className="bg-primary/10 text-primary">
                                        {t("account.default")}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-sm text-neutral-500 mt-1">
                                    {t("account.expiresOn", { date: payment.expiryDate })}
                                  </div>
                                </div>
                              </div>
                              <div className="space-x-2">
                                <Button variant="ghost" size="sm">
                                  {t("account.edit")}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                  {t("account.delete")}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <CreditCard className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">{t("account.noPaymentMethods")}</h3>
                          <p className="text-neutral-500 mb-6">{t("account.noPaymentMethodsDescription")}</p>
                          <Button>{t("account.addFirstPaymentMethod")}</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Favorites Tab */}
                <TabsContent value="favorites">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account.favoriteItems")}</CardTitle>
                      <CardDescription>
                        {t("account.favoriteItemsDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {favorites.map((product) => (
                            <div key={product.id} className="border rounded-lg overflow-hidden">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-full h-40 object-cover"
                              />
                              <div className="p-4">
                                <h3 className="font-medium">{product.name}</h3>
                                <div className="text-sm text-neutral-500 mb-2">{product.unit}</div>
                                <div className="flex items-center justify-between">
                                  <span className="font-bold">{formatCurrency(product.price)}</span>
                                  <div className="space-x-2">
                                    <Button variant="outline" size="sm">
                                      {t("account.addToCart")}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                      <Heart className="h-4 w-4 fill-current" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Heart className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">{t("account.noFavorites")}</h3>
                          <p className="text-neutral-500 mb-6">{t("account.noFavoritesDescription")}</p>
                          <Link href="/products">
                            <Button>{t("account.browseProducts")}</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Notifications Tab */}
                <TabsContent value="notifications">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account.notificationPreferences")}</CardTitle>
                      <CardDescription>
                        {t("account.notificationPreferencesDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.emailNotifications")}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="orderUpdates" className="flex-1">
                              {t("account.orderUpdates")}
                              <p className="text-sm font-normal text-neutral-500">
                                {t("account.orderUpdatesDescription")}
                              </p>
                            </Label>
                            <Switch id="orderUpdates" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="promotions" className="flex-1">
                              {t("account.promotions")}
                              <p className="text-sm font-normal text-neutral-500">
                                {t("account.promotionsDescription")}
                              </p>
                            </Label>
                            <Switch id="promotions" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="newsletter" className="flex-1">
                              {t("account.newsletter")}
                              <p className="text-sm font-normal text-neutral-500">
                                {t("account.newsletterDescription")}
                              </p>
                            </Label>
                            <Switch id="newsletter" />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.pushNotifications")}</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pushOrderUpdates" className="flex-1">
                              {t("account.orderUpdates")}
                              <p className="text-sm font-normal text-neutral-500">
                                {t("account.pushOrderUpdatesDescription")}
                              </p>
                            </Label>
                            <Switch id="pushOrderUpdates" defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Label htmlFor="pushPromotions" className="flex-1">
                              {t("account.promotions")}
                              <p className="text-sm font-normal text-neutral-500">
                                {t("account.pushPromotionsDescription")}
                              </p>
                            </Label>
                            <Switch id="pushPromotions" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>{t("account.savePreferences")}</Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Settings Tab */}
                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("account.accountSettings")}</CardTitle>
                      <CardDescription>
                        {t("account.accountSettingsDescription")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.language")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="border rounded-lg p-4 flex items-center cursor-pointer bg-primary/5 border-primary">
                            <img 
                              src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/us.svg" 
                              alt="English" 
                              className="w-6 h-6 mr-3"
                            />
                            <span className="font-medium">English</span>
                          </div>
                          <div className="border rounded-lg p-4 flex items-center cursor-pointer hover:bg-neutral-50">
                            <img 
                              src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/es.svg" 
                              alt="Spanish" 
                              className="w-6 h-6 mr-3"
                            />
                            <span>Español</span>
                          </div>
                          <div className="border rounded-lg p-4 flex items-center cursor-pointer hover:bg-neutral-50">
                            <img 
                              src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/sa.svg" 
                              alt="Arabic" 
                              className="w-6 h-6 mr-3"
                            />
                            <span>العربية</span>
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.appearance")}</h3>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="darkMode" className="flex-1">
                            {t("account.darkMode")}
                            <p className="text-sm font-normal text-neutral-500">
                              {t("account.darkModeDescription")}
                            </p>
                          </Label>
                          <Switch 
                            id="darkMode" 
                            checked={theme === "dark"} 
                            onCheckedChange={toggleTheme}
                          />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium text-destructive">{t("account.dangerZone")}</h3>
                        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                          <h4 className="font-medium mb-2">{t("account.deleteAccount")}</h4>
                          <p className="text-sm text-neutral-600 mb-4">
                            {t("account.deleteAccountDescription")}
                          </p>
                          <Button variant="destructive" size="sm">
                            {t("account.deleteMyAccount")}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


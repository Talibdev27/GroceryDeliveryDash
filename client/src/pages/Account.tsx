import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link, useRoute } from "wouter";
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
import { 
  User, 
  Package, 
  MapPin, 
  CreditCard, 
  Heart, 
  Bell, 
  Settings, 
  LogOut 
} from "lucide-react";

export default function Account() {
  const { t } = useTranslation();
  const [, params] = useRoute("/account/:section?");
  const [activeTab, setActiveTab] = useState(params?.section || "profile");
  
  // Mock orders
  const orders = [
    {
      id: "ORD12345",
      date: "2023-06-15",
      status: "delivered",
      total: 35.97,
      items: 4
    },
    {
      id: "ORD12346",
      date: "2023-06-01",
      status: "delivered",
      total: 28.45,
      items: 3
    },
    {
      id: "ORD12347",
      date: "2023-05-20",
      status: "delivered",
      total: 42.10,
      items: 5
    }
  ];
  
  // Mock addresses
  const addresses = [
    {
      id: "addr1",
      name: "Home",
      address: "123 Main Street, Apt 4B",
      city: "Brooklyn",
      state: "NY",
      zipCode: "11201",
      isDefault: true
    },
    {
      id: "addr2",
      name: "Work",
      address: "456 Office Boulevard",
      city: "Manhattan",
      state: "NY",
      zipCode: "10001",
      isDefault: false
    }
  ];
  
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
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="John Doe" />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="ml-4">
                      <h2 className="font-heading font-bold text-lg">John Doe</h2>
                      <p className="text-neutral-500 text-sm">john.doe@example.com</p>
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
                    <Link href="/">
                      <a className="flex items-center px-4 py-2 rounded-md text-red-600 hover:bg-neutral-100">
                        <LogOut className="h-5 w-5 mr-3" />
                        {t("account.signOut")}
                      </a>
                    </Link>
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
                          <Input id="firstName" defaultValue="John" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t("account.lastName")}</Label>
                          <Input id="lastName" defaultValue="Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("account.email")}</Label>
                          <Input id="email" type="email" defaultValue="john.doe@example.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("account.phone")}</Label>
                          <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
                        </div>
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">{t("account.changePassword")}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">{t("account.currentPassword")}</Label>
                            <Input id="currentPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">{t("account.newPassword")}</Label>
                            <Input id="newPassword" type="password" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t("account.confirmPassword")}</Label>
                            <Input id="confirmPassword" type="password" />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button>{t("account.saveChanges")}</Button>
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
                      {orders.length > 0 ? (
                        <div className="space-y-4">
                          {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg overflow-hidden">
                              <div className="bg-neutral-50 p-4 flex flex-col md:flex-row md:items-center justify-between border-b">
                                <div>
                                  <div className="font-medium text-lg">{t("account.orderNumber")}: {order.id}</div>
                                  <div className="text-sm text-neutral-500">{formatOrderDate(order.date)}</div>
                                </div>
                                <div className="mt-2 md:mt-0 flex items-center space-x-4">
                                  <Badge variant="outline" className={getOrderStatusColor(order.status)}>
                                    {t(`account.orderStatus.${order.status}`)}
                                  </Badge>
                                  <Button variant="outline" size="sm">
                                    {t("account.viewDetails")}
                                  </Button>
                                </div>
                              </div>
                              <div className="p-4">
                                <div className="flex justify-between text-sm">
                                  <span>{t("account.items", { count: order.items })}</span>
                                  <span className="font-medium">{formatCurrency(order.total)}</span>
                                </div>
                                <div className="mt-3 space-x-2">
                                  <Button variant="outline" size="sm">
                                    {t("account.trackOrder")}
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    {t("account.reorder")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">{t("account.noOrders")}</h3>
                          <p className="text-neutral-500 mb-6">{t("account.noOrdersDescription")}</p>
                          <Link href="/products">
                            <Button>{t("account.startShopping")}</Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                {/* Addresses Tab */}
                <TabsContent value="addresses">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                      <div>
                        <CardTitle>{t("account.savedAddresses")}</CardTitle>
                        <CardDescription>
                          {t("account.savedAddressesDescription")}
                        </CardDescription>
                      </div>
                      <Button size="sm">
                        {t("account.addNewAddress")}
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {addresses.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {addresses.map((address) => (
                            <div key={address.id} className="border rounded-lg p-4">
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h3 className="font-medium">{address.name}</h3>
                                    {address.isDefault && (
                                      <Badge variant="outline" className="bg-primary/10 text-primary">
                                        {t("account.default")}
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-neutral-600 mt-2">
                                    <div>{address.address}</div>
                                    <div>{address.city}, {address.state} {address.zipCode}</div>
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
                              {!address.isDefault && (
                                <Button variant="outline" size="sm" className="mt-4">
                                  {t("account.setAsDefault")}
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <MapPin className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-1">{t("account.noAddresses")}</h3>
                          <p className="text-neutral-500 mb-6">{t("account.noAddressesDescription")}</p>
                          <Button>{t("account.addFirstAddress")}</Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
                          <Switch id="darkMode" />
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

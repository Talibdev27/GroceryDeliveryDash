import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { orderApi } from "@/hooks/use-api";
import { formatCurrency } from "@/lib/utils";
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle,
  Eye,
  Calendar,
  MapPin,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  productName?: string;
  productImage?: string;
}

interface Order {
  id: number;
  status: string;
  total: string;
  subtotal: string;
  tax: string;
  deliveryFee: string;
  discount: string;
  createdAt: string;
  estimatedDelivery?: string;
  paymentMethod: string;
  paymentStatus: string;
  address?: {
    fullName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  items: OrderItem[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
    case "preparing":
      return <Package className="h-4 w-4" />;
    case "ready":
    case "in_transit":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "cancelled":
      return <XCircle className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
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

export default function Orders() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await orderApi.getOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = (status?: string) => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading your orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-neutral-200 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-heading font-bold mb-4">Error Loading Orders</h1>
            <p className="text-neutral-600 mb-6">{error}</p>
            <Button onClick={fetchOrders}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t("seo.orders.title")}</title>
        <meta name="description" content={t("seo.orders.description")} />
      </Helmet>

      <div className="bg-neutral-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold mb-2">Your Orders</h1>
            <p className="text-neutral-600">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-sm border border-neutral-200 text-center">
              <Package className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
              <h2 className="text-2xl font-heading font-bold mb-4">No Orders Yet</h2>
              <p className="text-neutral-600 mb-6">You haven't placed any orders yet. Start shopping to see your orders here.</p>
              <Link href="/products">
                <Button>
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
                <TabsTrigger value="pending">Pending ({filteredOrders("pending").length})</TabsTrigger>
                <TabsTrigger value="preparing">Preparing ({filteredOrders("preparing").length})</TabsTrigger>
                <TabsTrigger value="in_transit">In Transit ({filteredOrders("in_transit").length})</TabsTrigger>
                <TabsTrigger value="delivered">Delivered ({filteredOrders("delivered").length})</TabsTrigger>
              </TabsList>

              {["all", "pending", "preparing", "in_transit", "delivered"].map((status) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <div className="space-y-4">
                    {filteredOrders(status === "all" ? undefined : status).map((order) => (
                      <Card key={order.id} className="overflow-hidden">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(order.status)}
                                <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-neutral-500">Ordered on</p>
                              <p className="font-medium">{formatDate(order.createdAt)}</p>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Order Items */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center">
                                <Package className="h-4 w-4 mr-2" />
                                Items ({order.items?.length || 0})
                              </h4>
                              <div className="space-y-2">
                                {(order.items || []).map((item) => (
                                  <div key={item.id} className="flex items-center space-x-3">
                                    {item.productImage && (
                                      <img 
                                        src={item.productImage} 
                                        alt={item.productName || "Product"}
                                        className="w-10 h-10 object-cover rounded border"
                                      />
                                    )}
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {item.productName || `Product ${item.productId}`}
                                      </p>
                                      <p className="text-xs text-neutral-500">
                                        Qty: {item.quantity} × {formatCurrency(parseFloat(item.price))}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery Info */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center">
                                <MapPin className="h-4 w-4 mr-2" />
                                Delivery
                              </h4>
                              {order.address ? (
                                <div className="text-sm">
                                  <p className="font-medium">{order.address.fullName}</p>
                                  <p className="text-neutral-600">{order.address.address}</p>
                                  <p className="text-neutral-600">
                                    {order.address.city}, {order.address.state} {order.address.postalCode}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-neutral-500">No address available</p>
                              )}
                            </div>

                            {/* Payment & Total */}
                            <div>
                              <h4 className="font-medium mb-3 flex items-center">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Payment
                              </h4>
                              <div className="text-sm space-y-1">
                                <p className="text-neutral-600">Method: {order.paymentMethod}</p>
                                <p className="text-neutral-600">Status: {order.paymentStatus}</p>
                                <div className="pt-2 border-t">
                                  <p className="font-medium text-lg">
                                    Total: {formatCurrency(parseFloat(order.total))}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end mt-6 pt-4 border-t">
                            <Button 
                              variant="outline" 
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold">Order #{selectedOrder.id}</h2>
                <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                  <XCircle className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center space-x-3">
                  {getStatusIcon(selectedOrder.status)}
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                  <span className="text-sm text-neutral-500">
                    Ordered on {formatDate(selectedOrder.createdAt)}
                  </span>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-medium mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 bg-neutral-50 rounded">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName || "Product"}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium">{item.productName || `Product ${item.productId}`}</p>
                          <p className="text-sm text-neutral-500">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(parseFloat(item.price) * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-neutral-50 p-4 rounded">
                  <h3 className="font-medium mb-3">Order Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(parseFloat(selectedOrder.subtotal))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Fee:</span>
                      <span>{formatCurrency(parseFloat(selectedOrder.deliveryFee))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span>{formatCurrency(parseFloat(selectedOrder.tax))}</span>
                    </div>
                    {parseFloat(selectedOrder.discount) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount:</span>
                        <span>-{formatCurrency(parseFloat(selectedOrder.discount))}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-lg pt-2 border-t">
                      <span>Total:</span>
                      <span>{formatCurrency(parseFloat(selectedOrder.total))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

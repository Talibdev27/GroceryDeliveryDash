import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Menu,
  X,
  Navigation,
  Truck,
  User,
  Phone,
  Map,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { riderApi } from "@/hooks/use-api";
import { OrderDetailsModal } from "@/components/rider/OrderDetailsModal";
import { formatPrice } from "@/lib/currency";

type RiderSection = "overview" | "orders" | "deliveries" | "earnings" | "profile";

export default function RiderDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<RiderSection>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const navigation = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "orders", label: "Available Orders", icon: Package },
    { id: "deliveries", label: "My Deliveries", icon: Truck },
    { id: "earnings", label: "Earnings", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
  ];

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsOrderModalOpen(false);
    setSelectedOrder(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return <RiderOverview />;
      case "orders":
        return <AvailableOrders onOrderClick={handleOrderClick} />;
      case "deliveries":
        return <MyDeliveries onOrderClick={handleOrderClick} />;
      case "earnings":
        return <Earnings />;
      case "profile":
        return <RiderProfile />;
      default:
        return <RiderOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200">
          <h1 className="text-lg font-semibold text-gray-900">Rider Dashboard</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-8 w-8 p-0"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-3">
          <div className="px-3 py-2 mb-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-green-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-green-600">Rider</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className={`w-full justify-start space-x-3 px-3 py-2.5 ${
                    activeSection === item.id
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    setActiveSection(item.id as RiderSection);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-56 flex-1">
        <main className="min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="p-4 lg:p-6">
              {/* Mobile header */}
              <div className="lg:hidden flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                  <Menu className="h-5 w-5" />
                </Button>
                <h1 className="text-xl font-semibold">Rider Dashboard</h1>
                <div className="w-10" />
              </div>

              {renderContent()}
            </div>
          </div>
        </main>
      </div>
      
      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
        onUpdateStatus={async (orderId: number, status: string) => {
          try {
            await riderApi.updateDeliveryStatus(orderId, status);
            // Refresh the current section
            if (activeSection === 'deliveries') {
              // Trigger refresh of MyDeliveries component
              window.location.reload(); // Simple refresh for now
            }
          } catch (err) {
            console.error("Failed to update delivery status:", err);
            alert("Failed to update status. Please try again.");
          }
        }}
      />
    </div>
  );
}

function RiderOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await riderApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch rider stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
          <h2 className="text-xl font-bold mb-1">Welcome back, {user?.firstName}!</h2>
          <p className="text-green-100 text-sm">Loading your statistics...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-xl text-white">
          <h2 className="text-xl font-bold mb-1">Error Loading Stats</h2>
          <p className="text-red-100 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
        <h2 className="text-xl font-bold mb-1">Welcome back, {user?.firstName}!</h2>
        <p className="text-green-100 text-sm">Ready to deliver? Check available orders below.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Deliveries</p>
                <p className="text-2xl font-bold text-green-600">{stats?.todayDeliveries || 0}</p>
              </div>
              <Truck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.completedToday || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats?.pendingDeliveries || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Earnings</p>
                <p className="text-2xl font-bold text-green-600">{stats?.todayEarnings?.toLocaleString() || 0} сум</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AvailableOrders({ onOrderClick }: { onOrderClick?: (order: any) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingOrder, setAcceptingOrder] = useState<number | null>(null);

  useEffect(() => {
    fetchAvailableOrders();
  }, []);

  const fetchAvailableOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await riderApi.getAvailableOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch available orders:", err);
      setError("Failed to load available orders");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      setAcceptingOrder(orderId);
      await riderApi.acceptOrder(orderId);
      // Refresh the orders list
      await fetchAvailableOrders();
    } catch (err) {
      console.error("Failed to accept order:", err);
      alert("Failed to accept order. Please try again.");
    } finally {
      setAcceptingOrder(null);
    }
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Orders</h2>
          <Button disabled>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Available Orders</h2>
          <Button onClick={fetchAvailableOrders}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Available Orders ({orders.length})</h2>
        <Button onClick={fetchAvailableOrders}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Orders
        </Button>
      </div>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No available orders at the moment</p>
          <p className="text-sm text-gray-400">Check back later for new orders</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onOrderClick?.(order)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Order #{order.id}</CardTitle>
                  <Badge variant="outline">Available</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{order.address?.city || 'Tashkent'}, {order.address?.state || 'Chilonzor District'}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Package className="h-4 w-4" />
                  <span>{order.itemCount || 0} items</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="h-4 w-4" />
                  <span>30 min delivery time</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <DollarSign className="h-4 w-4" />
                  <span>{formatPrice(order.deliveryFee || 19000)} delivery fee</span>
                </div>
                <div className="text-xs text-gray-500">
                  Created: {formatDate(order.createdAt)}
                </div>
                <div className="pt-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptOrder(order.id);
                    }}
                    disabled={acceptingOrder === order.id}
                  >
                    {acceptingOrder === order.id ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      'Accept Order'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function MyDeliveries({ onOrderClick }: { onOrderClick?: (order: any) => void }) {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);

  useEffect(() => {
    fetchMyDeliveries();
  }, []);

  const fetchMyDeliveries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await riderApi.getMyDeliveries();
      setDeliveries(data.orders || []);
    } catch (err) {
      console.error("Failed to fetch my deliveries:", err);
      setError("Failed to load deliveries");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      setUpdatingStatus(orderId);
      await riderApi.updateDeliveryStatus(orderId, status);
      // Refresh the deliveries list
      await fetchMyDeliveries();
    } catch (err) {
      console.error("Failed to update delivery status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Badge variant="secondary">Assigned</Badge>;
      case 'in_transit':
        return <Badge variant="default">In Transit</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusActions = (order: any) => {
    if (order.status === 'assigned') {
      return (
        <Button 
          size="sm" 
          onClick={() => handleUpdateStatus(order.id, 'picked_up')}
          disabled={updatingStatus === order.id}
        >
          {updatingStatus === order.id ? 'Updating...' : 'Mark as Picked Up'}
        </Button>
      );
    } else if (order.status === 'in_transit') {
      return (
        <Button 
          size="sm" 
          onClick={() => handleUpdateStatus(order.id, 'delivered')}
          disabled={updatingStatus === order.id}
        >
          {updatingStatus === order.id ? 'Updating...' : 'Mark as Delivered'}
        </Button>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Deliveries</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-6 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Deliveries</h2>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchMyDeliveries} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Deliveries ({deliveries.length})</h2>
        <Button onClick={fetchMyDeliveries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {deliveries.length === 0 ? (
        <div className="text-center py-8">
          <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No deliveries assigned to you</p>
          <p className="text-sm text-gray-400">Check the Available Orders section to accept new deliveries</p>
        </div>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOrderClick?.(delivery)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Order #{delivery.id}</p>
                      <p className="text-sm text-gray-600">
                        {delivery.address?.city || 'Tashkent'}, {delivery.address?.state || 'Chilonzor'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {delivery.itemCount || 0} items • {delivery.userName || 'Customer'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Assigned: {new Date(delivery.riderAssignedAt || delivery.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-2">
                      {getStatusBadge(delivery.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatPrice(delivery.deliveryFee || 19000)}
                    </p>
                    {getStatusActions(delivery)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function Earnings() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await riderApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch earnings:", err);
      setError("Failed to load earnings");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Earnings</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="text-center animate-pulse">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Earnings</h2>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchStats} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Earnings</h2>
        <Button onClick={fetchStats}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">
                {formatPrice(stats?.todayEarnings || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPrice(stats?.weekEarnings || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatPrice(stats?.monthEarnings || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RiderProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Profile</h2>
      <Card>
        <CardHeader>
          <CardTitle>Rider Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <p className="text-sm text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Phone</label>
              <p className="text-sm text-gray-900">{user?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Username</label>
              <p className="text-sm text-gray-900">{user?.username}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Role</label>
              <p className="text-sm text-gray-900 capitalize">{user?.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Status</label>
              <p className="text-sm text-gray-900">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user?.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



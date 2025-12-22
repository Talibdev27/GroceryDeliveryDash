import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Package, Truck, CheckCircle, Clock, AlertCircle, User, MapPin, Phone, Mail, DollarSign, UserPlus } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string;
  productName: string;
  productImage: string;
}

interface Order {
  id: number;
  userId: number;
  status: string;
  total: string;
  subtotal: string;
  tax: string;
  deliveryFee: string;
  discount: string;
  createdAt: string;
  estimatedDelivery: string;
  addressId: number;
  paymentMethod: string;
  paymentStatus: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  address: {
    id: number;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: OrderItem[];
  itemCount: number;
}

export default function OrderManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [availableRiders, setAvailableRiders] = useState<any[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>("");
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  const { data, isLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/admin/orders/${orderId}/status`,
        { status }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      console.error("❌ Order status update error:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response,
        status: error.status
      });
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  // Fetch available riders
  const { data: ridersData } = useQuery<{ riders: any[] }>({
    queryKey: ["/api/admin/riders/available"],
  });

  useEffect(() => {
    if (ridersData?.riders) {
      setAvailableRiders(ridersData.riders);
    }
  }, [ridersData]);

  // Assign rider to order mutation
  const assignRiderMutation = useMutation({
    mutationFn: async ({ orderId, riderId }: { orderId: number; riderId: number }) => {
      const response = await apiRequest(
        "POST",
        `/api/admin/orders/${orderId}/assign-rider`,
        { riderId }
      );
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
      toast({
        title: "Success",
        description: "Rider assigned to order successfully",
      });
      setIsAssignDialogOpen(false);
      setSelectedRiderId("");
    },
    onError: (error: any) => {
      console.error("❌ Rider assignment error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to assign rider to order",
        variant: "destructive",
      });
    },
  });

  const handleAssignRider = (order: Order) => {
    setSelectedOrder(order);
    setIsAssignDialogOpen(true);
  };

  const handleConfirmAssignment = () => {
    if (selectedOrder && selectedRiderId) {
      assignRiderMutation.mutate({
        orderId: selectedOrder.id,
        riderId: parseInt(selectedRiderId),
      });
    }
  };

  const orders = data?.orders || [];
  
  // Filter orders by status
  const filteredOrders = statusFilter === "all" 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  // Calculate stats
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const confirmedOrders = orders.filter(o => o.status === "confirmed" || o.status === "preparing").length;
  const inTransitOrders = orders.filter(o => o.status === "in_transit" || o.status === "ready").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "preparing":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      case "ready":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "in_transit":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "preparing":
      case "ready":
        return <Package className="h-4 w-4" />;
      case "in_transit":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-7 w-7 text-blue-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-pending-count">{pendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Package className="h-7 w-7 text-orange-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Processing</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-processing-count">{confirmedOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Truck className="h-7 w-7 text-purple-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">In Transit</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-transit-count">{inTransitOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircle className="h-7 w-7 text-green-600" />
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Delivered</p>
                <p className="text-xl font-bold text-gray-900" data-testid="text-delivered-count">{deliveredOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">No orders found</h3>
              <p className="text-sm text-gray-600">
                {statusFilter === "all" 
                  ? "No customer orders have been placed yet." 
                  : `No orders with status "${statusFilter}".`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="border rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                  data-testid={`card-order-${order.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-semibold text-sm text-gray-900" data-testid={`text-order-id-${order.id}`}>
                            Order #{order.id}
                          </p>
                          <Badge className={`${getStatusColor(order.status)} text-xs`} data-testid={`badge-status-${order.id}`}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {order.userName} • {order.itemCount} items
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base text-gray-900" data-testid={`text-total-${order.id}`}>
                        ${parseFloat(order.total).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {order.paymentMethod}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg">Order Details #{selectedOrder.id}</DialogTitle>
              <DialogDescription className="text-xs">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Status Update */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Order Status</p>
                  <Badge className={`${getStatusColor(selectedOrder.status)} mt-1`}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(selectedOrder.status)}
                      {selectedOrder.status}
                    </span>
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    defaultValue={selectedOrder.status}
                    onValueChange={(status) => {
                      updateStatusMutation.mutate({ orderId: selectedOrder.id, status });
                    }}
                  >
                    <SelectTrigger className="w-[180px]" data-testid="select-update-status">
                      <SelectValue placeholder="Update status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Rider Assignment */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rider Assignment</p>
                  {selectedOrder.riderAssignedId ? (
                    <p className="text-sm text-green-600 mt-1">✓ Assigned to Rider #{selectedOrder.riderAssignedId}</p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">No rider assigned</p>
                  )}
                </div>
                {!selectedOrder.riderAssignedId && (
                  <Button
                    onClick={() => handleAssignRider(selectedOrder)}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    Assign Rider
                  </Button>
                )}
              </div>

              {/* Customer Information */}
              <div className="border rounded-lg p-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedOrder.userName}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{selectedOrder.userEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedOrder.userPhone}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              {selectedOrder.address && (
                <div className="border rounded-lg p-3 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    Delivery Address
                  </h3>
                  <div className="text-xs">
                    <p className="font-medium">{selectedOrder.address.fullName}</p>
                    <p className="text-gray-600">{selectedOrder.address.phone}</p>
                    <p className="text-gray-600 mt-2">{selectedOrder.address.address}</p>
                    <p className="text-gray-600">
                      {selectedOrder.address.city}, {selectedOrder.address.state} {selectedOrder.address.zipCode}
                    </p>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="border rounded-lg p-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="h-3.5 w-3.5" />
                  Order Items
                </h3>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {item.productImage && (
                          <img 
                            src={item.productImage} 
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-gray-600">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border rounded-lg p-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                  <DollarSign className="h-3.5 w-3.5" />
                  Order Summary
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-medium">${parseFloat(selectedOrder.deliveryFee).toFixed(2)}</span>
                  </div>
                  {parseFloat(selectedOrder.tax) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${parseFloat(selectedOrder.tax).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(selectedOrder.discount) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">-${parseFloat(selectedOrder.discount).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold">${parseFloat(selectedOrder.total).toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Method</span>
                    <Badge variant="outline" className="capitalize">
                      {selectedOrder.paymentMethod}
                    </Badge>
                  </div>
                  {selectedOrder.paymentMethod === "cash" && (
                    <p className="text-xs text-amber-600 mt-2 bg-amber-50 p-2 rounded">
                      💵 {t("admin.cashOnDeliveryMessage")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rider Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Rider to Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Select a rider to assign to this order for delivery.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Select Rider</label>
              <Select value={selectedRiderId} onValueChange={setSelectedRiderId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a rider..." />
                </SelectTrigger>
                <SelectContent>
                  {availableRiders.map((rider) => (
                    <SelectItem key={rider.id} value={rider.id.toString()}>
                      {rider.firstName} {rider.lastName} ({rider.username})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAssignDialogOpen(false);
                  setSelectedRiderId("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmAssignment}
                disabled={!selectedRiderId || assignRiderMutation.isPending}
              >
                {assignRiderMutation.isPending ? "Assigning..." : "Assign Rider"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

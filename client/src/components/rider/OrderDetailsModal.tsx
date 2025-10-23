import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign,
  Truck,
  CheckCircle,
  X
} from 'lucide-react';
import { formatPrice } from '@/lib/currency';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onUpdateStatus?: (orderId: number, status: string) => void;
  updatingStatus?: boolean;
}

export function OrderDetailsModal({ 
  isOpen, 
  onClose, 
  order, 
  onUpdateStatus,
  updatingStatus = false 
}: OrderDetailsModalProps) {
  if (!order) return null;

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ready: { label: 'Ready', variant: 'default' as const, color: 'bg-blue-100 text-blue-800' },
      assigned: { label: 'Assigned', variant: 'secondary' as const, color: 'bg-yellow-100 text-yellow-800' },
      picked_up: { label: 'Picked Up', variant: 'outline' as const, color: 'bg-orange-100 text-orange-800' },
      in_transit: { label: 'In Transit', variant: 'outline' as const, color: 'bg-purple-100 text-purple-800' },
      delivered: { label: 'Delivered', variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'Cancelled', variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ready;
    
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getStatusActions = (order: any) => {
    if (order.status === 'assigned') {
      return (
        <Button
          size="sm"
          onClick={() => onUpdateStatus?.(order.id, 'picked_up')}
          disabled={updatingStatus}
          className="w-full"
        >
          <Truck className="h-4 w-4 mr-2" />
          Mark as Picked Up
        </Button>
      );
    } else if (order.status === 'in_transit') {
      return (
        <Button
          size="sm"
          onClick={() => onUpdateStatus?.(order.id, 'delivered')}
          disabled={updatingStatus}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Mark as Delivered
        </Button>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order Details #{order.id}</span>
            <div className="flex items-center gap-2">
              {getStatusBadge(order.status)}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{order.userName || 'Unknown Customer'}</span>
              </div>
              {order.userEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{order.userEmail}</span>
                </div>
              )}
              {order.userPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{order.userPhone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Delivery Address */}
          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="font-medium">{order.address.name}</div>
                  <div className="text-sm text-gray-600">
                    {order.address.addressLine1}
                    {order.address.addressLine2 && (
                      <div>{order.address.addressLine2}</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.address.city}, {order.address.state} {order.address.postalCode}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.itemCount || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {order.items && order.items.length > 0 ? (
                <div className="space-y-3">
                  {order.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                      {item.productImage && (
                        <img 
                          src={item.productImage} 
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.productName}</div>
                        {item.productDescription && (
                          <div className="text-sm text-gray-500">{item.productDescription}</div>
                        )}
                        <div className="text-sm text-gray-600">
                          Quantity: {item.quantity} × {formatPrice(item.price)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No items found for this order</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatPrice(order.deliveryFee || 19000)}</span>
                </div>
                {order.tax && order.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{formatPrice(order.tax)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatPrice(order.total || order.subtotal + (order.deliveryFee || 19000))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Order Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Order Placed:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.riderAssignedAt && (
                  <div className="flex justify-between">
                    <span>Assigned to Rider:</span>
                    <span>{new Date(order.riderAssignedAt).toLocaleString()}</span>
                  </div>
                )}
                {order.riderPickedUpAt && (
                  <div className="flex justify-between">
                    <span>Picked Up:</span>
                    <span>{new Date(order.riderPickedUpAt).toLocaleString()}</span>
                  </div>
                )}
                {order.riderDeliveredAt && (
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span>{new Date(order.riderDeliveredAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {getStatusActions(order) && (
            <div className="pt-4">
              {getStatusActions(order)}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

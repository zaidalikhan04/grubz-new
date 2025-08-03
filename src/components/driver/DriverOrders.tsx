import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService, Order, OrderStatus } from '../../services/order';
import { AvailableOrders } from './AvailableOrders';
import {
  Clock,
  MapPin,
  Phone,
  User,
  Package,
  CheckCircle,
  Navigation,
  DollarSign,
  Store,
  AlertCircle,
  Truck
} from 'lucide-react';

export const DriverOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'assigned' | 'out_for_delivery' | 'delivered'>('all');

  // Listen to driver orders
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔄 Setting up driver orders listener for:', currentUser.id);
    
    const unsubscribe = OrderService.getDriverOrders(currentUser.id, (ordersList) => {
      console.log('📄 Driver orders updated:', ordersList.length);
      setOrders(ordersList);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up driver orders listener');
      unsubscribe();
    };
  }, [currentUser]);

  // Filter orders by status
  const filteredOrders = orders.filter(order => {
    if (selectedStatus === 'all') return true;
    return order.status === selectedStatus;
  });

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Mark as picked up
  const markPickedUp = async (orderId: string) => {
    await updateOrderStatus(orderId, 'out_for_delivery');
  };

  // Mark as delivered
  const markDelivered = async (orderId: string) => {
    await updateOrderStatus(orderId, 'delivered');
  };

  // Get status badge
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      assigned: { color: 'bg-purple-100 text-purple-800', label: 'Ready for Pickup' },
      out_for_delivery: { color: 'bg-blue-100 text-blue-800', label: 'Out for Delivery' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return config ? <Badge className={config.color}>{config.label}</Badge> : null;
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate estimated delivery time
  const getEstimatedDeliveryTime = (order: Order) => {
    if (order.status === 'delivered' && order.deliveredAt) {
      return `Delivered at ${formatTime(order.deliveredAt)}`;
    }
    return `Est. ${formatTime(order.estimatedDeliveryTime)}`;
  };

  // Get directions URL
  const getDirectionsUrl = (address: any) => {
    const fullAddress = `${address.street}, ${address.city}, ${address.state} ${address.zipCode}`;
    return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress)}`;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <p className="text-gray-600">Claim available orders and manage your deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {orders.length} My Orders
          </Badge>
          <Badge className="bg-purple-100 text-purple-800">
            {orders.filter(o => o.status === 'assigned').length} Ready for Pickup
          </Badge>
          <Badge className="bg-blue-100 text-blue-800">
            {orders.filter(o => o.status === 'out_for_delivery').length} In Transit
          </Badge>
        </div>
      </div>

      {/* Available Orders Section */}
      <AvailableOrders />

      {/* My Orders Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            My Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'assigned', label: 'Ready for Pickup' },
              { value: 'out_for_delivery', label: 'In Transit' },
              { value: 'delivered', label: 'Delivered' }
            ].map(status => (
              <Button
                key={status.value}
                variant={selectedStatus === status.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedStatus(status.value as any)}
                className={selectedStatus === status.value ? 'bg-gray-900' : ''}
              >
                {status.label}
              </Button>
            ))}
          </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all'
                  ? 'You don\'t have any assigned orders yet. Claim orders from the available section above.'
                  : `No ${selectedStatus.replace('_', ' ')} orders found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {getEstimatedDeliveryTime(order)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Restaurant & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Store className="h-4 w-4 text-orange-600" />
                      Pickup from
                    </h4>
                    <p className="font-medium">{order.restaurantName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.restaurantPhone}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      Deliver to
                    </h4>
                    <p className="font-medium">{order.customerName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </p>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <p className="text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                  </p>
                  {order.deliveryAddress.instructions && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="h-4 w-4 inline mr-1" />
                        {order.deliveryAddress.instructions}
                      </p>
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => window.open(getDirectionsUrl(order.deliveryAddress), '_blank')}
                  >
                    <Navigation className="h-4 w-4 mr-1" />
                    Get Directions
                  </Button>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>${order.total.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-gray-600">Payment: {order.paymentMethod}</p>
                  </div>
                </div>

                {/* Special Instructions */}
                {order.specialInstructions && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Special Instructions
                    </h4>
                    <p className="text-sm text-gray-700">{order.specialInstructions}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {order.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => markPickedUp(order.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Mark Picked Up
                    </Button>
                  )}
                  
                  {order.status === 'out_for_delivery' && (
                    <Button
                      size="sm"
                      onClick={() => markDelivered(order.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Delivered
                    </Button>
                  )}

                  {/* Contact Buttons */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${order.customerPhone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call Customer
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`tel:${order.restaurantPhone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call Restaurant
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

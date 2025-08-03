import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { OrderService, Order } from '../../services/order';
import { 
  Clock, 
  MapPin, 
  Phone, 
  DollarSign, 
  Package,
  AlertCircle,
  CheckCircle,
  Truck
} from 'lucide-react';

export const AvailableOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingOrderId, setClaimingOrderId] = useState<string | null>(null);

  // Listen to available orders
  useEffect(() => {
    console.log('🔄 Setting up available orders listener');

    // Request notification permission for real-time alerts
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('📱 Notification permission:', permission);
      });
    }

    const unsubscribe = OrderService.getAvailableOrdersForDrivers((ordersList) => {
      console.log('📄 Available orders updated:', ordersList.length);
      setAvailableOrders(ordersList);
      setLoading(false);

      // Show notification for new available orders
      if (ordersList.length > 0) {
        const latestOrder = ordersList[0];
        if (latestOrder.readyAt) {
          const isNewOrder = Date.now() - latestOrder.readyAt.getTime() < 30000; // Within 30 seconds

          if (isNewOrder) {
            // Show browser notification if permission granted
            if (Notification.permission === 'granted') {
              new Notification('🚚 New Delivery Available!', {
                body: `Order #${latestOrder.orderNumber} from ${latestOrder.restaurantName} - $${latestOrder.total.toFixed(2)}`,
                icon: '/favicon.ico',
                tag: `order-${latestOrder.id}`,
                requireInteraction: true
              });
            }

            // Show in-app notification
            addNotification({
              type: 'new_order',
              title: '🚚 New Order Available!',
              message: `Order #${latestOrder.orderNumber} from ${latestOrder.restaurantName} - $${latestOrder.total.toFixed(2)}`,
              priority: 'high',
              actionUrl: '/driver/orders',
              actionLabel: 'Claim Now'
            });
          }
        }
      }
    });

    return () => {
      console.log('🧹 Cleaning up available orders listener');
      unsubscribe();
    };
  }, [addNotification]);

  // Claim an order
  const claimOrder = async (order: Order) => {
    if (!currentUser) return;

    setClaimingOrderId(order.id);
    try {
      await OrderService.claimOrder(
        order.id,
        currentUser.id,
        currentUser.name || 'Driver',
        currentUser.phone || ''
      );

      addNotification({
        type: 'order_update',
        title: 'Order Claimed!',
        message: `You've successfully claimed order #${order.orderNumber}`,
        priority: 'medium'
      });

      console.log('✅ Order claimed successfully:', order.id);
    } catch (error: any) {
      console.error('❌ Error claiming order:', error);
      addNotification({
        type: 'system',
        title: 'Failed to Claim Order',
        message: error.message || 'This order may have been claimed by another driver',
        priority: 'high'
      });
    } finally {
      setClaimingOrderId(null);
    }
  };

  // Format time since ready
  const getTimeSinceReady = (readyAt: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - readyAt.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Available Orders
          </div>
          <Badge className="bg-green-100 text-green-800">
            {availableOrders.length} Available
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {availableOrders.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-600">No orders available</p>
            <p className="text-sm text-gray-500">New orders will appear here when restaurants mark them ready</p>
          </div>
        ) : (
          <div className="space-y-4">
            {availableOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 border rounded-lg bg-green-50 border-green-200 hover:bg-green-100 transition-colors"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg">#{order.orderNumber}</h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Ready {order.readyAt ? getTimeSinceReady(order.readyAt) : 'Now'}
                    </p>
                  </div>
                  <Badge className="bg-green-600 text-white animate-pulse">
                    🚚 Available to Claim
                  </Badge>
                </div>

                {/* Restaurant & Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Restaurant</h5>
                    <p className="text-sm text-gray-600">{order.restaurantName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.restaurantAddress || 'Address not available'}
                    </p>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 mb-1">Customer</h5>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {order.deliveryAddress?.street || 'Address not available'}
                    </p>
                  </div>
                </div>

                {/* Order Details */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white rounded border">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{order.items.length} items</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Estimated delivery</p>
                    <p className="text-sm font-medium">
                      {order.estimatedDeliveryTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => claimOrder(order)}
                    disabled={claimingOrderId === order.id}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {claimingOrderId === order.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Claiming...
                      </>
                    ) : (
                      <>
                        <Truck className="h-4 w-4 mr-2" />
                        Claim & Pick Up
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`tel:${order.restaurantPhone}`, '_self')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call Restaurant
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

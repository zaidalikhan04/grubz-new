import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService, Order, OrderStatus } from '../../services/order';
import {
  Clock,
  MapPin,
  Phone,
  Store,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  User,
  Navigation
} from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | OrderStatus>('all');

  // Test function to create a sample order (for debugging)
  const createTestOrder = async () => {
    if (!currentUser) return;

    try {
      const testOrderData = {
        customerId: currentUser.id,
        customerName: currentUser.name || 'Test Customer',
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone || '555-0123',
        restaurantId: 'test-restaurant-id',
        restaurantName: 'Test Restaurant',
        restaurantPhone: '555-0456',
        restaurantAddress: '456 Restaurant Ave, Test City, TS 12345',
        items: [
          {
            id: 'test-item-1',
            name: 'Test Burger',
            description: 'A delicious test burger',
            price: 12.99,
            quantity: 2,
            category: 'Main Course',
            preparationTime: 15,
            specialInstructions: ''
          }
        ],
        subtotal: 25.98,
        deliveryFee: 2.99,
        tax: 2.31,
        total: 31.28,
        deliveryAddress: {
          street: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
          instructions: 'Test delivery instructions'
        },
        paymentMethod: 'credit_card',
        specialInstructions: 'Test special instructions'
      };

      console.log('🧪 Creating test order...');
      await OrderService.createOrder(testOrderData);
      console.log('✅ Test order created successfully');
    } catch (error) {
      console.error('❌ Error creating test order:', error);
    }
  };

  // Listen to customer orders
  useEffect(() => {
    console.log('🔍 CustomerOrders useEffect triggered, currentUser:', currentUser);

    if (!currentUser) {
      console.log('❌ No currentUser found, skipping orders listener setup');
      setLoading(false);
      setOrders([]);
      return;
    }

    console.log('🔄 Setting up customer orders listener for:', currentUser.id);
    console.log('🔍 Current user object:', currentUser);
    setLoading(true);

    const unsubscribe = OrderService.getCustomerOrders(currentUser.id, (ordersList) => {
      console.log('📄 Customer orders updated:', ordersList.length);
      console.log('📋 Orders data:', ordersList);
      setOrders(ordersList);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up customer orders listener');
      unsubscribe();
    };
  }, [currentUser]);

  // Filter orders by status
  const filteredOrders = (orders || []).filter(order =>
    selectedStatus === 'all' || order.status === selectedStatus
  );

  // Get status badge with progress
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Order Placed', progress: 10 },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Confirmed', progress: 25 },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Cancelled', progress: 0 },
      preparing: { color: 'bg-orange-100 text-orange-800', label: 'Preparing', progress: 50 },
      ready: { color: 'bg-green-100 text-green-800', label: 'Ready', progress: 75 },
      assigned: { color: 'bg-purple-100 text-purple-800', label: 'Driver Assigned', progress: 80 },
      out_for_delivery: { color: 'bg-indigo-100 text-indigo-800', label: 'Out for Delivery', progress: 90 },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered', progress: 100 },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled', progress: 0 }
    };

    const config = statusConfig[status];
    return { badge: <Badge className={config.color}>{config.label}</Badge>, progress: config.progress };
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // Get order timeline
  const getOrderTimeline = (order: Order) => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', time: order.createdAt, completed: true },
      { status: 'accepted', label: 'Confirmed', time: order.acceptedAt, completed: !!order.acceptedAt },
      { status: 'preparing', label: 'Preparing', time: null, completed: ['preparing', 'readyForPickup', 'assigned', 'out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'readyForPickup', label: 'Ready for Pickup', time: order.readyAt, completed: !!order.readyAt },
      { status: 'out_for_delivery', label: 'Out for Delivery', time: order.assignedAt, completed: ['out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', time: order.deliveredAt, completed: order.status === 'delivered' }
    ];

    return timeline;
  };

  // Show authentication required message if no user
  if (!currentUser) {
    return (
      <div className="p-6 space-y-6">
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600">
              Please log in to view your orders
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track your order status and delivery progress</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={createTestOrder}
            variant="outline"
            size="sm"
            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
          >
            Create Test Order
          </Button>
          <Badge className="bg-blue-100 text-blue-800">
            {orders.length} Total Orders
          </Badge>
          <Badge className="bg-orange-100 text-orange-800">
            {orders.filter(o => ['pending', 'accepted', 'preparing', 'readyForPickup', 'assigned', 'out_for_delivery'].includes(o.status)).length} Active
          </Badge>
        </div>
      </div>

      {/* Status Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'preparing', label: 'Preparing' },
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
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all'
                  ? 'You haven\'t placed any orders yet'
                  : `No ${selectedStatus} orders found`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => {
            const { badge, progress } = getStatusBadge(order.status);
            const timeline = getOrderTimeline(order);

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {badge}
                      <div className="text-right">
                        <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Restaurant Info */}
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <Store className="h-4 w-4 text-orange-600" />
                      {order.restaurantName}
                    </h4>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.restaurantPhone}
                    </p>
                  </div>

                  {/* Delivery Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Delivery Address
                      </h4>
                      <p className="text-sm">
                        {order.deliveryAddress.street}<br />
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                    </div>

                    {order.assignedDriverId && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                          <Truck className="h-4 w-4 text-green-600" />
                          Your Driver
                        </h4>
                        <p className="text-sm font-medium">{order.driverName}</p>
                        <p className="text-sm text-gray-600">{order.driverPhone}</p>
                      </div>
                    )}
                  </div>
                  {/* Order Timeline */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Order Progress</h4>
                    <div className="space-y-3">
                      {timeline.map((step, index) => (
                        <div key={step.status} className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}>
                            {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                              {step.label}
                            </p>
                            {step.time && (
                              <p className="text-xs text-gray-500">
                                {formatDate(step.time)} at {formatTime(step.time)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
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

                    {/* Order Total */}
                    <div className="border-t pt-3 mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>${order.deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax:</span>
                        <span>${order.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-1">
                        <span>Total:</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-4 border-t">
                      {order.assignedDriverId && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${order.driverPhone}`, '_self')}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          Call Driver
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${order.restaurantPhone}`, '_self')}
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Call Restaurant
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

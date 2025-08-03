import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { OrderService, Order, OrderStatus } from '../../services/order';
import { RestaurantService } from '../../services/restaurant';
import { TestOrderCreator } from './TestOrderCreator';
import { RestaurantSetupGuide } from './RestaurantSetupGuide';
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  MapPin,
  DollarSign,
  User,
  ChefHat,
  AlertCircle,
  Package,
  Timer
} from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export const RestaurantOrders: React.FC = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | OrderStatus>('all');
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Fetch available drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const driversQuery = query(
          collection(db, 'users'),
          where('role', '==', 'delivery_rider')
        );
        const snapshot = await getDocs(driversQuery);
        const driversList: Driver[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          driversList.push({
            id: doc.id,
            name: data.name || data.displayName || 'Driver',
            phone: data.phone || '',
            email: data.email || '',
            isActive: data.isActive !== false
          });
        });
        
        setDrivers(driversList);
        console.log('✅ Loaded drivers:', driversList.length);
      } catch (error) {
        console.error('❌ Error fetching drivers:', error);
      }
    };

    fetchDrivers();
  }, []);

  // Get restaurant ID for current user
  useEffect(() => {
    const fetchRestaurantId = async () => {
      if (!currentUser) return;

      try {
        const restaurant = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
        if (restaurant) {
          setRestaurantId(restaurant.id);
          console.log('✅ Found restaurant ID:', restaurant.id);
        } else {
          console.log('❌ No restaurant found for user:', currentUser.id);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error fetching restaurant:', error);
        setLoading(false);
      }
    };

    fetchRestaurantId();
  }, [currentUser]);

  // Listen to restaurant orders
  useEffect(() => {
    if (!restaurantId) return;

    console.log('🔄 Setting up restaurant orders listener for restaurant:', restaurantId);

    const unsubscribe = OrderService.getRestaurantOrders(restaurantId, (ordersList) => {
      console.log('📄 Restaurant orders updated:', ordersList.length);
      setOrders(ordersList);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up restaurant orders listener');
      unsubscribe();
    };
  }, [restaurantId]);

  // Filter orders by status
  const filteredOrders = orders.filter(order => 
    selectedStatus === 'all' || order.status === selectedStatus
  );

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    console.log('🔄 Attempting to update order status:', orderId, status);
    try {
      await OrderService.updateOrderStatus(orderId, status);
      console.log('✅ Order status updated:', orderId, status);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Driver assignment is now handled automatically when drivers claim orders

  // Get status badge
  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      accepted: { color: 'bg-blue-100 text-blue-800', label: 'Accepted' },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      preparing: { color: 'bg-orange-100 text-orange-800', label: 'Preparing' },
      readyForPickup: { color: 'bg-green-100 text-green-800', label: 'Ready for Pickup' },
      assigned: { color: 'bg-purple-100 text-purple-800', label: 'Driver Assigned' },
      out_for_delivery: { color: 'bg-indigo-100 text-indigo-800', label: 'Out for Delivery' },
      delivered: { color: 'bg-green-100 text-green-800', label: 'Delivered' },
      cancelled: { color: 'bg-gray-100 text-gray-800', label: 'Cancelled' }
    };

    const config = statusConfig[status];
    if (!config) {
      console.warn('Unknown order status:', status);
      return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  // Format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate preparation time
  const getTotalPrepTime = (order: Order) => {
    return order.items.reduce((total, item) => Math.max(total, item.preparationTime), 0);
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

  if (!restaurantId) {
    return <RestaurantSetupGuide />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Test Order Creator - Only show if restaurant exists */}
      {restaurantId && <TestOrderCreator />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage incoming orders and track deliveries</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-blue-100 text-blue-800">
            {orders.length} Total Orders
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {orders.filter(o => o.status === 'pending').length} Pending
          </Badge>
          <Badge className="bg-orange-100 text-orange-800">
            {orders.filter(o => o.status === 'preparing').length} Preparing
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
              { value: 'accepted', label: 'Accepted' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'readyForPickup', label: 'Ready for Pickup' },
              { value: 'assigned', label: 'Assigned' },
              { value: 'out_for_delivery', label: 'Out for Delivery' },
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
              <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'No orders have been placed yet' 
                  : `No ${selectedStatus} orders found`
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
                      <CardTitle className="text-lg">Order #{order.orderNumber || 'N/A'}</CardTitle>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {order.createdAt ? formatTime(order.createdAt) : 'N/A'} • Est. {getTotalPrepTime(order)} min
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <p className="font-bold text-lg">${(order.total || 0).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">{(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </h4>
                    <p className="text-sm">{order.customerName}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {order.customerPhone}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h4>
                    <p className="text-sm">
                      {order.deliveryAddress.street}<br />
                      {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                    </p>
                    {order.deliveryAddress.instructions && (
                      <p className="text-xs text-gray-600 mt-1">
                        Note: {order.deliveryAddress.instructions}
                      </p>
                    )}
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
                          <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                        </div>
                      </div>
                    ))}
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

                {/* Driver Info */}
                {order.assignedDriverId && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      Assigned Driver
                    </h4>
                    <p className="text-sm">{order.driverName}</p>
                    <p className="text-sm text-gray-600">{order.driverPhone}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => {
                          console.log('🔘 Accept button clicked for order:', order.id);
                          updateOrderStatus(order.id, 'accepted');
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept Order
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'accepted' && (
                    <Button
                      size="sm"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      <ChefHat className="h-4 w-4 mr-1" />
                      Start Preparing
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      onClick={() => {
                        console.log('📦 Mark Ready for Pickup button clicked for order:', order.id);
                        updateOrderStatus(order.id, 'readyForPickup');
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Package className="h-4 w-4 mr-1" />
                      Mark Ready for Pickup
                    </Button>
                  )}

                  {order.status === 'readyForPickup' && (
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          Waiting for driver to claim
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

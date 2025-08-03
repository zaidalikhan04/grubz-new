import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  Timestamp,
  doc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Order } from '../../services/order';
import { Truck, MapPin, Clock, DollarSign, Navigation, CheckCircle, Star, TrendingUp, Loader2, AlertTriangle, Badge as BadgeIcon, Phone, Settings } from 'lucide-react';
import { makeCurrentUserDriver } from '../../utils/updateUserRole';

interface DriverStats {
  todayDeliveries: number;
  todayEarnings: number;
  averageTime: number;
  rating: number;
  totalDeliveries: number;
  totalEarnings: number;
}

export const DriverDashboardOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DriverStats>({
    todayDeliveries: 0,
    todayEarnings: 0,
    averageTime: 0,
    rating: 4.5,
    totalDeliveries: 0,
    totalEarnings: 0
  });
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  // Real-time data fetching
  useEffect(() => {
    if (!currentUser) return;

    console.log('🔄 Setting up real-time driver dashboard listeners for:', currentUser.id);
    setLoading(true);
    setError(null);

    let loadedCount = 0;
    const totalListeners = 3;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalListeners) {
        setLoading(false);
      }
    };

    // Listen to active orders assigned to this driver
    const activeOrdersQuery = query(
      collection(db, 'orders'),
      where('assignedDriverId', '==', currentUser.id),
      where('status', 'in', ['assigned', 'pickedUp', 'outForDelivery']),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeActive = onSnapshot(
      activeOrdersQuery,
      (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
            actualDeliveryTime: data.actualDeliveryTime?.toDate()
          } as Order);
        });
        
        console.log('📦 Active orders updated:', orders.length);
        setActiveOrders(orders);
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in active orders listener:', error);
        setError('Failed to load active orders');
        checkComplete();
      }
    );

    // Listen to available orders (ready for pickup, no driver assigned)
    const availableOrdersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'readyForPickup'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeAvailable = onSnapshot(
      availableOrdersQuery,
      (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only include orders without assigned driver
          if (!data.assignedDriverId) {
            orders.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
              actualDeliveryTime: data.actualDeliveryTime?.toDate()
            } as Order);
          }
        });
        
        console.log('🚚 Available orders updated:', orders.length);
        setAvailableOrders(orders);
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in available orders listener:', error);
        setError('Failed to load available orders');
        checkComplete();
      }
    );

    // Listen to recent completed orders by this driver
    const recentOrdersQuery = query(
      collection(db, 'orders'),
      where('assignedDriverId', '==', currentUser.id),
      where('status', '==', 'delivered'),
      orderBy('actualDeliveryTime', 'desc')
    );

    const unsubscribeRecent = onSnapshot(
      recentOrdersQuery,
      (querySnapshot) => {
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          orders.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
            actualDeliveryTime: data.actualDeliveryTime?.toDate()
          } as Order);
        });
        
        console.log('✅ Recent orders updated:', orders.length);
        setRecentOrders(orders);
        
        // Calculate stats from recent orders
        calculateStats(orders);
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in recent orders listener:', error);
        setError('Failed to load recent orders');
        checkComplete();
      }
    );

    return () => {
      console.log('🧹 Cleaning up driver dashboard listeners');
      unsubscribeActive();
      unsubscribeAvailable();
      unsubscribeRecent();
    };
  }, [currentUser]);

  // Calculate driver stats from order data
  const calculateStats = (orders: Order[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = order.actualDeliveryTime || order.createdAt;
      return orderDate >= today;
    });

    const todayEarnings = todayOrders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    const totalEarnings = orders.reduce((sum, order) => sum + (order.deliveryFee || 0), 0);
    
    // Calculate average delivery time (simplified)
    const avgTime = orders.length > 0 ? 18 : 0; // Placeholder calculation
    
    setStats({
      todayDeliveries: todayOrders.length,
      todayEarnings,
      averageTime: avgTime,
      rating: 4.5, // This would come from a separate ratings collection
      totalDeliveries: orders.length,
      totalEarnings
    });
  };

  // Claim an available order
  const claimOrder = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        assignedDriverId: currentUser.id,
        driverName: currentUser.name || currentUser.email,
        driverPhone: currentUser.phone || '',
        status: 'assigned',
        assignedAt: Timestamp.now()
      });
      
      console.log('✅ Order claimed successfully:', orderId);
    } catch (error) {
      console.error('❌ Error claiming order:', error);
      alert('Failed to claim order. It may have been taken by another driver.');
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now()
      };
      
      if (newStatus === 'delivered') {
        updateData.actualDeliveryTime = Timestamp.now();
      }
      
      await updateDoc(doc(db, 'orders', orderId), updateData);
      console.log('✅ Order status updated:', orderId, newStatus);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  // Get dynamic stats for display
  const getDynamicStats = () => [
    { 
      title: 'Today\'s Deliveries', 
      value: stats.todayDeliveries.toString(), 
      icon: Truck, 
      color: 'text-blue-600', 
      change: `${stats.totalDeliveries} total` 
    },
    { 
      title: 'Earnings Today', 
      value: `$${stats.todayEarnings.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'text-green-600', 
      change: `$${stats.totalEarnings.toFixed(2)} total` 
    },
    { 
      title: 'Average Time', 
      value: `${stats.averageTime} min`, 
      icon: Clock, 
      color: 'text-purple-600', 
      change: 'Per delivery' 
    },
    { 
      title: 'Rating', 
      value: stats.rating.toString(), 
      icon: Star, 
      color: 'text-orange-600', 
      change: 'Customer rating' 
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading dashboard...</h3>
            <p className="text-gray-600">Getting your latest delivery data</p>

            {/* Debug Information */}
            <div className="bg-gray-100 p-4 rounded-lg mt-6 text-left max-w-md mx-auto">
              <h4 className="font-semibold mb-2">Debug Info:</h4>
              <p className="text-sm">User ID: {currentUser?.id || 'Not logged in'}</p>
              <p className="text-sm">User Role: {currentUser?.role || 'No role'}</p>
              <p className="text-sm">Email: {currentUser?.email || 'No email'}</p>
              <p className="text-sm">Loading: {loading ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to make current user a driver for testing
  const handleMakeDriver = async () => {
    if (!currentUser) return;

    const success = await makeCurrentUserDriver(currentUser.id);
    if (success) {
      alert('User role updated to delivery_rider. Please refresh the page.');
      window.location.reload();
    } else {
      alert('Failed to update user role');
    }
  };

  // Helper function to create test orders
  const createTestOrders = async () => {
    if (!currentUser) return;

    const testOrders = [
      {
        id: 'order-ready-1',
        orderNumber: 'ORD-001',
        customerId: 'customer-1',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        customerEmail: 'john@example.com',
        restaurantId: 'restaurant-1',
        restaurantName: 'Pizza Palace',
        status: 'readyForPickup',
        total: 24.99,
        deliveryFee: 3.99,
        subtotal: 21.00,
        tax: 1.68,
        items: [
          {
            id: 'item-1',
            name: 'Margherita Pizza',
            quantity: 2,
            price: 12.99,
            total: 25.98
          }
        ],
        deliveryAddress: {
          street: '123 Main St, Apt 4B',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          coordinates: { lat: 40.7128, lng: -74.0060 }
        },
        restaurantAddress: {
          street: '456 Restaurant Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002'
        },
        createdAt: Timestamp.now(),
        estimatedDeliveryTime: Timestamp.fromDate(new Date(Date.now() + 30 * 60 * 1000)),
        paymentMethod: 'card',
        paymentStatus: 'paid'
      },
      {
        id: 'order-assigned-1',
        orderNumber: 'ORD-002',
        customerId: 'customer-2',
        customerName: 'Jane Smith',
        customerPhone: '+1234567891',
        customerEmail: 'jane@example.com',
        restaurantId: 'restaurant-2',
        restaurantName: 'Burger House',
        status: 'assigned',
        assignedDriverId: currentUser.id,
        driverName: currentUser.name || currentUser.email,
        driverPhone: currentUser.phone || '',
        assignedAt: Timestamp.now(),
        total: 18.50,
        deliveryFee: 2.99,
        subtotal: 15.51,
        tax: 1.24,
        items: [
          {
            id: 'item-2',
            name: 'Beef Burger',
            quantity: 1,
            price: 12.99,
            total: 12.99
          }
        ],
        deliveryAddress: {
          street: '456 Oak Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10002',
          coordinates: { lat: 40.7589, lng: -73.9851 }
        },
        restaurantAddress: {
          street: '789 Burger St',
          city: 'New York',
          state: 'NY',
          zipCode: '10003'
        },
        createdAt: Timestamp.fromDate(new Date(Date.now() - 10 * 60 * 1000)),
        estimatedDeliveryTime: Timestamp.fromDate(new Date(Date.now() + 25 * 60 * 1000)),
        paymentMethod: 'cash',
        paymentStatus: 'pending'
      }
    ];

    try {
      for (const order of testOrders) {
        await setDoc(doc(db, 'orders', order.id), order);
      }
      alert('Test orders created successfully!');
    } catch (error) {
      console.error('Error creating test orders:', error);
      alert('Failed to create test orders');
    }
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-6">{error}</p>

          {/* Debug Information */}
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-left max-w-md mx-auto">
            <h4 className="font-semibold mb-2">Debug Info:</h4>
            <p className="text-sm">User ID: {currentUser?.id || 'Not logged in'}</p>
            <p className="text-sm">User Role: {currentUser?.role || 'No role'}</p>
            <p className="text-sm">Email: {currentUser?.email || 'No email'}</p>
            <p className="text-sm">Error: {error}</p>
          </div>

          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Retry
            </Button>
            {currentUser && currentUser.role !== 'delivery_rider' && (
              <Button
                onClick={handleMakeDriver}
                className="bg-green-600 hover:bg-green-700"
              >
                Make Me a Driver (Test)
              </Button>
            )}
            {currentUser && (currentUser.role === 'delivery_rider' || currentUser.role === 'admin') && (
              <Button
                onClick={createTestOrders}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Create Test Orders
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const dynamicStats = getDynamicStats();

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Deliveries and Available Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Deliveries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Active Deliveries ({activeOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeOrders.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No active deliveries</p>
                <p className="text-sm text-gray-400">Check available orders to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.restaurantName}</p>
                      </div>
                      <Badge
                        variant={order.status === 'assigned' ? 'default' :
                                order.status === 'pickedUp' ? 'secondary' : 'outline'}
                      >
                        {order.status === 'assigned' ? 'Assigned' :
                         order.status === 'pickedUp' ? 'Picked Up' : 'Out for Delivery'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{order.deliveryAddress.street}, {order.deliveryAddress.city}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">${order.total.toFixed(2)}</span>
                      <div className="flex gap-2">
                        {order.status === 'assigned' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'pickedUp')}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Mark Picked Up
                          </Button>
                        )}
                        {order.status === 'pickedUp' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'outForDelivery')}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Out for Delivery
                          </Button>
                        )}
                        {order.status === 'outForDelivery' && (
                          <Button
                            size="sm"
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Mark Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-green-600" />
              Available Orders ({availableOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {availableOrders.length === 0 ? (
              <div className="text-center py-8">
                <Navigation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders available</p>
                <p className="text-sm text-gray-400">New orders will appear here when ready</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.restaurantName}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Ready for Pickup
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{order.deliveryAddress.street}, {order.deliveryAddress.city}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Clock className="h-4 w-4" />
                      <span>Est. {order.estimatedDeliveryTime.toLocaleTimeString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-green-600">${order.total.toFixed(2)}</span>
                      <Button
                        size="sm"
                        onClick={() => claimOrder(order.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Claim Order
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-purple-600" />
            Recent Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent deliveries</p>
              <p className="text-sm text-gray-400">Your completed deliveries will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.restaurantName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                      {order.actualDeliveryTime?.toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

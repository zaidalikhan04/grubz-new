import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  addDoc,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import {
  ShoppingBag,
  DollarSign,
  ChefHat,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Users,
  Loader2,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  restaurantId: string;
  items: any[];
  total: number;
  status: 'pending' | 'accepted' | 'preparing' | 'ready' | 'pickedUp' | 'delivered' | 'cancelled';
  createdAt: Timestamp;
}

export const RestaurantDashboardTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // Get restaurant ID
  useEffect(() => {
    const getRestaurantId = async () => {
      if (!currentUser) return;
      
      try {
        const restaurantQuery = query(
          collection(db, 'restaurants'),
          where('ownerId', '==', currentUser.id)
        );
        const restaurantSnapshot = await getDocs(restaurantQuery);
        
        if (!restaurantSnapshot.empty) {
          const restaurantDoc = restaurantSnapshot.docs[0];
          setRestaurantId(restaurantDoc.id);
          console.log('✅ Found restaurant:', restaurantDoc.id);
        } else {
          console.log('❌ No restaurant found for user:', currentUser.id);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting restaurant ID:', error);
        setLoading(false);
      }
    };

    getRestaurantId();
  }, [currentUser]);

  // Real-time orders listener
  useEffect(() => {
    if (!restaurantId) return;

    console.log('🔄 Setting up real-time orders listener for restaurant:', restaurantId);

    const ordersQuery = query(
      collection(db, 'orders'),
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersList: Order[] = [];
      snapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      console.log('📊 Real-time orders update:', ordersList.length, 'orders');
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error in orders listener:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Real-time menu items listener
  useEffect(() => {
    if (!restaurantId) return;

    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId)
    );

    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const items: any[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log('🍽️ Real-time menu items update:', items.length, 'items');
      setMenuItems(items);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Create test order
  const createTestOrder = async () => {
    if (!restaurantId || !currentUser) return;

    setIsCreatingOrder(true);
    try {
      const testOrder = {
        orderNumber: `TEST-${Date.now()}`,
        customerId: 'test-customer-id',
        customerName: 'Test Customer',
        restaurantId: restaurantId,
        items: [
          {
            id: 'test-item-1',
            name: 'Test Pizza',
            price: 15.99,
            quantity: 2
          },
          {
            id: 'test-item-2',
            name: 'Test Drink',
            price: 3.99,
            quantity: 1
          }
        ],
        total: 35.97,
        status: 'pending' as const,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      await addDoc(collection(db, 'orders'), testOrder);
      console.log('✅ Test order created successfully');
    } catch (error) {
      console.error('❌ Error creating test order:', error);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayOrders = orders.filter(order => {
    const orderDate = order.createdAt.toDate();
    return orderDate >= today;
  });
  
  const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatTimeAgo = (timestamp: Timestamp): string => {
    const now = new Date();
    const orderTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard test...</p>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Restaurant Found</h3>
        <p className="text-gray-600 mb-4">
          You need to set up your restaurant first to test the dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-500" />
            Restaurant Dashboard Test - Real-time Data
          </CardTitle>
          <p className="text-gray-600">
            Testing real-time data synchronization for restaurant dashboard
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Controls */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
            <Button 
              onClick={createTestOrder}
              disabled={isCreatingOrder}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {isCreatingOrder ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Test Order
                </>
              )}
            </Button>
            <div className="text-sm text-blue-700">
              <p><strong>Restaurant ID:</strong> {restaurantId}</p>
              <p><strong>User:</strong> {currentUser?.email}</p>
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{todayOrders.length}</p>
                  </div>
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Menu Items</p>
                    <p className="text-2xl font-bold text-gray-900">{menuItems.length}</p>
                  </div>
                  <ChefHat className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5" />
                Recent Orders ({orders.length} total)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No orders yet. Create a test order to see real-time updates!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">#{order.orderNumber}</p>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                        <p className="text-sm text-gray-500">{formatTimeAgo(order.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <Badge 
                          className={
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

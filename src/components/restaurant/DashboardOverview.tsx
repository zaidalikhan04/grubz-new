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
  limit,
  Timestamp,
  getDocs
} from 'firebase/firestore';
import {
  ShoppingBag,
  DollarSign,
  ChefHat,
  TrendingUp,
  Clock,
  Eye,
  CheckCircle,
  AlertCircle,
  Package,
  Users,
  Loader2
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
  updatedAt: Timestamp;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  restaurantId: string;
}

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  menuItems: number;
  averageRating: number;
  pendingOrders: number;
  preparingOrders: number;
}

export const DashboardOverview: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    todayOrders: 0,
    todayRevenue: 0,
    menuItems: 0,
    averageRating: 4.5,
    pendingOrders: 0,
    preparingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  // Get restaurant ID for current user
  useEffect(() => {
    const getRestaurantId = async () => {
      if (!currentUser) return;

      try {
        // Check if user has a restaurant
        const restaurantQuery = query(
          collection(db, 'restaurants'),
          where('ownerId', '==', currentUser.id)
        );
        const restaurantSnapshot = await getDocs(restaurantQuery);

        if (!restaurantSnapshot.empty) {
          const restaurantDoc = restaurantSnapshot.docs[0];
          setRestaurantId(restaurantDoc.id);
        } else {
          console.log('No restaurant found for user:', currentUser.id);
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
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const orders: Order[] = [];
      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });

      console.log('📊 Real-time orders update:', orders.length, 'orders');
      setRecentOrders(orders);

      // Calculate today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(order => {
        const orderDate = order.createdAt.toDate();
        return orderDate >= today;
      });

      const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0);
      const pendingOrders = orders.filter(order => order.status === 'pending').length;
      const preparingOrders = orders.filter(order => order.status === 'preparing').length;

      setStats(prev => ({
        ...prev,
        todayOrders: todayOrders.length,
        todayRevenue,
        pendingOrders,
        preparingOrders
      }));

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

    console.log('🔄 Setting up real-time menu items listener for restaurant:', restaurantId);

    const menuQuery = query(
      collection(db, 'menuItems'),
      where('restaurantId', '==', restaurantId)
    );

    const unsubscribe = onSnapshot(menuQuery, (snapshot) => {
      const items: MenuItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as MenuItem);
      });

      console.log('🍽️ Real-time menu items update:', items.length, 'items');
      setMenuItems(items);

      setStats(prev => ({
        ...prev,
        menuItems: items.length
      }));
    }, (error) => {
      console.error('❌ Error in menu items listener:', error);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format time ago
  const formatTimeAgo = (timestamp: Timestamp): string => {
    const now = new Date();
    const orderTime = timestamp.toDate();
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  // Get dynamic stats array
  const getDynamicStats = () => [
    {
      title: 'Today\'s Orders',
      value: stats.todayOrders.toString(),
      change: stats.todayOrders > 0 ? '+' + stats.todayOrders : '0',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Revenue Today',
      value: formatCurrency(stats.todayRevenue),
      change: stats.todayRevenue > 0 ? '+' + formatCurrency(stats.todayRevenue) : '$0',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Menu Items',
      value: stats.menuItems.toString(),
      change: `${menuItems.filter(item => item.available).length} available`,
      icon: ChefHat,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders.toString(),
      change: `${stats.preparingOrders} preparing`,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading dashboard data...</p>
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
          You need to set up your restaurant first to view the dashboard.
        </p>
        <Button className="bg-[#dd3333] hover:bg-[#c52e2e]">
          Set Up Restaurant
        </Button>
      </div>
    );
  }

  const dynamicStats = getDynamicStats();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'New Order'
        };
      case 'accepted':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
          label: 'Accepted'
        };
      case 'preparing':
        return {
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'Preparing'
        };
      case 'ready':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle,
          label: 'Ready for Pickup'
        };
      case 'pickedUp':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: Package,
          label: 'Picked Up'
        };
      case 'delivered':
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: CheckCircle,
          label: 'Delivered'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'Cancelled'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: status
        };
    }
  };

  // Get order items summary
  const getOrderItemsSummary = (items: any[]): string => {
    if (!items || items.length === 0) return 'No items';

    const summary = items.map(item => {
      const quantity = item.quantity || 1;
      const name = item.name || item.menuItemName || 'Unknown Item';
      return quantity > 1 ? `${name} x${quantity}` : name;
    }).join(', ');

    return summary.length > 50 ? summary.substring(0, 50) + '...' : summary;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dynamicStats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-blue-600 font-medium">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Recent Orders
          </CardTitle>
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            View All Orders
          </Button>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600">
                Orders will appear here when customers place them.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const isUrgent = order.status === 'pending' &&
                  (new Date().getTime() - order.createdAt.toDate().getTime()) > 10 * 60 * 1000;

                return (
                  <div
                    key={order.id}
                    className={`flex justify-between items-start p-4 border rounded-lg transition-all hover:shadow-md ${
                      isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">#{order.orderNumber || order.id.slice(-6)}</h4>
                        <span className="text-sm text-gray-500">• {order.customerName || 'Customer'}</span>
                        {isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{getOrderItemsSummary(order.items)}</p>
                      <div className="flex items-center gap-4">
                        <p className="text-sm font-medium text-[#dd3333]">{formatCurrency(order.total)}</p>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{formatTimeAgo(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <statusConfig.icon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

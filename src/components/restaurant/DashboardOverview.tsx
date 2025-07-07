import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  ShoppingBag, 
  DollarSign, 
  ChefHat, 
  TrendingUp, 
  Clock,
  Eye,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const stats = [
    { 
      title: 'Today\'s Orders', 
      value: '47', 
      change: '+12%',
      icon: ShoppingBag, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Revenue Today', 
      value: '$1,234', 
      change: '+8%',
      icon: DollarSign, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Menu Items', 
      value: '28', 
      change: '+2',
      icon: ChefHat, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Rating', 
      value: '4.8', 
      change: '+0.2',
      icon: TrendingUp, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  const recentOrders = [
    { 
      id: '#1234', 
      customer: 'John Doe', 
      items: 'Margherita Pizza x2, Garlic Bread', 
      total: '$24.99', 
      status: 'preparing', 
      time: '5 min ago',
      urgent: false
    },
    { 
      id: '#1235', 
      customer: 'Jane Smith', 
      items: 'Caesar Salad, Garlic Bread', 
      total: '$18.50', 
      status: 'ready', 
      time: '12 min ago',
      urgent: true
    },
    { 
      id: '#1236', 
      customer: 'Mike Johnson', 
      items: 'Pepperoni Pizza', 
      total: '$16.99', 
      status: 'delivered', 
      time: '25 min ago',
      urgent: false
    },
    { 
      id: '#1237', 
      customer: 'Sarah Wilson', 
      items: 'Chicken Alfredo, Breadsticks', 
      total: '$22.99', 
      status: 'new', 
      time: '2 min ago',
      urgent: true
    },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return { 
          color: 'bg-red-100 text-red-800', 
          icon: AlertCircle,
          label: 'New Order'
        };
      case 'preparing':
        return { 
          color: 'bg-yellow-100 text-yellow-800', 
          icon: Clock,
          label: 'Preparing'
        };
      case 'ready':
        return { 
          color: 'bg-blue-100 text-blue-800', 
          icon: CheckCircle,
          label: 'Ready'
        };
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-800', 
          icon: CheckCircle,
          label: 'Delivered'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800', 
          icon: Clock,
          label: status
        };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at your restaurant today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 font-medium">{stat.change} from yesterday</p>
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
          <div className="space-y-4">
            {recentOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div 
                  key={order.id} 
                  className={`flex justify-between items-start p-4 border rounded-lg transition-all hover:shadow-md ${
                    order.urgent ? 'border-red-200 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{order.id}</h4>
                      <span className="text-sm text-gray-500">• {order.customer}</span>
                      {order.urgent && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{order.items}</p>
                    <div className="flex items-center gap-4">
                      <p className="text-sm font-medium text-[#704ce5]">{order.total}</p>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{order.time}</span>
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
        </CardContent>
      </Card>
    </div>
  );
};

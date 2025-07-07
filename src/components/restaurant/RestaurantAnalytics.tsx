import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Star,
  Calendar,
  Clock
} from 'lucide-react';

export const RestaurantAnalytics: React.FC = () => {
  const performanceMetrics = [
    {
      title: 'Total Revenue',
      value: '$12,450',
      change: '+15.3%',
      trend: 'up',
      period: 'This month',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: '1,247',
      change: '+8.2%',
      trend: 'up',
      period: 'This month',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'New Customers',
      value: '156',
      change: '-2.1%',
      trend: 'down',
      period: 'This month',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Average Rating',
      value: '4.8',
      change: '+0.3',
      trend: 'up',
      period: 'This month',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    }
  ];

  const popularItems = [
    { name: 'Margherita Pizza', orders: 89, revenue: '$1,068', trend: '+12%' },
    { name: 'Pepperoni Pizza', orders: 76, revenue: '$1,139', trend: '+8%' },
    { name: 'Caesar Salad', orders: 54, revenue: '$486', trend: '+15%' },
    { name: 'Garlic Bread', orders: 43, revenue: '$258', trend: '-5%' },
    { name: 'Chicken Alfredo', orders: 38, revenue: '$494', trend: '+22%' }
  ];

  const recentActivity = [
    { time: '2:45 PM', event: 'New order received', details: 'Order #1245 - $24.99' },
    { time: '2:30 PM', event: 'Order completed', details: 'Order #1244 delivered successfully' },
    { time: '2:15 PM', event: 'Menu item updated', details: 'Garlic Bread marked as out of stock' },
    { time: '2:00 PM', event: 'New customer review', details: '5-star review from John D.' },
    { time: '1:45 PM', event: 'Order cancelled', details: 'Order #1243 cancelled by customer' }
  ];

  const weeklyData = [
    { day: 'Mon', orders: 45, revenue: 540 },
    { day: 'Tue', orders: 52, revenue: 624 },
    { day: 'Wed', orders: 48, revenue: 576 },
    { day: 'Thu', orders: 61, revenue: 732 },
    { day: 'Fri', orders: 78, revenue: 936 },
    { day: 'Sat', orders: 85, revenue: 1020 },
    { day: 'Sun', orders: 67, revenue: 804 }
  ];

  const maxOrders = Math.max(...weeklyData.map(d => d.orders));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your restaurant's performance and insights</p>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                    <span className="text-sm text-gray-500">{metric.period}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">{day.orders} orders</span>
                      <span className="text-sm font-medium text-[#704ce5]">${day.revenue}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#704ce5] h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(day.orders / maxOrders) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">{item.orders} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#704ce5]">{item.revenue}</p>
                    <p className={`text-sm ${
                      item.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {item.trend}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 p-3 border-l-2 border-gray-200 hover:border-[#704ce5] transition-colors">
                <div className="w-2 h-2 bg-[#704ce5] rounded-full mt-2" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{activity.event}</h4>
                    <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
                  <p className="text-sm text-gray-600">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

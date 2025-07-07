import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  ShoppingBag, 
  Truck,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

export const PlatformAnalytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);

  const overviewStats = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Total Orders',
      value: '45,678',
      change: '+12.8%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Users',
      value: '12,543',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Delivery Success Rate',
      value: '98.5%',
      change: '-0.3%',
      trend: 'down',
      icon: Truck,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  const revenueData = [
    { period: 'Jan', revenue: 180000, orders: 3200 },
    { period: 'Feb', revenue: 195000, orders: 3450 },
    { period: 'Mar', revenue: 210000, orders: 3800 },
    { period: 'Apr', revenue: 225000, orders: 4100 },
    { period: 'May', revenue: 240000, orders: 4350 },
    { period: 'Jun', revenue: 255000, orders: 4600 },
  ];

  const topRestaurants = [
    { name: 'Pizza Palace', orders: 1234, revenue: '$45,678', rating: 4.8 },
    { name: 'Burger Express', orders: 987, revenue: '$32,145', rating: 4.6 },
    { name: 'Sushi Master', orders: 856, revenue: '$28,934', rating: 4.9 },
    { name: 'Taco Fiesta', orders: 743, revenue: '$21,567', rating: 4.4 },
    { name: 'Italian Bistro', orders: 692, revenue: '$19,823', rating: 4.7 },
  ];

  const userGrowth = [
    { month: 'Jan', customers: 8500, restaurants: 180, drivers: 320 },
    { month: 'Feb', customers: 9200, restaurants: 195, drivers: 345 },
    { month: 'Mar', customers: 9800, restaurants: 210, drivers: 380 },
    { month: 'Apr', customers: 10500, restaurants: 225, drivers: 410 },
    { month: 'May', customers: 11200, restaurants: 240, drivers: 435 },
    { month: 'Jun', customers: 12000, restaurants: 255, drivers: 456 },
  ];

  const orderMetrics = {
    averageOrderValue: '$28.50',
    averageDeliveryTime: '32 min',
    customerSatisfaction: '4.6/5',
    repeatCustomerRate: '68%'
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const exportData = () => {
    console.log('Exporting analytics data...');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Platform Analytics</h1>
          <p className="text-gray-600">Comprehensive insights into platform performance and growth</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={exportData}
            className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium">Time Period:</span>
        <div className="flex gap-1">
          {['week', 'month', 'quarter', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'bg-gray-900 hover:bg-gray-800' : ''}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Revenue & Orders Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium w-12">{data.period}</span>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full"
                          style={{ width: `${(data.revenue / 300000) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-20">
                        ${(data.revenue / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600 w-16">{data.orders} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Restaurants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Restaurants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRestaurants.map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">{restaurant.name}</h4>
                      <p className="text-sm text-gray-600">{restaurant.orders} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{restaurant.revenue}</p>
                    <p className="text-sm text-gray-600">★ {restaurant.rating}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Growth by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Month</th>
                  <th className="text-left p-3 font-medium">Customers</th>
                  <th className="text-left p-3 font-medium">Restaurants</th>
                  <th className="text-left p-3 font-medium">Drivers</th>
                  <th className="text-left p-3 font-medium">Total Growth</th>
                </tr>
              </thead>
              <tbody>
                {userGrowth.map((data, index) => {
                  const prevData = index > 0 ? userGrowth[index - 1] : data;
                  const totalGrowth = ((data.customers + data.restaurants + data.drivers) - 
                                     (prevData.customers + prevData.restaurants + prevData.drivers)) / 
                                     (prevData.customers + prevData.restaurants + prevData.drivers) * 100;
                  
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{data.month}</td>
                      <td className="p-3">{data.customers.toLocaleString()}</td>
                      <td className="p-3">{data.restaurants.toLocaleString()}</td>
                      <td className="p-3">{data.drivers.toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`flex items-center gap-1 ${
                          totalGrowth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {totalGrowth > 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {index > 0 ? `${totalGrowth.toFixed(1)}%` : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-600 mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold text-gray-900">{orderMetrics.averageOrderValue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-600 mb-2">Avg Delivery Time</h3>
            <p className="text-3xl font-bold text-blue-600">{orderMetrics.averageDeliveryTime}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-600 mb-2">Customer Satisfaction</h3>
            <p className="text-3xl font-bold text-yellow-600">{orderMetrics.customerSatisfaction}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-600 mb-2">Repeat Customer Rate</h3>
            <p className="text-3xl font-bold text-green-600">{orderMetrics.repeatCustomerRate}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

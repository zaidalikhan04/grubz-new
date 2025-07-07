import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Users, 
  Store, 
  Truck, 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  ShoppingBag
} from 'lucide-react';

interface AdminDashboardOverviewProps {
  onPageChange: (page: string) => void;
}

export const AdminDashboardOverview: React.FC<AdminDashboardOverviewProps> = ({ onPageChange }) => {
  const stats = [
    { 
      title: 'Total Users', 
      value: '12,543', 
      change: '+234 this week',
      icon: Users, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      title: 'Active Restaurants', 
      value: '1,234', 
      change: '+12 this week',
      icon: Store, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      title: 'Delivery Riders', 
      value: '456', 
      change: '+8 this week',
      icon: Truck, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    { 
      title: 'Total Revenue', 
      value: '$2.4M', 
      change: '+15% this month',
      icon: DollarSign, 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
  ];

  const recentActivity = [
    { type: 'user', message: 'New restaurant "Pizza Palace" registered', time: '5 min ago', status: 'pending' },
    { type: 'order', message: '1,234 orders completed today', time: '1 hour ago', status: 'success' },
    { type: 'issue', message: 'Payment issue reported by 3 users', time: '2 hours ago', status: 'warning' },
    { type: 'driver', message: 'New driver "John Doe" approved', time: '3 hours ago', status: 'success' },
    { type: 'system', message: 'System maintenance completed', time: '1 day ago', status: 'info' },
  ];

  const pendingApprovals = [
    { id: 1, type: 'Restaurant', name: 'Burger Express', submitted: '2 hours ago', priority: 'high' },
    { id: 2, type: 'Driver', name: 'Sarah Wilson', submitted: '4 hours ago', priority: 'medium' },
    { id: 3, type: 'Restaurant', name: 'Sushi Master', submitted: '1 day ago', priority: 'low' },
    { id: 4, type: 'Driver', name: 'Mike Johnson', submitted: '2 days ago', priority: 'medium' },
  ];

  const quickActions = [
    { label: 'Manage Users', icon: Users, action: () => onPageChange('users'), color: 'bg-gray-800' },
    { label: 'Restaurant Approvals', icon: Store, action: () => onPageChange('restaurants'), color: 'bg-gray-700' },
    { label: 'View Analytics', icon: BarChart3, action: () => onPageChange('analytics'), color: 'bg-gray-600' },
    { label: 'System Settings', icon: BarChart3, action: () => onPageChange('settings'), color: 'bg-gray-900' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'order': return <ShoppingBag className="h-4 w-4" />;
      case 'issue': return <AlertTriangle className="h-4 w-4" />;
      case 'driver': return <Truck className="h-4 w-4" />;
      case 'system': return <BarChart3 className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'pending': return 'text-blue-600 bg-blue-100';
      case 'info': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-gray-900 bg-gray-200';
      case 'medium': return 'text-gray-700 bg-gray-100';
      case 'low': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Grubz Admin Portal</h1>
        <p className="text-gray-200">Manage your food delivery platform with comprehensive tools and analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`w-full justify-start gap-3 ${action.color} hover:opacity-90`}
              >
                <action.icon className="h-4 w-4" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Pending Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pending Approvals</CardTitle>
            <Button variant="outline" size="sm" onClick={() => onPageChange('restaurants')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    <p className="text-xs text-gray-600">{item.type} • {item.submitted}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs">
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium">System Status</h3>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-blue-100">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Platform Growth</h3>
                <p className="text-sm text-blue-600">+15% this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-yellow-100">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium">Average Rating</h3>
                <p className="text-sm text-yellow-600">4.8/5.0 stars</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

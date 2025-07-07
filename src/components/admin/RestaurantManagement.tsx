import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';
import {
  Store,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp
} from 'lucide-react';

export const RestaurantManagement: React.FC = () => {
  const { addNotification } = useAdminNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const restaurants = [
    {
      id: '1',
      name: 'Pizza Palace',
      owner: 'John Smith',
      email: 'owner@pizzapalace.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State',
      category: 'Italian',
      status: 'active',
      rating: 4.8,
      totalOrders: 1234,
      revenue: '$45,678',
      joinDate: '2023-12-15',
      lastActive: '2 hours ago',
      commission: 15,
      documents: ['license', 'permit', 'insurance']
    },
    {
      id: '2',
      name: 'Burger Express',
      owner: 'Sarah Johnson',
      email: 'sarah@burgerexpress.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Ave, City, State',
      category: 'American',
      status: 'pending',
      rating: 0,
      totalOrders: 0,
      revenue: '$0',
      joinDate: '2024-01-20',
      lastActive: '1 day ago',
      commission: 15,
      documents: ['license', 'permit']
    },
    {
      id: '3',
      name: 'Sushi Master',
      owner: 'Takeshi Yamamoto',
      email: 'info@sushimaster.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine St, City, State',
      category: 'Japanese',
      status: 'active',
      rating: 4.9,
      totalOrders: 856,
      revenue: '$32,145',
      joinDate: '2023-11-10',
      lastActive: '30 min ago',
      commission: 15,
      documents: ['license', 'permit', 'insurance', 'health']
    },
    {
      id: '4',
      name: 'Taco Fiesta',
      owner: 'Maria Rodriguez',
      email: 'maria@tacofiesta.com',
      phone: '+1 (555) 456-7890',
      address: '321 Elm St, City, State',
      category: 'Mexican',
      status: 'suspended',
      rating: 3.2,
      totalOrders: 234,
      revenue: '$8,456',
      joinDate: '2023-10-05',
      lastActive: '1 week ago',
      commission: 15,
      documents: ['license']
    }
  ];

  const filteredRestaurants = restaurants.filter(restaurant => {
    const matchesSearch = restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         restaurant.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || restaurant.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || restaurant.category === selectedCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'rejected': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleApproveRestaurant = (restaurantId: string) => {
    console.log('Approving restaurant:', restaurantId);
    addNotification({
      type: 'restaurant_approval',
      title: 'Restaurant Approved',
      message: `Restaurant application ${restaurantId} has been approved and is now active`,
      priority: 'medium',
      actionUrl: '/admin/restaurants',
      actionLabel: 'View Restaurant'
    });
  };

  const handleRejectRestaurant = (restaurantId: string) => {
    if (confirm('Are you sure you want to reject this restaurant application?')) {
      console.log('Rejecting restaurant:', restaurantId);
      addNotification({
        type: 'restaurant_approval',
        title: 'Restaurant Application Rejected',
        message: `Restaurant application ${restaurantId} has been rejected`,
        priority: 'low',
        actionUrl: '/admin/restaurants',
        actionLabel: 'View Details'
      });
    }
  };

  const handleSuspendRestaurant = (restaurantId: string) => {
    if (confirm('Are you sure you want to suspend this restaurant?')) {
      console.log('Suspending restaurant:', restaurantId);
      addNotification({
        type: 'restaurant_approval',
        title: 'Restaurant Suspended',
        message: `Restaurant ${restaurantId} has been suspended due to policy violations`,
        priority: 'high',
        actionUrl: '/admin/restaurants',
        actionLabel: 'View Restaurant'
      });
    }
  };

  const handleEditRestaurant = (restaurant: any) => {
    console.log('Editing restaurant:', restaurant);
  };

  const handleViewDetails = (restaurant: any) => {
    console.log('Viewing restaurant details:', restaurant);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Restaurant Management</h1>
          <p className="text-gray-600">Manage restaurant applications, approvals, and operations</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Restaurant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{restaurants.length}</div>
                <div className="text-sm text-gray-600">Total Restaurants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{restaurants.filter(r => r.status === 'active').length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{restaurants.filter(r => r.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  ${restaurants.reduce((sum, r) => sum + parseInt(r.revenue.replace(/[$,]/g, '')), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search restaurants by name or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Categories</option>
                <option value="Italian">Italian</option>
                <option value="American">American</option>
                <option value="Japanese">Japanese</option>
                <option value="Mexican">Mexican</option>
                <option value="Chinese">Chinese</option>
                <option value="Indian">Indian</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Restaurants Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Restaurants ({filteredRestaurants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Restaurant</th>
                  <th className="text-left p-3 font-medium">Owner</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Orders</th>
                  <th className="text-left p-3 font-medium">Revenue</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Store className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {restaurant.address}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {restaurant.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>
                        <div className="font-medium">{restaurant.owner}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {restaurant.email}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {restaurant.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(restaurant.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(restaurant.status)}`}>
                          {restaurant.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{restaurant.rating}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{restaurant.totalOrders.toLocaleString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-green-600">{restaurant.revenue}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(restaurant)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRestaurant(restaurant)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {restaurant.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveRestaurant(restaurant.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRestaurant(restaurant.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {restaurant.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendRestaurant(restaurant.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

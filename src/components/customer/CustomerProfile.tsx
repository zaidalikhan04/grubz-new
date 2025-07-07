import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  User, 
  Camera, 
  Edit, 
  Save, 
  MapPin, 
  Phone, 
  Mail, 
  Star,
  ShoppingBag,
  Heart,
  Award,
  TrendingUp,
  Clock
} from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Apt 4B, Downtown, City 12345',
    dateJoined: 'January 2023'
  });

  const stats = [
    { label: 'Total Orders', value: '47', icon: ShoppingBag, color: 'text-blue-600' },
    { label: 'Favorite Restaurants', value: '8', icon: Heart, color: 'text-red-600' },
    { label: 'Average Rating Given', value: '4.6', icon: Star, color: 'text-yellow-600' },
    { label: 'Money Saved', value: '$127', icon: TrendingUp, color: 'text-green-600' }
  ];

  const recentOrders = [
    {
      id: '#ORD-1234',
      restaurant: "Mario's Italian Kitchen",
      items: ['Margherita Pizza x2', 'Caesar Salad x1'],
      total: 34.97,
      date: '2 days ago',
      status: 'delivered',
      rating: 5,
      image: '🍕'
    },
    {
      id: '#ORD-1233',
      restaurant: "Burger Palace",
      items: ['Classic Burger x1', 'Fries x1'],
      total: 18.97,
      date: '1 week ago',
      status: 'delivered',
      rating: 4,
      image: '🍔'
    },
    {
      id: '#ORD-1232',
      restaurant: "Sushi Express",
      items: ['Salmon Roll x2', 'Miso Soup x1'],
      total: 21.97,
      date: '2 weeks ago',
      status: 'delivered',
      rating: 5,
      image: '🍣'
    }
  ];

  const favoriteRestaurants = [
    { name: "Mario's Italian Kitchen", cuisine: 'Italian', orders: 12, image: '🍕' },
    { name: "Sushi Express", cuisine: 'Japanese', orders: 8, image: '🍣' },
    { name: "Burger Palace", cuisine: 'American', orders: 6, image: '🍔' },
    { name: "Taco Fiesta", cuisine: 'Mexican', orders: 4, image: '🌮' }
  ];

  const achievements = [
    { title: 'Foodie Explorer', description: 'Ordered from 10+ different restaurants', icon: Award },
    { title: 'Regular Customer', description: 'Placed 25+ orders', icon: ShoppingBag },
    { title: 'Review Master', description: 'Left 20+ helpful reviews', icon: Star },
    { title: 'Early Bird', description: 'Member for over 1 year', icon: Clock }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your Grubber activity</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2"
        >
          {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.name.charAt(0)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:text-gray-800"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.name}</h3>
                  <p className="text-gray-600">Grubber since {profileData.dateJoined}</p>
                  <Badge className="bg-[#dd3333] text-white mt-1">Premium Member</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Default Delivery Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Orders</CardTitle>
              <Button variant="outline" size="sm">View All Orders</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-lg">
                        {order.image}
                      </div>
                      <div>
                        <h4 className="font-medium">{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.restaurant}</p>
                        <p className="text-xs text-gray-500">{order.items.join(', ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#dd3333]">${order.total.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{order.date}</p>
                      {renderStarRating(order.rating)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Achievements */}
        <div className="space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50">
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Favorite Restaurants */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Restaurants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {favoriteRestaurants.map((restaurant, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{restaurant.image}</div>
                    <div>
                      <h4 className="text-sm font-medium">{restaurant.name}</h4>
                      <p className="text-xs text-gray-500">{restaurant.cuisine}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{restaurant.orders} orders</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                  <div className="p-1 bg-[#dd3333] rounded-full">
                    <achievement.icon className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{achievement.title}</h4>
                    <p className="text-xs text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

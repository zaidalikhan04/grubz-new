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
  Clock,
  Star,
  Award,
  TrendingUp,
  Users
} from 'lucide-react';

export const RestaurantProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    restaurantName: 'Mario\'s Italian Kitchen',
    ownerName: 'Mario Rossi',
    email: 'mario@mariositalian.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, Downtown, City 12345',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes passed down through generations.',
    cuisine: 'Italian',
    priceRange: '$$',
    established: '2015'
  });

  const stats = [
    { label: 'Total Orders', value: '2,847', icon: TrendingUp, color: 'text-blue-600' },
    { label: 'Customer Rating', value: '4.8', icon: Star, color: 'text-yellow-600' },
    { label: 'Total Reviews', value: '324', icon: Users, color: 'text-green-600' },
    { label: 'Years Active', value: '9', icon: Award, color: 'text-purple-600' }
  ];

  const achievements = [
    { title: 'Top Rated Restaurant', description: 'Maintained 4.5+ rating for 6 months', icon: Star },
    { title: 'Fast Delivery', description: 'Average delivery time under 30 minutes', icon: Clock },
    { title: 'Customer Favorite', description: 'Over 1000 repeat customers', icon: Users },
    { title: 'Quality Excellence', description: 'Zero food safety violations', icon: Award }
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile:', profileData);
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Profile</h1>
          <p className="text-gray-600">Manage your restaurant information and public profile</p>
        </div>
        <Button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2"
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
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#704ce5] to-[#5a3bc4] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profileData.restaurantName.charAt(0)}
                  </div>
                  <Button
                    size="sm"
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white border-2 border-gray-200 text-gray-600 hover:text-gray-800"
                  >
                    <Camera className="h-3 w-3" />
                  </Button>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.restaurantName}</h3>
                  <p className="text-gray-600">{profileData.cuisine} Restaurant</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-green-100 text-green-800">Open</Badge>
                    <Badge className="bg-blue-100 text-blue-800">{profileData.priceRange}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
                  <Input
                    value={profileData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name</label>
                  <Input
                    value={profileData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
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
                  Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#704ce5] focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  rows={3}
                  value={profileData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  disabled={!isEditing}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Type</label>
                  <Input
                    value={profileData.cuisine}
                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <Input
                    value={profileData.priceRange}
                    onChange={(e) => handleInputChange('priceRange', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                  <Input
                    value={profileData.established}
                    onChange={(e) => handleInputChange('established', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics and Achievements */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-50`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
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
                <div key={index} className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="p-1 bg-yellow-100 rounded-full">
                    <achievement.icon className="h-3 w-3 text-yellow-600" />
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

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Store, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  DollarSign,
  Truck,
  Bell,
  Shield,
  Save
} from 'lucide-react';

export const RestaurantSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    restaurantName: 'Mario\'s Italian Kitchen',
    description: 'Authentic Italian cuisine with fresh ingredients and traditional recipes',
    address: '123 Main Street, Downtown',
    phone: '+1 (555) 123-4567',
    email: 'contact@mariositalian.com',
    minimumOrder: '15.00',
    deliveryFee: '3.99',
    deliveryRadius: '5',
    estimatedDeliveryTime: '30-45',
    isOpen: true,
    acceptingOrders: true,
    notifications: {
      newOrders: true,
      orderUpdates: true,
      customerReviews: true,
      promotions: false
    }
  });

  const operatingHours = [
    { day: 'Monday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Tuesday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Wednesday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Thursday', open: '11:00', close: '22:00', isOpen: true },
    { day: 'Friday', open: '11:00', close: '23:00', isOpen: true },
    { day: 'Saturday', open: '10:00', close: '23:00', isOpen: true },
    { day: 'Sunday', open: '12:00', close: '21:00', isOpen: false }
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Restaurant Settings</h1>
          <p className="text-gray-600">Manage your restaurant information and preferences</p>
        </div>
        <Button onClick={handleSave} className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Restaurant Name</label>
              <Input
                value={settings.restaurantName}
                onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                placeholder="Enter restaurant name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#704ce5] focus:border-transparent"
                rows={3}
                value={settings.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address
              </label>
              <Input
                value={settings.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Restaurant address"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                <Input
                  value={settings.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                <Input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Contact email"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Minimum Order ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.minimumOrder}
                  onChange={(e) => handleInputChange('minimumOrder', e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={settings.deliveryFee}
                  onChange={(e) => handleInputChange('deliveryFee', e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Radius (miles)</label>
                <Input
                  type="number"
                  value={settings.deliveryRadius}
                  onChange={(e) => handleInputChange('deliveryRadius', e.target.value)}
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Est. Delivery Time (min)
                </label>
                <Input
                  value={settings.estimatedDeliveryTime}
                  onChange={(e) => handleInputChange('estimatedDeliveryTime', e.target.value)}
                  placeholder="30-45"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Restaurant Status</span>
                <Badge className={settings.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {settings.isOpen ? 'Open' : 'Closed'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Accepting Orders</span>
                <Badge className={settings.acceptingOrders ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {settings.acceptingOrders ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operatingHours.map((schedule, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 w-20">{schedule.day}</span>
                  <Badge className={schedule.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {schedule.isOpen ? 'Open' : 'Closed'}
                  </Badge>
                </div>
                {schedule.isOpen && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={schedule.open}
                      className="w-24"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={schedule.close}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'newOrders' && 'Get notified when new orders are received'}
                    {key === 'orderUpdates' && 'Receive updates on order status changes'}
                    {key === 'customerReviews' && 'Get notified about new customer reviews'}
                    {key === 'promotions' && 'Receive promotional and marketing updates'}
                  </p>
                </div>
                <Button
                  variant={value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange(key, !value)}
                  className={value ? 'bg-[#704ce5] hover:bg-[#5a3bc4]' : ''}
                >
                  {value ? 'On' : 'Off'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

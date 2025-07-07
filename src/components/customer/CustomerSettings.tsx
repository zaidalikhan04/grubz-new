import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  User, 
  Bell, 
  MapPin, 
  CreditCard, 
  Shield, 
  Globe,
  Save,
  Plus,
  Edit,
  Trash2,
  Check,
  X
} from 'lucide-react';

export const CustomerSettings: React.FC = () => {
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: false,
    newRestaurants: true,
    weeklyDigest: false,
    smsNotifications: true,
    emailNotifications: true
  });

  const [addresses, setAddresses] = useState([
    {
      id: 1,
      label: 'Home',
      address: '123 Main Street, Apt 4B',
      city: 'Downtown, City 12345',
      isDefault: true
    },
    {
      id: 2,
      label: 'Work',
      address: '456 Business Ave, Suite 200',
      city: 'Business District, City 12345',
      isDefault: false
    }
  ]);

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      isDefault: true
    },
    {
      id: 2,
      type: 'card',
      last4: '8888',
      brand: 'Mastercard',
      isDefault: false
    }
  ]);

  const [preferences, setPreferences] = useState({
    language: 'English',
    currency: 'USD',
    dietaryRestrictions: ['Vegetarian'],
    allergies: ['Nuts'],
    defaultTip: '18%'
  });

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const setDefaultAddress = (addressId: number) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId
    })));
  };

  const removeAddress = (addressId: number) => {
    setAddresses(prev => prev.filter(addr => addr.id !== addressId));
  };

  const setDefaultPayment = (paymentId: number) => {
    setPaymentMethods(prev => prev.map(payment => ({
      ...payment,
      isDefault: payment.id === paymentId
    })));
  };

  const removePayment = (paymentId: number) => {
    setPaymentMethods(prev => prev.filter(payment => payment.id !== paymentId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account preferences and settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {key === 'orderUpdates' && 'Get notified about your order status'}
                    {key === 'promotions' && 'Receive promotional offers and discounts'}
                    {key === 'newRestaurants' && 'Learn about new restaurants in your area'}
                    {key === 'weeklyDigest' && 'Weekly summary of your orders and favorites'}
                    {key === 'smsNotifications' && 'Receive SMS notifications'}
                    {key === 'emailNotifications' && 'Receive email notifications'}
                  </p>
                </div>
                <Button
                  variant={value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleNotificationChange(key, !value)}
                  className={value ? 'bg-[#dd3333] hover:bg-[#c52e2e]' : ''}
                >
                  {value ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Account Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Globe className="inline h-4 w-4 mr-1" />
                Language
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dd3333] focus:border-transparent">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dd3333] focus:border-transparent">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
                <option>CAD (C$)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Tip</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dd3333] focus:border-transparent">
                <option>15%</option>
                <option>18%</option>
                <option>20%</option>
                <option>25%</option>
                <option>Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
              <div className="flex flex-wrap gap-2">
                {['Vegetarian', 'Vegan', 'Gluten-Free', 'Halal', 'Kosher'].map((diet) => (
                  <Badge
                    key={diet}
                    className={`cursor-pointer ${
                      preferences.dietaryRestrictions.includes(diet)
                        ? 'bg-[#dd3333] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delivery Addresses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Delivery Addresses
          </CardTitle>
          <Button size="sm" className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{address.label}</h4>
                    {address.isDefault && (
                      <Badge className="bg-[#dd3333] text-white text-xs">Default</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{address.address}</p>
                  <p className="text-sm text-gray-500">{address.city}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultAddress(address.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeAddress(address.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods
          </CardTitle>
          <Button size="sm" className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    {payment.brand.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900">
                        {payment.brand} •••• {payment.last4}
                      </h4>
                      {payment.isDefault && (
                        <Badge className="bg-[#dd3333] text-white text-xs">Default</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Expires 12/25</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!payment.isDefault && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setDefaultPayment(payment.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button size="sm" variant="ghost">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removePayment(payment.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
            <Button variant="outline" size="sm">
              Enable
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Data Export</h4>
              <p className="text-sm text-gray-600">Download a copy of your data</p>
            </div>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Delete Account</h4>
              <p className="text-sm text-gray-600">Permanently delete your account and data</p>
            </div>
            <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DataInitializer } from '../../services/dataInitializer';
import { UserService, RestaurantService, OrderService, DriverService } from '../../services/database';
import { 
  Database, 
  Users, 
  Store, 
  Truck, 
  ShoppingBag, 
  RefreshCw, 
  Download, 
  Upload,
  Trash2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export const DataManager: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    users: 0,
    restaurants: 0,
    orders: 0,
    drivers: 0
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [users, restaurants, orders, drivers] = await Promise.all([
        UserService.getAllUsers(),
        RestaurantService.getAllRestaurants(),
        OrderService.getAll('orders'),
        DriverService.getAllDrivers()
      ]);

      setStats({
        users: users.length,
        restaurants: restaurants.length,
        orders: orders.length,
        drivers: drivers.length
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      showMessage('error', 'Failed to load database statistics');
    }
  };

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleInitializeSampleData = async () => {
    setIsLoading(true);
    try {
      await DataInitializer.initializeSampleData();
      await loadStats();
      showMessage('success', 'Sample data initialized successfully!');
    } catch (error) {
      console.error('Error initializing sample data:', error);
      showMessage('error', 'Failed to initialize sample data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleUsers = async () => {
    setIsLoading(true);
    try {
      await DataInitializer.createSampleUsers();
      await loadStats();
      showMessage('success', 'Sample users created successfully!');
    } catch (error) {
      console.error('Error creating sample users:', error);
      showMessage('error', 'Failed to create sample users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSampleRestaurants = async () => {
    setIsLoading(true);
    try {
      await DataInitializer.createSampleRestaurants();
      await loadStats();
      showMessage('success', 'Sample restaurants created successfully!');
    } catch (error) {
      console.error('Error creating sample restaurants:', error);
      showMessage('error', 'Failed to create sample restaurants');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Test Firebase connection by trying to read users
      await UserService.getAllUsers();
      showMessage('success', 'Firebase connection successful!');
    } catch (error) {
      console.error('Firebase connection error:', error);
      showMessage('error', 'Firebase connection failed. Check your configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    setIsLoading(true);
    try {
      const [users, restaurants, orders, drivers] = await Promise.all([
        UserService.getAllUsers(),
        RestaurantService.getAllRestaurants(),
        OrderService.getAll('orders'),
        DriverService.getAllDrivers()
      ]);

      const data = {
        users,
        restaurants,
        orders,
        drivers,
        exportDate: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `grubz-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showMessage('success', 'Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      showMessage('error', 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Firebase Data Manager</h1>
          <p className="text-gray-600">Manage your Firebase database and initialize sample data</p>
        </div>
        <Button
          onClick={loadStats}
          disabled={isLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {message.type === 'success' && <CheckCircle className="h-5 w-5" />}
          {message.type === 'error' && <AlertTriangle className="h-5 w-5" />}
          {message.type === 'info' && <Database className="h-5 w-5" />}
          {message.text}
        </div>
      )}

      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.users}</div>
                <div className="text-sm text-gray-600">Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Store className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{stats.restaurants}</div>
                <div className="text-sm text-gray-600">Restaurants</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{stats.orders}</div>
                <div className="text-sm text-gray-600">Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{stats.drivers}</div>
                <div className="text-sm text-gray-600">Drivers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleTestConnection}
                disabled={isLoading}
                className="w-full bg-gray-900 hover:bg-gray-800"
              >
                Test Firebase Connection
              </Button>
              
              <Button
                onClick={handleInitializeSampleData}
                disabled={isLoading}
                className="w-full bg-gray-700 hover:bg-gray-600"
              >
                Initialize All Sample Data
              </Button>
              
              <div className="text-sm text-gray-600">
                This will create sample users, restaurants, drivers, and orders for testing.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Individual Data Creation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={handleCreateSampleUsers}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Create Sample Users
              </Button>
              
              <Button
                onClick={handleCreateSampleRestaurants}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Create Sample Restaurants
              </Button>
              
              <Button
                onClick={() => DataInitializer.createSampleDrivers()}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Create Sample Drivers
              </Button>
              
              <Button
                onClick={() => DataInitializer.createSampleOrders()}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                Create Sample Orders
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={exportData}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export All Data
            </Button>
            
            <Button
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Open Firebase Console
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Important Notes:</p>
                <ul className="mt-1 list-disc list-inside space-y-1">
                  <li>Make sure your Firebase project is properly configured</li>
                  <li>Check that Firestore security rules allow read/write access</li>
                  <li>Sample data includes test accounts with password "password123"</li>
                  <li>Use Firebase Console for advanced data management</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

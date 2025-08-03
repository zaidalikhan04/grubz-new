import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { createTestOrder, createMultipleTestOrders } from '../../utils/createTestOrder';
import { useAuth } from '../../contexts/AuthContext';
import { RestaurantService } from '../../services/restaurant';
import { Loader2, Plus, Package } from 'lucide-react';

export const TestOrderCreator: React.FC = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>('');

  const handleCreateSingleOrder = async () => {
    if (!currentUser) return;

    setLoading(true);
    setMessage('');

    try {
      // Get restaurant ID for current user
      const restaurant = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
      if (!restaurant) {
        setMessage('❌ No restaurant found. Please set up your restaurant first.');
        return;
      }

      await createTestOrder(restaurant.id);
      setMessage('✅ Test order created successfully!');
    } catch (error) {
      console.error('Error creating test order:', error);
      setMessage('❌ Failed to create test order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMultipleOrders = async () => {
    if (!currentUser) return;

    setLoading(true);
    setMessage('');

    try {
      // Get restaurant ID for current user
      const restaurant = await RestaurantService.getRestaurantByOwnerId(currentUser.id);
      if (!restaurant) {
        setMessage('❌ No restaurant found. Please set up your restaurant first.');
        return;
      }

      const orders = await createMultipleTestOrders(restaurant.id);
      setMessage(`✅ Created ${orders.length} test orders successfully!`);
    } catch (error) {
      console.error('Error creating test orders:', error);
      setMessage('❌ Failed to create test orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Test Order Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Create test orders to test the restaurant dashboard functionality.
          </p>
          
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleCreateSingleOrder}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Single Test Order
            </Button>

            <Button
              onClick={handleCreateMultipleOrders}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Package className="h-4 w-4 mr-2" />
              )}
              Create Multiple Test Orders
            </Button>
          </div>

          {message && (
            <div className={`p-3 rounded-md text-sm ${
              message.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Truck,
  MapPin,
  Clock,
  Navigation,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Route,
  Timer,
  DollarSign
} from 'lucide-react';

export const DriverActiveDeliveries: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const activeDeliveries = [
    { 
      id: '#1234', 
      restaurant: 'Pizza Palace', 
      customer: 'John Doe',
      customerPhone: '+1 (555) 123-4567',
      address: '123 Main St, Apt 4B',
      items: ['Margherita Pizza x2', 'Garlic Bread x1', 'Coke x2'],
      total: '$24.99',
      tip: '$5.00',
      status: 'Picked Up',
      estimatedTime: '15 min',
      distance: '2.3 miles',
      pickupTime: '2:15 PM',
      deliveryTime: '2:45 PM',
      specialInstructions: 'Ring doorbell twice, customer is expecting delivery',
      priority: 'high'
    },
    { 
      id: '#1235', 
      restaurant: 'Burger House', 
      customer: 'Jane Smith',
      customerPhone: '+1 (555) 987-6543',
      address: '456 Oak Ave',
      items: ['Beef Burger x1', 'Fries x1', 'Milkshake x1'],
      total: '$18.50',
      tip: '$3.50',
      status: 'Ready for Pickup',
      estimatedTime: '5 min',
      distance: '0.8 miles',
      pickupTime: '2:30 PM',
      deliveryTime: '2:50 PM',
      specialInstructions: 'Leave at door, contactless delivery preferred',
      priority: 'normal'
    },
    { 
      id: '#1236', 
      restaurant: 'Sushi Express', 
      customer: 'Mike Johnson',
      customerPhone: '+1 (555) 456-7890',
      address: '789 Pine St, Unit 12',
      items: ['California Roll x2', 'Salmon Roll x1', 'Miso Soup x1'],
      total: '$32.00',
      tip: '$6.00',
      status: 'Preparing',
      estimatedTime: '20 min',
      distance: '3.1 miles',
      pickupTime: '2:45 PM',
      deliveryTime: '3:15 PM',
      specialInstructions: 'Call when arrived, customer will meet in lobby',
      priority: 'normal'
    },
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleStatusUpdate = (deliveryId: string, newStatus: string) => {
    // Here you would update the delivery status
    console.log(`Updating delivery ${deliveryId} to status: ${newStatus}`);

    // Add notification for status update
    if (newStatus === 'Mark Delivered') {
      addNotification({
        type: 'order_update',
        title: 'Delivery Completed',
        message: `Order ${deliveryId} has been successfully delivered`,
        priority: 'medium'
      });
    }
  };

  const handleNavigation = (address: string) => {
    // Open navigation app
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/maps?daddr=${encodedAddress}`, '_blank');
  };

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleMessage = (phone: string) => {
    window.open(`sms:${phone}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Picked Up': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Ready for Pickup': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Preparing': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'Preparing': return 'Pick Up';
      case 'Ready for Pickup': return 'Pick Up';
      case 'Picked Up': return 'Mark Delivered';
      default: return 'Update Status';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Active Deliveries</h1>
        <Button 
          onClick={handleRefresh} 
          disabled={refreshing}
          className="flex items-center gap-2"
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{activeDeliveries.length}</div>
                <div className="text-sm text-gray-600">Active Orders</div>
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
                  ${activeDeliveries.reduce((sum, d) => sum + parseFloat(d.total.replace('$', '')) + parseFloat(d.tip.replace('$', '')), 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Potential Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Route className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {activeDeliveries.reduce((sum, d) => sum + parseFloat(d.distance.replace(' miles', '')), 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Total Miles</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Timer className="h-8 w-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">
                  {Math.max(...activeDeliveries.map(d => parseInt(d.estimatedTime.replace(' min', ''))))}
                </div>
                <div className="text-sm text-gray-600">Max ETA (min)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Deliveries List */}
      <div className="space-y-4">
        {activeDeliveries.map((delivery) => (
          <Card key={delivery.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      {delivery.id}
                      {getPriorityIcon(delivery.priority)}
                    </h3>
                    <p className="text-sm text-gray-600">{delivery.restaurant} → {delivery.customer}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(delivery.status)}`}>
                    {delivery.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">ETA: {delivery.estimatedTime}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Delivery Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Delivery Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{delivery.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Pickup: {delivery.pickupTime} • Delivery: {delivery.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Route className="h-4 w-4 text-gray-400" />
                        <span>{delivery.distance}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {delivery.items.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  {delivery.specialInstructions && (
                    <div>
                      <h4 className="font-medium mb-2">Special Instructions</h4>
                      <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-md border border-yellow-200">
                        {delivery.specialInstructions}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Earnings</h4>
                    <div className="bg-green-50 p-3 rounded-md border border-green-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Order Total:</span>
                        <span className="font-medium">{delivery.total}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tip:</span>
                        <span className="font-medium text-green-600">{delivery.tip}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-green-300 mt-2">
                        <span className="font-medium">Total Earnings:</span>
                        <span className="font-bold text-green-600">
                          ${(parseFloat(delivery.total.replace('$', '')) + parseFloat(delivery.tip.replace('$', ''))).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Actions</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        onClick={() => handleNavigation(delivery.address)}
                        className="flex items-center gap-2 bg-[#dd3333] hover:bg-[#c52e2e]"
                        size="sm"
                      >
                        <Navigation className="h-4 w-4" />
                        Navigate
                      </Button>
                      <Button 
                        onClick={() => handleCall(delivery.customerPhone)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        onClick={() => handleMessage(delivery.customerPhone)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button 
                        onClick={() => handleStatusUpdate(delivery.id, getNextAction(delivery.status))}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {getNextAction(delivery.status)}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {activeDeliveries.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-gray-500">
                <Truck className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No Active Deliveries</h3>
                <p className="text-sm">New delivery requests will appear here when available.</p>
                <Button className="mt-4" onClick={handleRefresh}>
                  Check for New Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

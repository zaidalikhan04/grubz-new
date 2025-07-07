import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  Star,
  Search,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const CustomerOrders: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    {
      id: '#ORD-1234',
      restaurant: "Mario's Italian Kitchen",
      items: ['Margherita Pizza x2', 'Caesar Salad x1'],
      total: 34.97,
      status: 'preparing',
      orderTime: '2:30 PM',
      estimatedDelivery: '3:15 PM',
      deliveryAddress: '123 Main St, Apt 4B',
      phone: '+1 (555) 123-4567',
      rating: null,
      image: '🍕'
    },
    {
      id: '#ORD-1233',
      restaurant: "Burger Palace",
      items: ['Classic Burger x1', 'Fries x1', 'Coke x1'],
      total: 18.97,
      status: 'delivered',
      orderTime: '12:45 PM',
      estimatedDelivery: '1:30 PM',
      deliveryAddress: '123 Main St, Apt 4B',
      phone: '+1 (555) 123-4567',
      rating: 5,
      image: '🍔'
    },
    {
      id: '#ORD-1232',
      restaurant: "Sushi Express",
      items: ['Salmon Roll x2', 'Miso Soup x1'],
      total: 21.97,
      status: 'on_way',
      orderTime: '1:15 PM',
      estimatedDelivery: '2:00 PM',
      deliveryAddress: '123 Main St, Apt 4B',
      phone: '+1 (555) 123-4567',
      rating: null,
      image: '🍣'
    }
  ];

  const filters = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'active', label: 'Active', count: orders.filter(o => ['preparing', 'on_way'].includes(o.status)).length },
    { id: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'preparing':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock,
          label: 'Preparing'
        };
      case 'on_way':
        return { 
          color: 'bg-blue-100 text-blue-800 border-blue-200', 
          icon: Truck,
          label: 'On the way'
        };
      case 'delivered':
        return { 
          color: 'bg-green-100 text-green-800 border-green-200', 
          icon: CheckCircle,
          label: 'Delivered'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Clock,
          label: status
        };
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'active' && ['preparing', 'on_way'].includes(order.status)) ||
                         (selectedFilter === 'delivered' && order.status === 'delivered');
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.restaurant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Track your current and past orders</p>
        </div>
        <Button className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2 overflow-x-auto">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              variant={selectedFilter === filter.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedFilter(filter.id)}
              className={`whitespace-nowrap ${
                selectedFilter === filter.id ? 'bg-[#dd3333] hover:bg-[#c52e2e]' : ''
              }`}
            >
              <Filter className="h-4 w-4 mr-1" />
              {filter.label} ({filter.count})
            </Button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center text-2xl">
                      {order.image}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <p className="text-gray-600">{order.restaurant}</p>
                    </div>
                    <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                      <statusConfig.icon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#dd3333]">${order.total.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">{order.orderTime}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items Ordered</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    {order.items.map((item, index) => (
                      <p key={index} className="text-sm text-gray-700">• {item}</p>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Delivery Information</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {order.deliveryAddress}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {order.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-3 w-3" />
                        Est. delivery: {order.estimatedDelivery}
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Actions</h4>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'delivered' && !order.rating && (
                        <Button size="sm" className="bg-[#dd3333] hover:bg-[#c52e2e]">
                          Rate Order
                        </Button>
                      )}
                      {order.status === 'delivered' && order.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Your rating:</span>
                          {renderStarRating(order.rating)}
                        </div>
                      )}
                      {['preparing', 'on_way'].includes(order.status) && (
                        <>
                          <Button size="sm" variant="outline">
                            Track Order
                          </Button>
                          <Button size="sm" variant="outline">
                            Contact Restaurant
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline">
                        Reorder
                      </Button>
                      <Button size="sm" variant="outline">
                        Get Help
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No orders found matching your criteria.</p>
            <Button className="mt-4 bg-[#dd3333] hover:bg-[#c52e2e]">
              Browse Food
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { OrderService, OrderStatus } from '../../services/order';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  MapPin,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { Input } from '../ui/input';

export const OrdersManagement: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const orders = [
    {
      id: '#1234',
      customer: 'John Doe',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, Apt 4B',
      items: [
        { name: 'Margherita Pizza', quantity: 2, price: 12.99 },
        { name: 'Garlic Bread', quantity: 1, price: 5.99 }
      ],
      total: 31.97,
      status: 'preparing',
      orderTime: '2:30 PM',
      estimatedTime: '15 min',
      paymentMethod: 'Credit Card',
      notes: 'Extra cheese, no onions'
    },
    {
      id: '#1235',
      customer: 'Jane Smith',
      phone: '+1 (555) 987-6543',
      address: '456 Oak Ave, Unit 2',
      items: [
        { name: 'Caesar Salad', quantity: 1, price: 8.99 },
        { name: 'Garlic Bread', quantity: 1, price: 5.99 }
      ],
      total: 14.98,
      status: 'ready',
      orderTime: '2:18 PM',
      estimatedTime: 'Ready now',
      paymentMethod: 'Cash',
      notes: 'Dressing on the side'
    },
    {
      id: '#1236',
      customer: 'Mike Johnson',
      phone: '+1 (555) 456-7890',
      address: '789 Pine St, House',
      items: [
        { name: 'Pepperoni Pizza', quantity: 1, price: 14.99 }
      ],
      total: 14.99,
      status: 'new',
      orderTime: '2:35 PM',
      estimatedTime: '20 min',
      paymentMethod: 'Credit Card',
      notes: ''
    }
  ];

  const filters = [
    { id: 'all', label: 'All Orders', count: orders.length },
    { id: 'new', label: 'New', count: orders.filter(o => o.status === 'new').length },
    { id: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
    { id: 'ready', label: 'Ready', count: orders.filter(o => o.status === 'ready').length },
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'new':
        return { 
          color: 'bg-red-100 text-red-800 border-red-200', 
          icon: AlertCircle,
          label: 'New Order'
        };
      case 'preparing':
        return { 
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
          icon: Clock,
          label: 'Preparing'
        };
      case 'readyForPickup':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: CheckCircle,
          label: 'Ready for Pickup'
        };
      default:
        return { 
          color: 'bg-gray-100 text-gray-800 border-gray-200', 
          icon: Clock,
          label: status
        };
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to ${newStatus}`);
      await OrderService.updateOrderStatus(orderId, newStatus);
      console.log(`✅ Order ${orderId} updated to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600">Manage and track all incoming orders</p>
        </div>
        <Button className="bg-[#704ce5] hover:bg-[#5a3bc4] flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Orders
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
                selectedFilter === filter.id ? 'bg-[#704ce5] hover:bg-[#5a3bc4]' : ''
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
      <div className="grid gap-4">
        {filteredOrders.map((order) => {
          const statusConfig = getStatusConfig(order.status);
          return (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg">{order.id}</CardTitle>
                    <Badge className={`${statusConfig.color} flex items-center gap-1`}>
                      <statusConfig.icon className="h-3 w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Order Time</p>
                    <p className="font-medium">{order.orderTime}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.customer}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        {order.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-3 w-3" />
                        {order.address}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="text-gray-600">Total: </span>
                        <span className="font-medium text-[#704ce5]">${order.total.toFixed(2)}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Payment: </span>
                        <span className="font-medium">{order.paymentMethod}</span>
                      </p>
                      <p className="text-sm">
                        <span className="text-gray-600">Est. Time: </span>
                        <span className="font-medium">{order.estimatedTime}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                        <span className="text-sm">{item.quantity}x {item.name}</span>
                        <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Special Instructions</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">{order.notes}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {order.status === 'new' && (
                    <Button
                      size="sm"
                      className="bg-[#704ce5] hover:bg-[#5a3bc4]"
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                    >
                      Accept Order
                    </Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => updateOrderStatus(order.id, 'readyForPickup')}
                    >
                      Mark Ready for Pickup
                    </Button>
                  )}
                  {order.status === 'readyForPickup' && (
                    <div className="px-3 py-1 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        Waiting for driver
                      </div>
                    </div>
                  )}
                  <Button size="sm" variant="outline">
                    Contact Customer
                  </Button>
                  <Button size="sm" variant="outline">
                    Print Receipt
                  </Button>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
};

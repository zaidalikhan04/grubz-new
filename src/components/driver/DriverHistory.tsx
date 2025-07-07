import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const DriverHistory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [expandedDelivery, setExpandedDelivery] = useState<string | null>(null);

  const deliveryHistory = [
    {
      id: '#1234',
      date: '2024-01-15',
      time: '2:30 PM',
      restaurant: 'Pizza Palace',
      customer: 'John Doe',
      address: '123 Main St, Apt 4B',
      items: ['Margherita Pizza x2', 'Garlic Bread x1'],
      total: 24.99,
      tip: 5.00,
      rating: 5,
      distance: 2.3,
      duration: 18,
      status: 'Completed',
      notes: 'Customer requested contactless delivery'
    },
    {
      id: '#1233',
      date: '2024-01-15',
      time: '1:45 PM',
      restaurant: 'Burger House',
      customer: 'Jane Smith',
      address: '456 Oak Ave',
      items: ['Beef Burger x1', 'Fries x1', 'Coke x1'],
      total: 18.50,
      tip: 3.50,
      rating: 4,
      distance: 1.8,
      duration: 15,
      status: 'Completed',
      notes: 'Left at door as requested'
    },
    {
      id: '#1232',
      date: '2024-01-15',
      time: '12:30 PM',
      restaurant: 'Sushi Express',
      customer: 'Mike Johnson',
      address: '789 Pine St',
      items: ['California Roll x2', 'Miso Soup x1'],
      total: 32.00,
      tip: 6.00,
      rating: 5,
      distance: 3.1,
      duration: 22,
      status: 'Completed',
      notes: 'Customer met at lobby'
    },
    {
      id: '#1231',
      date: '2024-01-14',
      time: '8:15 PM',
      restaurant: 'Taco Fiesta',
      customer: 'Sarah Wilson',
      address: '321 Elm St',
      items: ['Chicken Tacos x3', 'Guacamole x1'],
      total: 16.75,
      tip: 4.25,
      rating: 5,
      distance: 1.5,
      duration: 12,
      status: 'Completed',
      notes: 'Quick and easy delivery'
    },
    {
      id: '#1230',
      date: '2024-01-14',
      time: '7:00 PM',
      restaurant: 'Italian Bistro',
      customer: 'Tom Brown',
      address: '654 Maple Ave',
      items: ['Pasta Carbonara x1', 'Caesar Salad x1'],
      total: 28.50,
      tip: 5.50,
      rating: 4,
      distance: 2.7,
      duration: 20,
      status: 'Completed',
      notes: 'Customer was very friendly'
    }
  ];

  const filteredDeliveries = deliveryHistory.filter(delivery => {
    const matchesSearch = delivery.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.restaurant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         delivery.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'high-rating' && delivery.rating >= 5) ||
                         (selectedFilter === 'high-tip' && delivery.tip >= 5) ||
                         (selectedFilter === 'recent' && new Date(delivery.date) >= new Date('2024-01-15'));
    
    return matchesSearch && matchesFilter;
  });

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime();
      case 'earnings':
        return (b.total + b.tip) - (a.total + a.tip);
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return b.distance - a.distance;
      default:
        return 0;
    }
  });

  const totalEarnings = filteredDeliveries.reduce((sum, delivery) => sum + delivery.total + delivery.tip, 0);
  const averageRating = filteredDeliveries.reduce((sum, delivery) => sum + delivery.rating, 0) / filteredDeliveries.length;
  const totalDistance = filteredDeliveries.reduce((sum, delivery) => sum + delivery.distance, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Delivery History</h1>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#dd3333]">{filteredDeliveries.length}</div>
              <div className="text-sm text-gray-600">Total Deliveries</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalEarnings.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Earnings</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Avg Rating</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalDistance.toFixed(1)}</div>
              <div className="text-sm text-gray-600">Miles Driven</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by customer, restaurant, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Deliveries</option>
                <option value="recent">Recent (Today)</option>
                <option value="high-rating">5-Star Ratings</option>
                <option value="high-tip">High Tips ($5+)</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="date">Sort by Date</option>
                <option value="earnings">Sort by Earnings</option>
                <option value="rating">Sort by Rating</option>
                <option value="distance">Sort by Distance</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Delivery Records ({sortedDeliveries.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedDeliveries.map((delivery) => (
              <div key={delivery.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div>
                      <h4 className="font-semibold">{delivery.id}</h4>
                      <p className="text-sm text-gray-600">{formatDate(delivery.date)} • {delivery.time}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < delivery.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#dd3333]">
                      ${(delivery.total + delivery.tip).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      ${delivery.total} + ${delivery.tip} tip
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Restaurant</p>
                    <p className="text-sm">{delivery.restaurant}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Customer</p>
                    <p className="text-sm">{delivery.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-sm">{delivery.address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{delivery.distance} mi</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{delivery.duration} min</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedDelivery(
                      expandedDelivery === delivery.id ? null : delivery.id
                    )}
                    className="flex items-center gap-1"
                  >
                    Details
                    {expandedDelivery === delivery.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {expandedDelivery === delivery.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Items Delivered</p>
                      <ul className="text-sm text-gray-700">
                        {delivery.items.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                    {delivery.notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Delivery Notes</p>
                        <p className="text-sm text-gray-700">{delivery.notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {sortedDeliveries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No deliveries found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

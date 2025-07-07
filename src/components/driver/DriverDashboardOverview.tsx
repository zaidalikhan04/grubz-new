import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Truck, MapPin, Clock, DollarSign, Navigation, CheckCircle, Star, TrendingUp } from 'lucide-react';

export const DriverDashboardOverview: React.FC = () => {
  const stats = [
    { title: 'Today\'s Deliveries', value: '12', icon: Truck, color: 'text-blue-600', change: '+3 from yesterday' },
    { title: 'Earnings Today', value: '$84.50', icon: DollarSign, color: 'text-green-600', change: '+$12.30 from yesterday' },
    { title: 'Average Time', value: '18 min', icon: Clock, color: 'text-purple-600', change: '-2 min from yesterday' },
    { title: 'Rating', value: '4.9', icon: Star, color: 'text-orange-600', change: '+0.1 from last week' },
  ];

  const activeDeliveries = [
    { 
      id: '#1234', 
      restaurant: 'Pizza Palace', 
      customer: 'John Doe',
      address: '123 Main St, Apt 4B',
      items: 'Margherita Pizza x2',
      total: '$24.99',
      status: 'Picked Up',
      estimatedTime: '15 min',
      distance: '2.3 miles'
    },
    { 
      id: '#1235', 
      restaurant: 'Burger House', 
      customer: 'Jane Smith',
      address: '456 Oak Ave',
      items: 'Beef Burger, Fries',
      total: '$18.50',
      status: 'Ready for Pickup',
      estimatedTime: '5 min',
      distance: '0.8 miles'
    },
  ];

  const recentDeliveries = [
    { id: '#1230', customer: 'Mike Johnson', total: '$16.99', time: '2:30 PM', rating: 5, tip: '$3.00' },
    { id: '#1231', customer: 'Sarah Wilson', total: '$22.50', time: '1:45 PM', rating: 5, tip: '$4.50' },
    { id: '#1232', customer: 'Tom Brown', total: '$19.99', time: '12:30 PM', rating: 4, tip: '$2.00' },
  ];

  const weeklyEarnings = [
    { day: 'Mon', amount: 78.50 },
    { day: 'Tue', amount: 92.30 },
    { day: 'Wed', amount: 85.20 },
    { day: 'Thu', amount: 96.80 },
    { day: 'Fri', amount: 104.60 },
    { day: 'Sat', amount: 118.90 },
    { day: 'Sun', amount: 84.50 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full bg-gray-50`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Deliveries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Active Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDeliveries.map((delivery) => (
                <div key={delivery.id} className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold">{delivery.id}</h4>
                      <p className="text-sm text-gray-600">{delivery.restaurant} → {delivery.customer}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      delivery.status === 'Picked Up' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {delivery.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>{delivery.address}</span>
                      <span className="text-gray-400">({delivery.distance})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>ETA: {delivery.estimatedTime}</span>
                    </div>
                    <p className="text-sm text-gray-600">{delivery.items}</p>
                    <p className="text-sm font-medium text-[#dd3333]">{delivery.total}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2">
                      <Navigation className="h-4 w-4" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      {delivery.status === 'Picked Up' ? 'Mark Delivered' : 'Pick Up'}
                    </Button>
                  </div>
                </div>
              ))}
              
              {activeDeliveries.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active deliveries</p>
                  <p className="text-sm">New orders will appear here</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Earnings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Weekly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyEarnings.map((day, index) => (
                <div key={day.day} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#dd3333] h-2 rounded-full" 
                        style={{ width: `${(day.amount / 120) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-[#dd3333]">${day.amount}</span>
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total</span>
                  <span className="text-lg font-bold text-[#dd3333]">
                    ${weeklyEarnings.reduce((sum, day) => sum + day.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Recent Completed Deliveries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDeliveries.map((delivery) => (
              <div key={delivery.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold">{delivery.id}</h4>
                  <p className="text-sm text-gray-600">{delivery.customer}</p>
                  <p className="text-sm text-gray-500">{delivery.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#dd3333]">{delivery.total}</p>
                  <p className="text-xs text-green-600">Tip: {delivery.tip}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < delivery.rating ? 'text-yellow-400 fill-current' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

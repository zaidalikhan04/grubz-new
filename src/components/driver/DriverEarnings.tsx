import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { DollarSign, TrendingUp, Calendar, Download, Star, Truck, Clock } from 'lucide-react';

export const DriverEarnings: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const earningsData = {
    today: {
      total: 84.50,
      deliveries: 12,
      tips: 18.50,
      base: 66.00,
      hours: 6.5
    },
    week: {
      total: 560.80,
      deliveries: 78,
      tips: 142.30,
      base: 418.50,
      hours: 42.5
    },
    month: {
      total: 2340.60,
      deliveries: 312,
      tips: 578.90,
      base: 1761.70,
      hours: 168
    }
  };

  const currentData = earningsData[selectedPeriod as keyof typeof earningsData];

  const dailyBreakdown = [
    { date: '2024-01-15', deliveries: 12, earnings: 84.50, tips: 18.50, hours: 6.5, rating: 4.9 },
    { date: '2024-01-14', deliveries: 15, earnings: 96.80, tips: 22.30, hours: 7.2, rating: 4.8 },
    { date: '2024-01-13', deliveries: 11, earnings: 78.20, tips: 16.70, hours: 6.0, rating: 5.0 },
    { date: '2024-01-12', deliveries: 14, earnings: 92.30, tips: 19.80, hours: 6.8, rating: 4.9 },
    { date: '2024-01-11', deliveries: 13, earnings: 88.60, tips: 21.20, hours: 6.5, rating: 4.7 },
    { date: '2024-01-10', deliveries: 16, earnings: 104.20, tips: 25.40, hours: 7.5, rating: 4.9 },
    { date: '2024-01-09', deliveries: 10, earnings: 72.40, tips: 14.60, hours: 5.8, rating: 5.0 },
  ];

  const bonuses = [
    { type: 'Peak Hour Bonus', amount: 15.00, date: '2024-01-15', description: 'Lunch rush (12-2 PM)' },
    { type: 'Weekend Bonus', amount: 25.00, date: '2024-01-14', description: 'Saturday delivery bonus' },
    { type: 'Completion Bonus', amount: 10.00, date: '2024-01-13', description: '10+ deliveries in a day' },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Earnings Overview</h1>
        <div className="flex gap-2">
          {['today', 'week', 'month'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'bg-[#dd3333] hover:bg-[#c52e2e]' : ''}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600">${currentData.total}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(currentData.total / currentData.hours).toFixed(2)}/hour
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deliveries</p>
                <p className="text-3xl font-bold text-blue-600">{currentData.deliveries}</p>
                <p className="text-xs text-gray-500 mt-1">
                  ${(currentData.total / currentData.deliveries).toFixed(2)}/delivery
                </p>
              </div>
              <Truck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tips</p>
                <p className="text-3xl font-bold text-purple-600">${currentData.tips}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((currentData.tips / currentData.total) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                <p className="text-3xl font-bold text-orange-600">{currentData.hours}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(currentData.deliveries / currentData.hours).toFixed(1)} deliveries/hour
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Breakdown
            </CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyBreakdown.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{formatDate(day.date)}</p>
                        <p className="text-sm text-gray-600">{day.deliveries} deliveries • {day.hours}h</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{day.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[#dd3333]">${day.earnings}</p>
                    <p className="text-sm text-gray-600">Tips: ${day.tips}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Bonuses & Incentives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Bonuses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bonuses.map((bonus, index) => (
                <div key={index} className="p-4 border rounded-lg bg-green-50 border-green-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-green-800">{bonus.type}</h4>
                    <span className="text-lg font-bold text-green-600">+${bonus.amount}</span>
                  </div>
                  <p className="text-sm text-gray-600">{bonus.description}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(bonus.date)}</p>
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Bonuses</span>
                  <span className="text-lg font-bold text-green-600">
                    +${bonuses.reduce((sum, bonus) => sum + bonus.amount, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Earnings Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#dd3333] mb-2">${currentData.base}</div>
              <div className="text-sm text-gray-600">Base Pay</div>
              <div className="text-xs text-gray-500">{((currentData.base / currentData.total) * 100).toFixed(1)}% of total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">${currentData.tips}</div>
              <div className="text-sm text-gray-600">Tips</div>
              <div className="text-xs text-gray-500">{((currentData.tips / currentData.total) * 100).toFixed(1)}% of total</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                ${bonuses.reduce((sum, bonus) => sum + bonus.amount, 0).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600">Bonuses</div>
              <div className="text-xs text-gray-500">
                {((bonuses.reduce((sum, bonus) => sum + bonus.amount, 0) / currentData.total) * 100).toFixed(1)}% of total
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

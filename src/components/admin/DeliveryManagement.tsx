import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { 
  Truck, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Star, 
  Phone, 
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Ban,
  UserCheck
} from 'lucide-react';

export const DeliveryManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedZone, setSelectedZone] = useState('all');

  const drivers = [
    {
      id: '1',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      phone: '+1 (555) 123-4567',
      status: 'online',
      rating: 4.9,
      totalDeliveries: 1234,
      earnings: '$12,456',
      joinDate: '2023-12-15',
      vehicle: 'Honda Civic',
      zone: 'Downtown',
      currentOrder: '#1234',
      lastActive: '2 min ago'
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+1 (555) 234-5678',
      status: 'busy',
      rating: 4.7,
      totalDeliveries: 856,
      earnings: '$8,234',
      joinDate: '2024-01-10',
      vehicle: 'Toyota Corolla',
      zone: 'Uptown',
      currentOrder: '#1235',
      lastActive: '5 min ago'
    },
    {
      id: '3',
      name: 'David Chen',
      email: 'david@example.com',
      phone: '+1 (555) 345-6789',
      status: 'offline',
      rating: 4.8,
      totalDeliveries: 567,
      earnings: '$5,678',
      joinDate: '2023-11-20',
      vehicle: 'Ford Focus',
      zone: 'Suburbs',
      currentOrder: null,
      lastActive: '2 hours ago'
    },
    {
      id: '4',
      name: 'Lisa Rodriguez',
      email: 'lisa@example.com',
      phone: '+1 (555) 456-7890',
      status: 'pending',
      rating: 0,
      totalDeliveries: 0,
      earnings: '$0',
      joinDate: '2024-01-25',
      vehicle: 'Nissan Sentra',
      zone: 'Downtown',
      currentOrder: null,
      lastActive: '1 day ago'
    }
  ];

  const deliveryZones = [
    { name: 'Downtown', activeDrivers: 12, avgDeliveryTime: '25 min', orders: 145 },
    { name: 'Uptown', activeDrivers: 8, avgDeliveryTime: '30 min', orders: 98 },
    { name: 'Suburbs', activeDrivers: 15, avgDeliveryTime: '35 min', orders: 76 },
    { name: 'Industrial', activeDrivers: 5, avgDeliveryTime: '28 min', orders: 34 }
  ];

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || driver.status === selectedStatus;
    const matchesZone = selectedZone === 'all' || driver.zone === selectedZone;
    
    return matchesSearch && matchesStatus && matchesZone;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'busy': return <Clock className="h-4 w-4" />;
      case 'offline': return <XCircle className="h-4 w-4" />;
      case 'pending': return <AlertTriangle className="h-4 w-4" />;
      case 'suspended': return <Ban className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleApproveDriver = (driverId: string) => {
    console.log('Approving driver:', driverId);
  };

  const handleSuspendDriver = (driverId: string) => {
    if (confirm('Are you sure you want to suspend this driver?')) {
      console.log('Suspending driver:', driverId);
    }
  };

  const handleViewDriver = (driver: any) => {
    console.log('Viewing driver details:', driver);
  };

  const handleEditDriver = (driver: any) => {
    console.log('Editing driver:', driver);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Delivery Management</h1>
          <p className="text-gray-600">Manage delivery drivers, zones, and operations</p>
        </div>
        <Button className="bg-gray-900 hover:bg-gray-800 flex items-center gap-2">
          <UserCheck className="h-4 w-4" />
          Add Driver
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Truck className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{drivers.length}</div>
                <div className="text-sm text-gray-600">Total Drivers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{drivers.filter(d => d.status === 'online').length}</div>
                <div className="text-sm text-gray-600">Online Now</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{drivers.filter(d => d.status === 'pending').length}</div>
                <div className="text-sm text-gray-600">Pending Approval</div>
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
                  ${drivers.reduce((sum, d) => sum + parseInt(d.earnings.replace(/[$,]/g, '')), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Delivery Zones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Delivery Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deliveryZones.map((zone, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{zone.name}</h4>
                    <span className="text-sm text-gray-600">{zone.orders} orders</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Active Drivers:</span>
                      <span className="font-medium ml-1">{zone.activeDrivers}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Avg Time:</span>
                      <span className="font-medium ml-1">{zone.avgDeliveryTime}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="lg:col-span-2">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="online">Online</option>
                  <option value="busy">Busy</option>
                  <option value="offline">Offline</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">All Zones</option>
                  <option value="Downtown">Downtown</option>
                  <option value="Uptown">Uptown</option>
                  <option value="Suburbs">Suburbs</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Delivery Drivers ({filteredDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Driver</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Zone</th>
                  <th className="text-left p-3 font-medium">Rating</th>
                  <th className="text-left p-3 font-medium">Deliveries</th>
                  <th className="text-left p-3 font-medium">Earnings</th>
                  <th className="text-left p-3 font-medium">Current Order</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Truck className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">{driver.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {driver.email}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {driver.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(driver.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                          {driver.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{driver.lastActive}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {driver.zone}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{driver.vehicle}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{driver.rating}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{driver.totalDeliveries.toLocaleString()}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-green-600">{driver.earnings}</div>
                    </td>
                    <td className="p-3">
                      {driver.currentOrder ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          {driver.currentOrder}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">None</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDriver(driver)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDriver(driver)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        {driver.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApproveDriver(driver.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        )}
                        {driver.status !== 'suspended' && driver.status !== 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSuspendDriver(driver.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

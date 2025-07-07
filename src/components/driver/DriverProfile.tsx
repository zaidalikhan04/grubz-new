import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Car, 
  FileText, 
  Star, 
  Edit, 
  Save, 
  X, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Shield,
  Award
} from 'lucide-react';

export const DriverProfile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || 'John Driver',
    email: user?.email || 'john.driver@email.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    emergencyContact: 'Jane Driver - +1 (555) 987-6543'
  });

  const vehicleInfo = {
    make: 'Honda',
    model: 'Civic',
    year: '2020',
    color: 'Silver',
    licensePlate: 'ABC-1234',
    insurance: 'Valid until Dec 2024',
    registration: 'Valid until Mar 2025'
  };

  const documents = [
    { name: 'Driver\'s License', status: 'Verified', expiry: '2026-08-15', type: 'license' },
    { name: 'Vehicle Insurance', status: 'Verified', expiry: '2024-12-31', type: 'insurance' },
    { name: 'Vehicle Registration', status: 'Verified', expiry: '2025-03-20', type: 'registration' },
    { name: 'Background Check', status: 'Verified', expiry: '2025-01-10', type: 'background' },
  ];

  const stats = {
    totalDeliveries: 1247,
    rating: 4.9,
    completionRate: 98.5,
    onTimeRate: 96.2,
    memberSince: '2023-03-15'
  };

  const achievements = [
    { name: 'Top Performer', description: '100+ deliveries this month', icon: Award, color: 'text-yellow-600' },
    { name: 'Customer Favorite', description: '4.9+ rating for 3 months', icon: Star, color: 'text-purple-600' },
    { name: 'Speed Demon', description: 'Average delivery time under 20 min', icon: Car, color: 'text-blue-600' },
    { name: 'Reliable Driver', description: '98%+ completion rate', icon: Shield, color: 'text-green-600' },
  ];

  const handleSave = () => {
    // Here you would typically save to backend
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile({
      name: user?.name || 'John Driver',
      email: user?.email || 'john.driver@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'Jane Driver - +1 (555) 987-6543'
    });
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'text-green-600 bg-green-100';
      case 'Pending': return 'text-yellow-600 bg-yellow-100';
      case 'Expired': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Driver Profile</h1>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex items-center gap-2 bg-[#dd3333] hover:bg-[#c52e2e]">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedProfile.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Driver ID</label>
                <p className="mt-1 text-gray-900">#{user?.id || '12345'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedProfile.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editedProfile.phone}
                    onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedProfile.phone}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Address</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.address}
                    onChange={(e) => setEditedProfile({...editedProfile, address: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedProfile.address}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedProfile.emergencyContact}
                    onChange={(e) => setEditedProfile({...editedProfile, emergencyContact: e.target.value})}
                    className="w-full mt-1 p-2 border rounded-md"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{editedProfile.emergencyContact}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Driver Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#dd3333] mb-1">{stats.rating}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(stats.rating) ? 'text-yellow-400 fill-current' : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Deliveries</span>
                <span className="font-medium">{stats.totalDeliveries.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completion Rate</span>
                <span className="font-medium text-green-600">{stats.completionRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">On-Time Rate</span>
                <span className="font-medium text-blue-600">{stats.onTimeRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Member Since</span>
                <span className="font-medium">{new Date(stats.memberSince).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Make & Model</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.make} {vehicleInfo.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Year</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.year}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Color</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.color}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">License Plate</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.licensePlate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Insurance</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.insurance}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Registration</label>
                <p className="mt-1 text-gray-900">{vehicleInfo.registration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents & Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{doc.name}</h4>
                    <p className="text-sm text-gray-600">Expires: {new Date(doc.expiry).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements & Badges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="p-4 border rounded-lg text-center hover:shadow-md transition-shadow">
                <achievement.icon className={`h-8 w-8 mx-auto mb-2 ${achievement.color}`} />
                <h4 className="font-medium mb-1">{achievement.name}</h4>
                <p className="text-sm text-gray-600">{achievement.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

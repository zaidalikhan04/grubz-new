import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Store, Truck, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface PartnerApplication {
  id: string;
  type: 'restaurant_owner' | 'delivery_rider';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  userId: string;
  userEmail: string;
  userName: string;
  adminNotes?: string;
  processedAt?: any;
}

export const PartnerApplications: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'apply' | 'status'>('apply');
  const [applicationForm, setApplicationForm] = useState<'restaurant' | 'driver' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingApplications, setExistingApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug: Log user data
  console.log('🔍 PartnerApplications - User data:', user);

  // Restaurant form data
  const [restaurantData, setRestaurantData] = useState({
    restaurantName: '',
    cuisine: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    experience: ''
  });

  // Driver form data
  const [driverData, setDriverData] = useState({
    dateOfBirth: '',
    licenseNumber: '',
    experience: '',
    availability: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    phone: ''
  });

  // Set up real-time listeners for applications
  useEffect(() => {
    if (!user?.id) {
      console.log('❌ No user ID found, skipping application load');
      setLoading(false);
      return;
    }

    console.log('🔍 Setting up real-time application listeners for user:', user.id);

    const applications: PartnerApplication[] = [];
    let loadedCount = 0;
    const totalListeners = 2;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalListeners) {
        setExistingApplications(applications);
        setLoading(false);
      }
    };

    // Listen to restaurant applications
    const restaurantUnsubscribe = onSnapshot(
      doc(db, 'restaurantApplications', user.id),
      (doc) => {
        console.log('📄 Restaurant application updated:', doc.exists());
        if (doc.exists()) {
          const data = doc.data();
          const existingIndex = applications.findIndex(app => app.type === 'restaurant_owner');
          const application: PartnerApplication = {
            id: doc.id,
            type: 'restaurant_owner',
            status: data.status || 'pending',
            submittedAt: data.submittedAt,
            userId: user.id,
            userEmail: user.email || '',
            userName: user.name || '',
            adminNotes: data.adminNotes,
            processedAt: data.processedAt
          };

          if (existingIndex >= 0) {
            applications[existingIndex] = application;
          } else {
            applications.push(application);
          }
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in restaurant application snapshot:', error);
        checkComplete();
      }
    );

    // Listen to delivery applications
    const deliveryUnsubscribe = onSnapshot(
      doc(db, 'deliveryApplications', user.id),
      (doc) => {
        console.log('📄 Delivery application updated:', doc.exists());
        if (doc.exists()) {
          const data = doc.data();
          const existingIndex = applications.findIndex(app => app.type === 'delivery_rider');
          const application: PartnerApplication = {
            id: doc.id,
            type: 'delivery_rider',
            status: data.status || 'pending',
            submittedAt: data.submittedAt,
            userId: user.id,
            userEmail: user.email || '',
            userName: user.name || '',
            adminNotes: data.adminNotes,
            processedAt: data.processedAt
          };

          if (existingIndex >= 0) {
            applications[existingIndex] = application;
          } else {
            applications.push(application);
          }
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in delivery application snapshot:', error);
        checkComplete();
      }
    );

    // Cleanup listeners
    return () => {
      console.log('🧹 Cleaning up application listeners');
      restaurantUnsubscribe();
      deliveryUnsubscribe();
    };
  }, [user?.id]);

  const handleRestaurantSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    if (!restaurantData.restaurantName || !restaurantData.cuisine || !restaurantData.category || !restaurantData.description || !restaurantData.address || !restaurantData.phone) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔄 Submitting restaurant application...');

      // Save to restaurantApplications/{uid} collection
      await setDoc(doc(db, 'restaurantApplications', user.id), {
        type: 'restaurant_owner',
        status: 'pending',
        submittedAt: new Date(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        restaurantName: restaurantData.restaurantName,
        cuisine: restaurantData.cuisine,
        category: restaurantData.category,
        description: restaurantData.description,
        address: restaurantData.address,
        phone: restaurantData.phone,
        website: restaurantData.website,
        experience: restaurantData.experience,
        adminNotes: '',
        processedAt: null,
        processedBy: null
      });

      console.log('✅ Restaurant application submitted successfully');
      alert('Restaurant partnership application submitted successfully! You will receive an email once it\'s reviewed.');
      setApplicationForm(null);
      setRestaurantData({
        restaurantName: '',
        cuisine: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        website: '',
        experience: ''
      });
    } catch (error) {
      console.error('❌ Error submitting restaurant application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDriverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      console.log('🔄 Submitting delivery driver application...');

      // Save to deliveryApplications/{uid} collection
      await setDoc(doc(db, 'deliveryApplications', user.id), {
        type: 'delivery_rider',
        status: 'pending',
        submittedAt: new Date(),
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        fullName: user.name,
        dateOfBirth: driverData.dateOfBirth,
        licenseNumber: driverData.licenseNumber,
        experience: driverData.experience,
        availability: driverData.availability,
        emergencyContact: driverData.emergencyContact,
        emergencyPhone: driverData.emergencyPhone,
        address: driverData.address,
        phone: driverData.phone,
        adminNotes: '',
        processedAt: null,
        processedBy: null
      });

      console.log('✅ Delivery driver application submitted successfully');
      alert('Driver application submitted successfully! You will receive an email once it\'s reviewed.');
      setApplicationForm(null);
      setDriverData({
        dateOfBirth: '',
        licenseNumber: '',
        experience: '',
        availability: '',
        emergencyContact: '',
        emergencyPhone: '',
        address: '',
        phone: ''
      });
    } catch (error) {
      console.error('❌ Error submitting driver application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Check if user has pending applications
  const hasPendingRestaurant = existingApplications.some(app => app.type === 'restaurant_owner' && app.status === 'pending');
  const hasPendingDriver = existingApplications.some(app => app.type === 'delivery_rider' && app.status === 'pending');
  const hasApprovedApplication = existingApplications.some(app => app.status === 'approved');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dd3333] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partner Applications</h1>
          <p className="text-gray-600">Apply to become a restaurant partner or delivery driver</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('apply')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'apply'
              ? 'bg-white text-[#dd3333] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Apply for Partnership
        </button>
        <button
          onClick={() => setActiveTab('status')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'status'
              ? 'bg-white text-[#dd3333] shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Application Status
        </button>
      </div>

      {activeTab === 'apply' && (
        <div className="space-y-6">
          {hasApprovedApplication && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Application Approved!</h3>
                    <p className="text-green-700">Your partner application has been approved. You should now have access to your partner dashboard.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {!applicationForm && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Restaurant Partnership */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#dd3333] rounded-lg">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Restaurant Partner</CardTitle>
                      <CardDescription>
                        Join our platform as a restaurant owner and start receiving orders
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• Manage your menu and pricing</li>
                    <li>• Receive and process orders</li>
                    <li>• Track sales and analytics</li>
                    <li>• Build your customer base</li>
                  </ul>
                  <Button
                    onClick={() => setApplicationForm('restaurant')}
                    disabled={hasPendingRestaurant || hasApprovedApplication}
                    className="w-full bg-[#dd3333] hover:bg-[#c52e2e]"
                  >
                    {hasPendingRestaurant ? 'Application Pending' : 'Apply as Restaurant'}
                  </Button>
                </CardContent>
              </Card>

              {/* Driver Partnership */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#dd3333] rounded-lg">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>Delivery Driver</CardTitle>
                      <CardDescription>
                        Become a delivery driver and earn money on your schedule
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600 mb-4">
                    <li>• Flexible working hours</li>
                    <li>• Competitive earnings</li>
                    <li>• Real-time delivery tracking</li>
                    <li>• Weekly payments</li>
                  </ul>
                  <Button
                    onClick={() => setApplicationForm('driver')}
                    disabled={hasPendingDriver || hasApprovedApplication}
                    className="w-full bg-[#dd3333] hover:bg-[#c52e2e]"
                  >
                    {hasPendingDriver ? 'Application Pending' : 'Apply as Driver'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Restaurant Application Form */}
          {applicationForm === 'restaurant' && (
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Partnership Application</CardTitle>
                <CardDescription>
                  Please provide details about your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRestaurantSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="restaurantName">Restaurant Name *</Label>
                      <Input
                        id="restaurantName"
                        value={restaurantData.restaurantName}
                        onChange={(e) => setRestaurantData(prev => ({ ...prev, restaurantName: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cuisine">Cuisine Type *</Label>
                      <Select
                        value={restaurantData.cuisine}
                        onValueChange={(value) => setRestaurantData(prev => ({ ...prev, cuisine: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="chinese">Chinese</SelectItem>
                          <SelectItem value="indian">Indian</SelectItem>
                          <SelectItem value="mexican">Mexican</SelectItem>
                          <SelectItem value="american">American</SelectItem>
                          <SelectItem value="thai">Thai</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                          <SelectItem value="mediterranean">Mediterranean</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={restaurantData.category}
                      onValueChange={(value) => setRestaurantData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all-food">All Food</SelectItem>
                        <SelectItem value="appetizers">Appetizers</SelectItem>
                        <SelectItem value="main-courses">Main Courses</SelectItem>
                        <SelectItem value="desserts">Desserts</SelectItem>
                        <SelectItem value="beverages">Beverages</SelectItem>
                        <SelectItem value="sides">Sides</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Restaurant Description *</Label>
                    <Textarea
                      id="description"
                      value={restaurantData.description}
                      onChange={(e) => setRestaurantData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe your restaurant, specialties, and what makes it unique..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Restaurant Address *</Label>
                      <Input
                        id="address"
                        value={restaurantData.address}
                        onChange={(e) => setRestaurantData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={restaurantData.phone}
                        onChange={(e) => setRestaurantData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="website">Website (Optional)</Label>
                      <Input
                        id="website"
                        value={restaurantData.website}
                        onChange={(e) => setRestaurantData(prev => ({ ...prev, website: e.target.value }))}
                        placeholder="https://yourrestaurant.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="experience">Years of Experience *</Label>
                      <Select
                        value={restaurantData.experience}
                        onValueChange={(value) => setRestaurantData(prev => ({ ...prev, experience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="more-than-10">More than 10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setApplicationForm(null)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#dd3333] hover:bg-[#c52e2e]"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Driver Application Form */}
          {applicationForm === 'driver' && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Driver Application</CardTitle>
                <CardDescription>
                  Please provide your details to become a delivery driver
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDriverSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={driverData.dateOfBirth}
                        onChange={(e) => setDriverData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="licenseNumber">Driver's License Number *</Label>
                      <Input
                        id="licenseNumber"
                        value={driverData.licenseNumber}
                        onChange={(e) => setDriverData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience">Driving Experience *</Label>
                      <Select
                        value={driverData.experience}
                        onValueChange={(value) => setDriverData(prev => ({ ...prev, experience: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="less-than-1">Less than 1 year</SelectItem>
                          <SelectItem value="1-3">1-3 years</SelectItem>
                          <SelectItem value="3-5">3-5 years</SelectItem>
                          <SelectItem value="5-10">5-10 years</SelectItem>
                          <SelectItem value="more-than-10">More than 10 years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="availability">Availability *</Label>
                      <Select
                        value={driverData.availability}
                        onValueChange={(value) => setDriverData(prev => ({ ...prev, availability: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select availability" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time (40+ hours/week)</SelectItem>
                          <SelectItem value="part-time">Part-time (20-40 hours/week)</SelectItem>
                          <SelectItem value="weekends">Weekends only</SelectItem>
                          <SelectItem value="evenings">Evenings only</SelectItem>
                          <SelectItem value="flexible">Flexible schedule</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="address">Address *</Label>
                      <Input
                        id="address"
                        value={driverData.address}
                        onChange={(e) => setDriverData(prev => ({ ...prev, address: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={driverData.phone}
                        onChange={(e) => setDriverData(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContact"
                        value={driverData.emergencyContact}
                        onChange={(e) => setDriverData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
                      <Input
                        id="emergencyPhone"
                        value={driverData.emergencyPhone}
                        onChange={(e) => setDriverData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setApplicationForm(null)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-[#dd3333] hover:bg-[#c52e2e]"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Application Status Tab */}
      {activeTab === 'status' && (
        <div className="space-y-4">
          {existingApplications.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600">You haven't submitted any partner applications yet.</p>
                  <Button
                    onClick={() => setActiveTab('apply')}
                    className="mt-4 bg-[#dd3333] hover:bg-[#c52e2e]"
                  >
                    Apply Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {existingApplications.map((application) => (
                <Card key={application.id} className={`border-l-4 ${
                  application.status === 'approved' ? 'border-l-green-500' :
                  application.status === 'rejected' ? 'border-l-red-500' :
                  'border-l-yellow-500'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {application.type === 'restaurant_owner' ? (
                            <Store className="w-6 h-6 text-gray-600" />
                          ) : (
                            <Truck className="w-6 h-6 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {application.type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver'} Application
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Submitted on {new Date(application.submittedAt?.toDate()).toLocaleDateString()}
                          </p>
                          {application.adminNotes && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm font-medium text-gray-700">Admin Notes:</p>
                              <p className="text-sm text-gray-600">{application.adminNotes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        <span className="text-sm font-medium capitalize">{application.status}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicationService } from '../../services/applications';
import { 
  Store, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  Clock,
  Loader2,
  CheckCircle
} from 'lucide-react';

export const RestaurantOwnerApplication: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    
    // Restaurant Information
    restaurantName: '',
    restaurantDescription: '',
    cuisineType: '',
    restaurantAddress: '',
    restaurantPhone: '',
    restaurantEmail: currentUser?.email || '',
    website: '',
    
    // Business Information
    businessLicense: '',
    taxId: '',
    yearsOfExperience: '',
    previousRestaurantExperience: '',
    
    // Operating Information
    plannedHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    },
    
    // Additional Information
    specialRequirements: '',
    additionalNotes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleHoursChange = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      plannedHours: {
        ...prev.plannedHours,
        [day]: { ...prev.plannedHours[day], [field]: value }
      }
    }));
  };

  const validateForm = (): boolean => {
    const required = [
      'fullName', 'email', 'phone', 'address',
      'restaurantName', 'cuisineType', 'restaurantAddress', 'restaurantPhone'
    ];
    
    return required.every(field => formData[field as keyof typeof formData]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !validateForm()) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setLoading(true);

      // Save application to Firestore
      await ApplicationService.submitRestaurantApplication(currentUser.id, {
        ...formData,
        status: 'pending',
        submittedAt: new Date(),
        userId: currentUser.id
      });

      // Update user profile with role and basic info
      await updateProfile({
        role: 'restaurant_owner',
        phone: formData.phone,
        address: formData.address,
        restaurantName: formData.restaurantName,
        hasApplied: true
      });

      setSubmitted(true);
      
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for applying to become a restaurant owner. We'll review your application and get back to you soon.
            </p>
            <Button onClick={() => window.location.href = '/restaurant'}>
              Go to Restaurant Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Owner Application</h1>
        <p className="text-gray-600">Complete this form to apply to become a restaurant owner on our platform</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Your email address"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="address">Personal Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Your personal address"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Restaurant Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Restaurant Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restaurantName">Restaurant Name *</Label>
                <Input
                  id="restaurantName"
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                  placeholder="Name of your restaurant"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cuisineType">Cuisine Type *</Label>
                <Input
                  id="cuisineType"
                  value={formData.cuisineType}
                  onChange={(e) => handleInputChange('cuisineType', e.target.value)}
                  placeholder="e.g., Italian, Chinese, American"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="restaurantDescription">Restaurant Description</Label>
              <Input
                id="restaurantDescription"
                value={formData.restaurantDescription}
                onChange={(e) => handleInputChange('restaurantDescription', e.target.value)}
                placeholder="Brief description of your restaurant"
              />
            </div>
            
            <div>
              <Label htmlFor="restaurantAddress">Restaurant Address *</Label>
              <Input
                id="restaurantAddress"
                value={formData.restaurantAddress}
                onChange={(e) => handleInputChange('restaurantAddress', e.target.value)}
                placeholder="Full restaurant address"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="restaurantPhone">Restaurant Phone *</Label>
                <Input
                  id="restaurantPhone"
                  type="tel"
                  value={formData.restaurantPhone}
                  onChange={(e) => handleInputChange('restaurantPhone', e.target.value)}
                  placeholder="Restaurant phone number"
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurantEmail">Restaurant Email</Label>
                <Input
                  id="restaurantEmail"
                  type="email"
                  value={formData.restaurantEmail}
                  onChange={(e) => handleInputChange('restaurantEmail', e.target.value)}
                  placeholder="Restaurant email address"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://your-restaurant.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="businessLicense">Business License Number</Label>
                <Input
                  id="businessLicense"
                  value={formData.businessLicense}
                  onChange={(e) => handleInputChange('businessLicense', e.target.value)}
                  placeholder="Your business license number"
                />
              </div>
              <div>
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange('taxId', e.target.value)}
                  placeholder="Your tax identification number"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  value={formData.yearsOfExperience}
                  onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                  placeholder="Years in food service"
                />
              </div>
              <div>
                <Label htmlFor="previousRestaurantExperience">Previous Restaurant Experience</Label>
                <Input
                  id="previousRestaurantExperience"
                  value={formData.previousRestaurantExperience}
                  onChange={(e) => handleInputChange('previousRestaurantExperience', e.target.value)}
                  placeholder="Brief description of experience"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            type="submit"
            disabled={loading || !validateForm()}
            className="bg-indigo-600 hover:bg-indigo-700 px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

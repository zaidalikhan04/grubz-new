import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, Store, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RestaurantApplicationForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisine: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    website: '',
    experience: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('🔄 Form submission started');
    console.log('📋 Current user:', currentUser);
    console.log('📋 Form data:', formData);

    if (!currentUser) {
      console.error('❌ No current user found');
      alert('You must be logged in to submit an application.');
      return;
    }

    // Validate required fields
    const requiredFields = ['restaurantName', 'cuisine', 'category', 'description', 'address', 'phone'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      console.error('❌ Missing required fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔄 Submitting restaurant application to Firestore...');
      console.log('📍 Document path: restaurantApplications/' + currentUser.id);

      const applicationData = {
        type: 'restaurant_owner',
        status: 'pending',
        submittedAt: new Date(),
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        restaurantName: formData.restaurantName,
        cuisine: formData.cuisine,
        category: formData.category,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        website: formData.website || '',
        experience: formData.experience || '',
        adminNotes: '',
        processedAt: null,
        processedBy: null
      };

      console.log('📄 Application data to save:', applicationData);

      // Save to restaurantApplications/{uid} collection
      await setDoc(doc(db, 'restaurantApplications', currentUser.id), applicationData);

      console.log('✅ Restaurant application submitted successfully');
      alert('Restaurant partnership application submitted successfully! You will receive an email once it\'s reviewed.');

      // Reset form
      setFormData({
        restaurantName: '',
        cuisine: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        website: '',
        experience: ''
      });

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error submitting restaurant application:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        stack: error instanceof Error ? error.stack : undefined
      });
      alert(`Error submitting application: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Partner Application</h1>
            <p className="text-gray-600">Join our platform and start receiving orders from customers</p>
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Name *
                </label>
                <Input
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                  placeholder="Enter your restaurant name"
                  required
                />
              </div>

              {/* Cuisine Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine Type *
                </label>
                <Select value={formData.cuisine} onValueChange={(value) => handleInputChange('cuisine', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cuisine type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="italian">Italian</SelectItem>
                    <SelectItem value="chinese">Chinese</SelectItem>
                    <SelectItem value="mexican">Mexican</SelectItem>
                    <SelectItem value="indian">Indian</SelectItem>
                    <SelectItem value="japanese">Japanese</SelectItem>
                    <SelectItem value="thai">Thai</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="fast-food">Fast Food</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your restaurant, specialties, and what makes it unique"
                  rows={4}
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurant Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your restaurant's full address"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter your restaurant's phone number"
                  type="tel"
                  required
                />
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website (Optional)
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="Enter your restaurant's website URL"
                  type="url"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (Optional)
                </label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Tell us about your experience in the restaurant business"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#dd3333] hover:bg-[#c52e2e] text-white py-3 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting Application...
                    </>
                  ) : (
                    'Submit Restaurant Application'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

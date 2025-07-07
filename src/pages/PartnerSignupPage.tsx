import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Store, CheckCircle, Eye, EyeOff } from 'lucide-react';

export const PartnerSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    restaurantName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    cuisine: '',
    description: '',
    experience: '',
    website: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password fields
    if (!formData.password || !formData.confirmPassword) {
      alert('Please fill in both password fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    try {
      // Create a partner request in Firestore
      await addDoc(collection(db, 'partnerRequests'), {
        type: 'restaurant_owner',
        status: 'pending',
        submittedAt: new Date(),
        restaurantName: formData.restaurantName,
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        cuisine: formData.cuisine,
        description: formData.description,
        experience: formData.experience,
        website: formData.website,
        password: formData.password, // Store the password for admin approval
        adminNotes: '',
        processedAt: null,
        processedBy: null
      });

      console.log('Partner request submitted successfully');
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting partner request:', error);
      // You could add error handling here
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your interest in partnering with Grubz. We'll review your application and get back to you within 2-3 business days.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-[#dd3333] hover:bg-[#c52c2c]"
              >
                Back to Home
              </Button>
              <Button 
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Sign In to Existing Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <img src="/vector---0.svg" alt="Grubz logo" className="w-6 h-6" />
              <h1 className="text-xl font-bold">
                <span className="text-[#190c0c]">Grub</span>
                <span className="text-[#dd3333]">z</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Store className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Restaurant Partner</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join thousands of restaurants already partnering with Grubz to reach more customers and grow their business.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Restaurant Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Restaurant Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="restaurantName">Restaurant Name *</Label>
                  <Input
                    id="restaurantName"
                    value={formData.restaurantName}
                    onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                    placeholder="Enter restaurant name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                    placeholder="Enter owner name"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">Restaurant Address *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter complete restaurant address"
                  required
                />
              </div>

              {/* Cuisine and Experience */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cuisine">Cuisine Type *</Label>
                  <Input
                    id="cuisine"
                    value={formData.cuisine}
                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    placeholder="e.g., Italian, Chinese, Mexican"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years in Business</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    placeholder="e.g., 5 years"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Restaurant Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell us about your restaurant, specialties, and what makes you unique"
                  rows={4}
                />
              </div>

              {/* Website */}
              <div>
                <Label htmlFor="website">Website (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://your-restaurant-website.com"
                />
              </div>

              {/* Password Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Credentials</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#dd3333] hover:bg-[#c52c2c] text-white font-semibold py-3"
              >
                Request Partnership Access
              </Button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this form, you agree to our Terms of Service and Privacy Policy.
                Our admin team will review your application and send you an email notification within 2-3 business days.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

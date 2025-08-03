import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, Truck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DeliveryApplicationForm: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dateOfBirth: '',
    licenseNumber: '',
    experience: '',
    availability: '',
    emergencyContact: '',
    emergencyPhone: '',
    address: '',
    phone: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validate required fields
    if (!formData.dateOfBirth || !formData.licenseNumber || !formData.phone || !formData.address) {
      alert('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('🔄 Submitting delivery driver application...');
      
      // Save to deliveryApplications/{uid} collection
      await setDoc(doc(db, 'deliveryApplications', currentUser.id), {
        type: 'delivery_rider',
        status: 'pending',
        submittedAt: new Date(),
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        fullName: currentUser.name,
        dateOfBirth: formData.dateOfBirth,
        licenseNumber: formData.licenseNumber,
        experience: formData.experience,
        availability: formData.availability,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        address: formData.address,
        phone: formData.phone,
        adminNotes: '',
        processedAt: null,
        processedBy: null
      });

      console.log('✅ Delivery driver application submitted successfully');
      alert('Driver application submitted successfully! You will receive an email once it\'s reviewed.');
      
      // Reset form
      setFormData({
        dateOfBirth: '',
        licenseNumber: '',
        experience: '',
        availability: '',
        emergencyContact: '',
        emergencyPhone: '',
        address: '',
        phone: ''
      });

      // Navigate back to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('❌ Error submitting driver application:', error);
      alert('Error submitting application. Please try again.');
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
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Driver Application</h1>
            <p className="text-gray-600">Join our delivery team and earn money on your schedule</p>
          </div>
        </div>

        {/* Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <Input
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                  type="date"
                  required
                />
              </div>

              {/* License Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driver's License Number *
                </label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Enter your driver's license number"
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
                  placeholder="Enter your phone number"
                  type="tel"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your full address"
                  required
                />
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability (Optional)
                </label>
                <Textarea
                  value={formData.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="Describe your preferred working hours and days"
                  rows={3}
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Driving Experience (Optional)
                </label>
                <Textarea
                  value={formData.experience}
                  onChange={(e) => handleInputChange('experience', e.target.value)}
                  placeholder="Tell us about your driving and delivery experience"
                  rows={3}
                />
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Name (Optional)
                </label>
                <Input
                  value={formData.emergencyContact}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                  placeholder="Enter emergency contact name"
                />
              </div>

              {/* Emergency Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Contact Phone (Optional)
                </label>
                <Input
                  value={formData.emergencyPhone}
                  onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                  placeholder="Enter emergency contact phone number"
                  type="tel"
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
                    'Submit Driver Application'
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

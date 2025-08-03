import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicationService, DeliveryApplication } from '../../services/applications';
import { DeliveryDriverApplication } from '../applications/DeliveryDriverApplication';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Truck, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Car,
  Clock,
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  Shield,
  Loader2
} from 'lucide-react';

export const MyDeliveryInfo: React.FC = () => {
  const { currentUser } = useAuth();
  const [application, setApplication] = useState<DeliveryApplication | null>(null);
  const [driverData, setDriverData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    console.log('🔄 Setting up real-time delivery listeners for user:', currentUser.id);
    setLoading(true);

    let loadedCount = 0;
    const totalListeners = 2;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalListeners) {
        setLoading(false);
      }
    };

    // Listen to driver data from drivers/{uid}
    const unsubscribeDriver = onSnapshot(
      doc(db, 'drivers', currentUser.id),
      (doc) => {
        console.log('📄 Driver document updated:', doc.exists());
        if (doc.exists()) {
          setDriverData({
            id: doc.id,
            ...doc.data()
          });
        } else {
          setDriverData(null);
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in driver snapshot:', error);
        setDriverData(null);
        checkComplete();
      }
    );

    // Listen to application data from deliveryApplications/{uid}
    const unsubscribeApplication = onSnapshot(
      doc(db, 'deliveryApplications', currentUser.id),
      (doc) => {
        console.log('📄 Delivery application updated:', doc.exists());
        if (doc.exists()) {
          const data = doc.data();
          setApplication({
            id: doc.id,
            userId: currentUser.id,
            fullName: data.fullName || data.userName || '',
            dateOfBirth: data.dateOfBirth || '',
            licenseNumber: data.licenseNumber || '',
            experience: data.experience || '',
            availability: data.availability || '',
            emergencyContact: data.emergencyContact || '',
            emergencyPhone: data.emergencyPhone || '',
            address: data.address || '',
            phone: data.phone || '',
            status: data.status || 'pending',
            submittedAt: data.submittedAt,
            adminNotes: data.adminNotes || '',
            processedAt: data.processedAt,
            processedBy: data.processedBy || ''
          } as DeliveryApplication);
        } else {
          setApplication(null);
        }
        checkComplete();
      },
      (error) => {
        console.error('❌ Error in delivery application snapshot:', error);
        setApplication(null);
        checkComplete();
      }
    );

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up delivery listeners');
      unsubscribeDriver();
      unsubscribeApplication();
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-indigo-600" />
          <p className="text-gray-600">Loading delivery information...</p>
        </div>
      </div>
    );
  }

  // Show application form if no application exists or user clicks to apply/edit
  if (!application || showApplicationForm) {
    return (
      <div>
        {application && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowApplicationForm(false)}
              className="mb-4"
            >
              ← Back to Delivery Info
            </Button>
          </div>
        )}
        <DeliveryDriverApplication />
      </div>
    );
  }

  const formatAvailableDays = () => {
    const days = Object.entries(application.availableDays)
      .filter(([_, available]) => available)
      .map(([day, _]) => day.charAt(0).toUpperCase() + day.slice(1));
    return days.join(', ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Delivery Info</h1>
          <p className="text-gray-600">Manage your delivery driver information and settings</p>
        </div>
        <Button
          onClick={() => setShowApplicationForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Application
        </Button>
      </div>

      {/* Application Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Application Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {application.status === 'approved' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <Badge className={getStatusColor(application.status)}>Approved</Badge>
                </>
              ) : application.status === 'rejected' ? (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <Badge className={getStatusColor(application.status)}>Rejected</Badge>
                </>
              ) : (
                <>
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <Badge className={getStatusColor(application.status)}>Pending Review</Badge>
                </>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Submitted: <span className="font-medium">{application.submittedAt.toLocaleDateString()}</span>
            </div>
            {application.reviewedAt && (
              <div className="text-sm text-gray-600">
                Reviewed: <span className="font-medium">{application.reviewedAt.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">{application.fullName}</h3>
              <p className="text-sm text-gray-600">Full Name</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span>{application.email}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span>{application.phone}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span>{application.address}</span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span>Born: {new Date(application.dateOfBirth).toLocaleDateString()}</span>
              </div>
            </div>

            {(application.emergencyContact || application.emergencyPhone) && (
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</h4>
                {application.emergencyContact && (
                  <p className="text-sm text-gray-600">{application.emergencyContact}</p>
                )}
                {application.emergencyPhone && (
                  <p className="text-sm text-gray-600">{application.emergencyPhone}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vehicle Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 capitalize">{application.vehicleType}</h3>
              <p className="text-sm text-gray-600">Vehicle Type</p>
            </div>

            {(application.vehicleMake || application.vehicleModel || application.vehicleYear) && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Vehicle Details</h4>
                <p className="text-sm text-gray-600">
                  {[application.vehicleYear, application.vehicleMake, application.vehicleModel]
                    .filter(Boolean)
                    .join(' ')}
                </p>
                {application.vehicleColor && (
                  <p className="text-sm text-gray-600">Color: {application.vehicleColor}</p>
                )}
                {application.licensePlate && (
                  <p className="text-sm text-gray-600">License: {application.licensePlate}</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Documentation</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <span>License: {application.driversLicense}</span>
                </div>
                {application.vehicleRegistration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span>Registration: {application.vehicleRegistration}</span>
                  </div>
                )}
                {application.insurancePolicy && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span>Insurance: {application.insurancePolicy}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Available Days</h4>
              <p className="text-sm text-gray-600">{formatAvailableDays()}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preferred Hours</h4>
              <p className="text-sm text-gray-600">
                {application.preferredHours.start} - {application.preferredHours.end}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      {(application.deliveryExperience || application.previousEmployer || application.yearsOfExperience) && (
        <Card>
          <CardHeader>
            <CardTitle>Experience</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.yearsOfExperience && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Years of Experience</h4>
                <p className="text-sm text-gray-600">{application.yearsOfExperience} years</p>
              </div>
            )}
            
            {application.previousEmployer && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Previous Employer</h4>
                <p className="text-sm text-gray-600">{application.previousEmployer}</p>
              </div>
            )}
            
            {application.deliveryExperience && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Delivery Experience</h4>
                <p className="text-sm text-gray-600">{application.deliveryExperience}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      {(application.specialSkills || application.additionalNotes) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {application.specialSkills && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Special Skills</h4>
                <p className="text-sm text-gray-600">{application.specialSkills}</p>
              </div>
            )}
            
            {application.additionalNotes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">Additional Notes</h4>
                <p className="text-sm text-gray-600">{application.additionalNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

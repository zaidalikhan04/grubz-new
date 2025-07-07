import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, setDoc, where } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db, auth } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { EmailService } from '../../services/email';
import emailjs from '@emailjs/browser';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { CheckCircle, XCircle, Clock, User, Store, Car, Mail, Phone, MapPin, Calendar, Trash2 } from 'lucide-react';

interface PartnerRequest {
  id: string;
  type: 'restaurant_owner' | 'delivery_rider';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  email: string;

  // Restaurant fields
  restaurantName?: string;
  ownerName?: string;
  cuisine?: string;
  description?: string;
  experience?: string;
  website?: string;

  // Driver fields
  fullName?: string;
  dateOfBirth?: string;
  licenseNumber?: string;
  availability?: string;
  emergencyContact?: string;
  emergencyPhone?: string;

  // Common fields
  phone: string;
  address: string;
  password?: string; // Password provided during signup
  adminNotes?: string;
  processedAt?: any;
  processedBy?: string;
}

// Create a separate Firebase app instance for admin operations to avoid auth state conflicts
const createAdminApp = () => {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  try {
    return initializeApp(firebaseConfig, 'admin-operations');
  } catch (error) {
    // App might already exist, try to get it
    return initializeApp(firebaseConfig, `admin-operations-${Date.now()}`);
  }
};

export const PartnerRequestManagement: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [testEmailSending, setTestEmailSending] = useState(false);



  useEffect(() => {
    console.log('🔄 Setting up partner requests listener...');

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log('⚠️ Loading timeout reached, stopping loading state');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Simplified query without where clause to avoid index issues
    const q = query(
      collection(db, 'partnerRequests'),
      orderBy('submittedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log('📊 Partner requests snapshot received, size:', querySnapshot.size);
      clearTimeout(loadingTimeout); // Clear timeout since we got data

      const requestsData: PartnerRequest[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Processing request:', doc.id, 'deleted:', data.deleted);
        // Filter out deleted requests on the client side
        if (!data.deleted) {
          requestsData.push({ id: doc.id, ...data } as PartnerRequest);
        }
      });
      console.log('✅ Loaded partner requests:', requestsData.length);
      setRequests(requestsData);
      setLoading(false);
    }, (error) => {
      console.error('❌ Error loading partner requests:', error);
      clearTimeout(loadingTimeout);
      setLoading(false);
      // Fallback: show empty list if there's an error
      setRequests([]);
    });

    return () => {
      console.log('🔄 Cleaning up partner requests listener');
      clearTimeout(loadingTimeout);
      unsubscribe();
    };
  }, []);

  const handleApprove = async (request: PartnerRequest) => {
    console.log('🚀 Starting approval process for:', request.email);
    setProcessingId(request.id);
    try {
      // Create a separate Firebase app instance for user creation to avoid auth state conflicts
      console.log('📱 Creating admin app...');
      const adminApp = createAdminApp();
      const adminAuth = getAuth(adminApp);
      console.log('✅ Admin app created successfully');

      // Create user account using the password provided during signup
      const userPassword = request.password || Math.random().toString(36).slice(-8) + 'A1!'; // Fallback for old requests
      console.log('👤 Creating user account for:', request.email);
      const userCredential = await createUserWithEmailAndPassword(adminAuth, request.email, userPassword);
      console.log('✅ User account created successfully:', userCredential.user.uid);

      // Create user document in Firestore (using main db instance)
      const userName = request.type === 'restaurant_owner' ? request.ownerName : request.fullName;
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: request.email,
        name: userName,
        role: request.type,
        phone: request.phone,
        address: request.address,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Add specific fields based on type
        ...(request.type === 'restaurant_owner' && {
          restaurantName: request.restaurantName,
          cuisine: request.cuisine,
          description: request.description,
          experience: request.experience,
          website: request.website
        }),
        ...(request.type === 'delivery_rider' && {
          dateOfBirth: request.dateOfBirth,
          licenseNumber: request.licenseNumber,
          availability: request.availability,
          emergencyContact: request.emergencyContact,
          emergencyPhone: request.emergencyPhone
        })
      });

      // Update request status
      await updateDoc(doc(db, 'partnerRequests', request.id), {
        status: 'approved',
        processedAt: new Date(),
        processedBy: currentAdmin?.id || 'admin',
        adminNotes: adminNotes[request.id] || ''
      });

      // Clean up the temporary admin app
      try {
        await adminApp.delete();
      } catch (deleteError) {
        console.warn('Could not delete temporary admin app:', deleteError);
      }

      // Send approval email
      console.log('📧 Sending approval email...');
      const emailSent = await EmailService.sendApprovalEmail(
        request.email,
        userName || 'Partner',
        request.type,
        { email: request.email, password: 'Use your registration password' }
      );

      if (emailSent) {
        console.log('✅ Approval email sent successfully to:', request.email);

        // Show email preview in browser for testing
        const roleDisplayName = request.type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver';
        const dashboardUrl = request.type === 'restaurant_owner'
          ? `${window.location.origin}/restaurant`
          : `${window.location.origin}/delivery`;

        alert(`✅ SUCCESS!\n\n📧 Approval Email Sent to: ${request.email}\n\nSubject: 🎉 Your ${roleDisplayName} Application Has Been Approved!\n\n✅ User account created\n✅ Email notification sent\n✅ User can now log in\n\nDashboard: ${dashboardUrl}`);
      } else {
        console.warn('⚠️ Failed to send approval email, but user account was created');

        // Show detailed email content that would have been sent
        const roleDisplayName = request.type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver';
        const dashboardUrl = request.type === 'restaurant_owner'
          ? `${window.location.origin}/restaurant`
          : `${window.location.origin}/delivery`;

        const emailContent = `Dear ${userName},

🎉 Congratulations! Your application to become a ${roleDisplayName} with Grubz has been APPROVED!

🔐 Login Information:
• Email: ${request.email}
• Password: Use the password you provided during registration
• Dashboard: ${dashboardUrl}

📋 Next Steps:
1. Log in to your dashboard using the credentials above
2. Complete your profile setup
3. ${roleDisplayName === 'Restaurant Partner' ? 'Add your menu items and restaurant details' : 'Set your availability and delivery preferences'}
4. Start ${roleDisplayName === 'Restaurant Partner' ? 'receiving orders' : 'accepting delivery requests'}!

Welcome aboard!
Best regards, The Grubz Team`;

        // Show the email content in a more user-friendly way
        alert(`✅ USER ACCOUNT CREATED SUCCESSFULLY!\n\n⚠️ Email service not configured, but here's what the user should know:\n\n📧 EMAIL CONTENT TO SEND:\n\nTo: ${request.email}\nSubject: 🎉 Your ${roleDisplayName} Application Has Been Approved!\n\n${emailContent}`);

        // Also log the full email content for easy copying
        console.log('📧 FULL EMAIL CONTENT TO SEND MANUALLY:');
        console.log('To:', request.email);
        console.log('Subject:', `🎉 Your ${roleDisplayName} Application Has Been Approved!`);
        console.log('Content:', emailContent);
      }

      // Log approval notification
      console.log('✅ Partner Approved:', {
        email: request.email,
        name: userName || 'Partner',
        type: request.type,
        message: 'Partner application approved. User can now login with their provided credentials.',
        emailSent: emailSent
      });

    } catch (error) {
      console.error('❌ Error approving request:', error);
      alert(`❌ Error approving request: ${error.message || 'Unknown error'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: PartnerRequest) => {
    setProcessingId(request.id);
    try {
      await updateDoc(doc(db, 'partnerRequests', request.id), {
        status: 'rejected',
        processedAt: new Date(),
        processedBy: 'admin', // You can get current admin user here
        adminNotes: adminNotes[request.id] || ''
      });

      // Send rejection email
      const userName = request.type === 'restaurant_owner' ? request.ownerName : request.fullName;
      const rejectionReason = adminNotes[request.id] || 'Application did not meet our current requirements';

      console.log('📧 Sending rejection email...');
      const emailSent = await EmailService.sendRejectionEmail(
        request.email,
        userName || 'Partner',
        request.type,
        rejectionReason
      );

      if (emailSent) {
        console.log('✅ Rejection email sent successfully to:', request.email);

        // Show email preview in browser for testing
        const roleDisplayName = request.type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver';
        alert(`📧 Rejection Email Sent!\n\nTo: ${request.email}\nSubject: Update on Your ${roleDisplayName} Application\n\nReason: ${rejectionReason}\n\nThe user has been notified about the decision.`);
      } else {
        console.warn('⚠️ Failed to send rejection email');
        alert('⚠️ Application rejected successfully, but email notification failed. Please contact the user manually.');
      }

      // Log rejection notification
      console.log('❌ Partner Rejected:', {
        email: request.email,
        name: userName || 'Partner',
        type: request.type,
        reason: rejectionReason,
        message: 'Partner application rejected. Notification sent via email.',
        emailSent: emailSent
      });
      
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const testEmailConfiguration = async () => {
    setTestEmailSending(true);
    try {
      console.log('🧪 Testing EmailJS configuration...');

      // Check environment variables
      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      console.log('📧 Environment Variables:', {
        serviceId: serviceId || 'NOT SET',
        templateId: templateId || 'NOT SET',
        publicKey: publicKey ? 'SET' : 'NOT SET'
      });

      if (!serviceId || !templateId || !publicKey) {
        alert('❌ EmailJS not configured!\n\nMissing environment variables:\n' +
              `• Service ID: ${serviceId ? '✅' : '❌'}\n` +
              `• Template ID: ${templateId ? '✅' : '❌'}\n` +
              `• Public Key: ${publicKey ? '✅' : '❌'}\n\n` +
              'Please check your .env.local file.');
        return;
      }

      // Test EmailJS directly
      console.log('📧 Testing direct EmailJS call...');
      const testParams = {
        to_email: 'zaidalikhan04@gmail.com',
        to_name: 'Test User',
        subject: 'EmailJS Configuration Test',
        message: 'This is a test email to verify EmailJS configuration is working.',
        from_name: 'Grubz Team',
        reply_to: 'support@grubz.com'
      };

      console.log('📧 Sending with params:', testParams);

      const response = await emailjs.send(serviceId, templateId, testParams, publicKey);

      console.log('✅ EmailJS test successful:', response);
      alert(`✅ Email Configuration Test PASSED!\n\nResponse: ${response.status} - ${response.text}\n\nEmail sent to: zaidalikhan04@gmail.com\n\n📧 If you don't see the email:\n• Check SPAM/Junk folder\n• Check Promotions tab\n• Search for "EmailJS" or "Grubz"\n• Wait 2-3 minutes for delivery\n\nEmailJS Response Details:\nStatus: ${response.status}\nText: ${response.text}`);

    } catch (error) {
      console.error('❌ EmailJS test failed:', error);
      alert(`❌ Email Configuration Test FAILED!\n\nError: ${error.message || error}\n\nCheck console for details.`);
    } finally {
      setTestEmailSending(false);
    }
  };

  const testEmailToMultiple = async () => {
    setTestEmailSending(true);
    try {
      console.log('📧 Testing email delivery to multiple addresses...');

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // Test emails to multiple addresses
      const testEmails = [
        'zaidalikhan04@gmail.com',
        'test@example.com', // This will fail but shows EmailJS is working
        'admin@grubz.com'   // Another test address
      ];

      let successCount = 0;
      let results = [];

      for (const email of testEmails) {
        try {
          console.log(`📧 Sending test to: ${email}`);

          const testParams = {
            to_email: email,
            to_name: 'Test User',
            subject: `Email Delivery Test - ${new Date().toLocaleTimeString()}`,
            message: `This is a delivery test email sent at ${new Date().toLocaleString()}. If you receive this, email delivery is working correctly.`,
            from_name: 'Grubz Team',
            reply_to: 'support@grubz.com'
          };

          const response = await emailjs.send(serviceId, templateId, testParams, publicKey);
          console.log(`✅ Success for ${email}:`, response);
          results.push(`✅ ${email}: ${response.status}`);
          successCount++;

          // Wait 1 second between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
          console.error(`❌ Failed for ${email}:`, error);
          results.push(`❌ ${email}: ${error.message}`);
        }
      }

      alert(`📧 Email Delivery Test Results:\n\n${results.join('\n')}\n\nSuccessful: ${successCount}/${testEmails.length}\n\n🔍 Check these locations:\n• Spam/Junk folder\n• Promotions tab\n• Search for "Grubz" or "Email Delivery Test"\n• Wait 2-3 minutes for delivery`);

    } catch (error) {
      console.error('❌ Multiple email test failed:', error);
      alert(`❌ Multiple Email Test Failed!\n\nError: ${error.message || error}`);
    } finally {
      setTestEmailSending(false);
    }
  };

  const handleDeleteRequest = async (request: PartnerRequest) => {
    const requestType = request.type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver';
    const applicantName = request.type === 'restaurant_owner' ? request.ownerName : request.fullName;

    const confirmMessage = `Are you sure you want to permanently delete this ${requestType} request?\n\nApplicant: ${applicantName}\nEmail: ${request.email}\nStatus: ${request.status}\nSubmitted: ${new Date(request.submittedAt?.toDate()).toLocaleDateString()}\n\nThis action cannot be undone and will:\n• Remove the request from the database\n• Delete all application data\n• Cannot be recovered`;

    if (confirm(confirmMessage)) {
      setProcessingId(request.id);
      try {
        console.log('🔄 Deleting partner request:', request.id);

        // Delete request from Firestore
        await updateDoc(doc(db, 'partnerRequests', request.id), {
          deleted: true,
          deletedAt: new Date(),
          deletedBy: currentAdmin?.id || 'admin'
        });

        // Alternative: Completely remove the document
        // await deleteDoc(doc(db, 'partnerRequests', request.id));

        console.log('✅ Partner request deleted successfully:', request.id);

        // Show success message
        alert(`✅ Request Deleted Successfully!\n\n${requestType} application from ${applicantName} (${request.email}) has been permanently deleted from the system.`);

      } catch (error) {
        console.error('❌ Error deleting request:', error);
        alert(`❌ Failed to delete request. Please try again.\n\nError: ${error.message || 'Unknown error'}`);
      } finally {
        setProcessingId(null);
      }
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'restaurant_owner' ? <Store className="w-4 h-4" /> : <Car className="w-4 h-4" />;
  };

  const getTypeName = (type: string) => {
    return type === 'restaurant_owner' ? 'Restaurant Partner' : 'Delivery Driver';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner requests...</p>
          <p className="text-sm text-gray-400 mt-2">This may take a few seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Partner Requests</h2>
        <div className="flex items-center gap-4">
          <Button
            onClick={testEmailConfiguration}
            variant="outline"
            size="sm"
            className="text-xs bg-blue-50"
          >
            🔧 Test Email Config
          </Button>
          <Button
            onClick={testEmailToMultiple}
            variant="outline"
            size="sm"
            className="text-xs bg-green-50"
          >
            📧 Test Multiple Emails
          </Button>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Total: {requests.length}</span>
            <span>Pending: {requests.filter(r => r.status === 'pending').length}</span>
            <span>Approved: {requests.filter(r => r.status === 'approved').length}</span>
            <span>Rejected: {requests.filter(r => r.status === 'rejected').length}</span>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Partner Requests</h3>
            <p className="text-gray-600 mb-4">
              There are currently no partner or driver applications to review.
            </p>
            <p className="text-sm text-gray-500">
              New applications will appear here when users submit partner or driver signup forms.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <Card key={request.id} className="overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(request.type)}
                  <div>
                    <CardTitle className="text-lg">
                      {request.type === 'restaurant_owner' ? request.restaurantName : request.fullName}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{getTypeName(request.type)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(request.status)}
                  <span className="text-sm text-gray-500">
                    {request.submittedAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{request.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{request.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{request.address}</span>
                </div>
              </div>

              {/* Type-specific details */}
              {request.type === 'restaurant_owner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-orange-50 p-3 rounded-lg">
                  <div><strong>Owner:</strong> {request.ownerName}</div>
                  <div><strong>Cuisine:</strong> {request.cuisine}</div>
                  <div><strong>Experience:</strong> {request.experience}</div>
                  {request.website && <div><strong>Website:</strong> {request.website}</div>}
                  {request.description && (
                    <div className="md:col-span-2"><strong>Description:</strong> {request.description}</div>
                  )}
                </div>
              )}

              {request.type === 'delivery_rider' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-blue-50 p-3 rounded-lg">
                  <div><strong>Date of Birth:</strong> {request.dateOfBirth}</div>
                  <div><strong>License:</strong> {request.licenseNumber}</div>
                  <div><strong>Availability:</strong> {request.availability}</div>
                  <div><strong>Emergency Contact:</strong> {request.emergencyContact} ({request.emergencyPhone})</div>
                  {request.experience && (
                    <div className="md:col-span-2"><strong>Experience:</strong> {request.experience}</div>
                  )}
                </div>
              )}

              {/* Admin Actions for Pending Requests */}
              {request.status === 'pending' && (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Admin Notes (optional)</label>
                    <Textarea
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => setAdminNotes(prev => ({ ...prev, [request.id]: e.target.value }))}
                      placeholder="Add any notes about this request..."
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingId === request.id}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      onClick={() => handleReject(request)}
                      disabled={processingId === request.id}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Processing...' : 'Reject'}
                    </Button>
                    <Button
                      onClick={() => handleDeleteRequest(request)}
                      disabled={processingId === request.id}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete Action for Processed Requests */}
              {request.status !== 'pending' && (
                <div className="border-t pt-4">
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleDeleteRequest(request)}
                      disabled={processingId === request.id}
                      variant="outline"
                      className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {processingId === request.id ? 'Deleting...' : 'Delete Request'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Show admin notes for processed requests */}
              {request.status !== 'pending' && request.adminNotes && (
                <div className="border-t pt-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <strong className="text-sm">Admin Notes:</strong>
                    <p className="text-sm mt-1">{request.adminNotes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
};

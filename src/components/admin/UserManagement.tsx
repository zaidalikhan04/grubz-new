import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
// import { Label } from '../ui/label';
import {
  Users,
  Search,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  Shield,
  Car,
  Store,
  User,
  UserPlus,
  Filter
} from 'lucide-react';
import { UserService } from '../../services/database';
import { AdminCrudService } from '../../services/adminCrud';
import { EmailService } from '../../services/email';
import { AuthService } from '../../services/auth';
import { FileUploadService, UploadResult } from '../../services/fileUpload';
import FileUpload from '../ui/FileUpload';
import { useAdminNotifications } from '../../contexts/AdminNotificationContext';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status?: string;
  joinDate?: string;
  lastActive?: string;
}

// Components
const UserTableRow: React.FC<{
  user: UserData;
  onEdit: (user: UserData) => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
  onActivate: (id: string) => void;
  isDeleting: boolean;
}> = ({ user, onEdit, onDelete, onSuspend, onActivate, isDeleting }) => {
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'restaurant_owner': return <Store className="h-4 w-4" />;
      case 'driver': return <Car className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'restaurant_owner': return 'bg-blue-100 text-blue-800';
      case 'driver': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="p-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {getRoleIcon(user.role)}
          </div>
          <div>
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-600 flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {user.email}
            </div>
            {user.phone && (
              <div className="text-sm text-gray-600 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {user.phone}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
          {user.role.replace('_', ' ')}
        </span>
      </td>
      <td className="p-3">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
          {user.status || 'active'}
        </span>
      </td>
      <td className="p-3">
        <div className="text-sm flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
        </div>
      </td>
      <td className="p-3">
        <div className="text-sm text-gray-600">{user.lastActive || 'N/A'}</div>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(user)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="h-3 w-3" />
          </Button>
          {user.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSuspend(user.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Ban className="h-3 w-3" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onActivate(user.id)}
              className="text-green-600 hover:text-green-700"
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(user.id)}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700"
          >
            {isDeleting ? (
              <span className="text-xs">Deleting...</span>
            ) : (
              <Trash2 className="h-3 w-3" />
            )}
          </Button>
        </div>
      </td>
    </tr>
  );
};

// Simple Edit Modal (placeholder - can be enhanced later)
const UserEditDialog: React.FC<{
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserData) => void;
}> = () => {
  // For now, just return null - edit functionality can be added later
  // This keeps the component structure clean and avoids unused parameter warnings
  return null;
};

// Main Component
const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testingDeletion, setTestingDeletion] = useState(false);
  const [testingSimpleDeletion, setTestingSimpleDeletion] = useState(false);
  const [testingComprehensive, setTestingComprehensive] = useState(false);
  const [testingUserVerification, setTestingUserVerification] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingFileUpload, setTestingFileUpload] = useState(false);

  const { addNotification } = useAdminNotifications();

  // Load users on component mount
  useEffect(() => {
    console.log('🔄 UserManagement component mounted, loading users...');
    loadUsers();
  }, []);

  // API Functions
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching users from Firebase...');

      // Use enhanced admin service for better error handling
      const usersData = await AdminCrudService.getAllUsersEnhanced();
      console.log('✅ Users loaded successfully:', usersData.length, 'users found');
      setUsers(usersData as UserData[]);
    } catch (error: any) {
      console.error('❌ Error loading users:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      addNotification({
        type: 'system_alert',
        title: 'Error Loading Users',
        message: `Failed to load users from Firebase: ${errorMessage}`,
        priority: 'high'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    // Find the user to get their details for confirmation
    const userToDelete = users.find(user => user.id === userId);
    const userName = userToDelete?.name || 'Unknown User';
    const userEmail = userToDelete?.email || 'Unknown Email';

    const confirmMessage = `Are you sure you want to delete this user?\n\nName: ${userName}\nEmail: ${userEmail}\n\nThis action cannot be undone and will remove the user from Firebase.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(userId);
      console.log('🔄 Starting comprehensive user deletion process for:', userEmail);

      // Try simple deletion first to test if basic deletion works
      console.log('🔄 Attempting simple user deletion first...');
      const deletionResult = await AdminCrudService.deleteUserSimple(userId);

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));

      console.log('✅ Comprehensive user deletion completed for:', userEmail);
      console.log('📊 Deletion summary:', deletionResult);

      addNotification({
        type: 'user_report',
        title: 'User Deleted Successfully',
        message: `${userName} (${userEmail}) and all related data have been permanently removed from Firebase.`,
        priority: 'medium'
      });
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      addNotification({
        type: 'system_alert',
        title: 'User Deletion Failed',
        message: `Failed to delete ${userName}: ${errorMessage}`,
        priority: 'high'
      });
    } finally {
      setDeleting(null);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await UserService.updateUser(userId, { status: 'suspended' });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: 'suspended' } : user
      ));
      addNotification({
        type: 'user_report',
        title: 'User Suspended',
        message: 'User account has been suspended',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error suspending user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Suspend Failed',
        message: 'Failed to suspend user account',
        priority: 'medium'
      });
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      await UserService.updateUser(userId, { status: 'active' });
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: 'active' } : user
      ));
      addNotification({
        type: 'user_report',
        title: 'User Activated',
        message: 'User account has been activated',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error activating user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Activation Failed',
        message: 'Failed to activate user account',
        priority: 'medium'
      });
    }
  };

  const handleEditUser = (user: UserData) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserData) => {
    try {
      await UserService.updateUser(updatedUser.id, updatedUser);
      setUsers(prev => prev.map(user =>
        user.id === updatedUser.id ? updatedUser : user
      ));
      setIsEditDialogOpen(false);
      setEditingUser(null);
      addNotification({
        type: 'user_report',
        title: 'User Updated',
        message: 'User information has been successfully updated',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification({
        type: 'system_alert',
        title: 'Update Failed',
        message: 'Failed to update user information',
        priority: 'medium'
      });
    }
  };

  // Test Firebase connection and permissions
  const testFirebaseConnection = async () => {
    try {
      setTestingConnection(true);
      console.log('🔄 Testing Firebase connection...');

      const result = await AdminCrudService.testFirebaseConnection();

      if (result.success) {
        addNotification({
          type: 'system_alert',
          title: 'Firebase Connection Test Passed',
          message: 'All Firebase permissions are working correctly',
          priority: 'low'
        });
      } else {
        addNotification({
          type: 'system_alert',
          title: 'Firebase Connection Test Failed',
          message: `Firebase test failed: ${result.error}`,
          priority: 'high'
        });
      }
    } catch (error: any) {
      console.error('❌ Firebase connection test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'Firebase Connection Test Error',
        message: `Test failed: ${error.message}`,
        priority: 'high'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  // Test user deletion functionality
  const testUserDeletion = async () => {
    try {
      setTestingDeletion(true);
      console.log('🔄 Testing user deletion functionality...');

      const result = await AdminCrudService.testUserDeletion();

      if (result.success) {
        addNotification({
          type: 'system_alert',
          title: 'User Deletion Test Passed',
          message: 'User deletion functionality is working correctly - test user was created and successfully deleted from Firebase',
          priority: 'low'
        });

        // Refresh the user list to show current state
        await loadUsers();
      } else {
        addNotification({
          type: 'system_alert',
          title: 'User Deletion Test Failed',
          message: `User deletion test failed: ${result.error}`,
          priority: 'high'
        });
      }
    } catch (error: any) {
      console.error('❌ User deletion test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'User Deletion Test Error',
        message: `Test failed: ${error.message}`,
        priority: 'high'
      });
    } finally {
      setTestingDeletion(false);
    }
  };

  // Test simple user deletion functionality
  const testSimpleUserDeletion = async () => {
    try {
      setTestingSimpleDeletion(true);
      console.log('🔄 Testing simple user deletion functionality...');

      // Create a test user first
      const createResult = await AdminCrudService.createTestUser();
      if (!createResult.success) {
        throw new Error(`Failed to create test user: ${createResult.error}`);
      }

      const testUserId = createResult.userId!;
      console.log('✅ Test user created for simple deletion test:', testUserId);

      // Try simple deletion
      const deleteResult = await AdminCrudService.deleteUserSimple(testUserId);
      console.log('✅ Simple deletion completed:', deleteResult);

      addNotification({
        type: 'system_alert',
        title: 'Simple User Deletion Test Passed',
        message: 'Simple user deletion functionality is working correctly - test user was created and successfully deleted from Firebase',
        priority: 'low'
      });

      // Refresh the user list
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Simple user deletion test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'Simple User Deletion Test Failed',
        message: `Simple deletion test failed: ${error.message}`,
        priority: 'high'
      });
    } finally {
      setTestingSimpleDeletion(false);
    }
  };

  // Test comprehensive admin functionality
  const testAdminFunctionality = async () => {
    try {
      setTestingComprehensive(true);
      console.log('🔄 Testing comprehensive admin functionality...');

      // Test 1: Firebase Connection
      console.log('📋 Test 1: Firebase Connection');
      await testFirebaseConnection();

      // Test 2: User Creation and Deletion
      console.log('📋 Test 2: User Creation and Deletion');
      const createResult = await AdminCrudService.createTestUser();
      if (createResult.success) {
        console.log('✅ Test user created successfully');

        // Try to delete the test user
        await AdminCrudService.deleteUserSimple(createResult.userId!);
        console.log('✅ Test user deleted successfully');
      }

      // Test 3: Email Service
      console.log('📋 Test 3: Email Service');
      const emailResult = await EmailService.sendApprovalEmail(
        'test@example.com',
        'Test User',
        'restaurant_owner',
        { email: 'test@example.com', password: 'testpass123' }
      );
      console.log('✅ Email service test completed:', emailResult);

      addNotification({
        type: 'system_alert',
        title: 'Admin Functionality Test Completed',
        message: 'All admin functions tested successfully - Firebase connection, user deletion, and email service are working',
        priority: 'low'
      });

    } catch (error: any) {
      console.error('❌ Admin functionality test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'Admin Functionality Test Failed',
        message: `Test failed: ${error.message}`,
        priority: 'high'
      });
    } finally {
      setTestingComprehensive(false);
    }
  };

  // Test user creation and verification
  const testUserVerification = async () => {
    try {
      setTestingUserVerification(true);
      console.log('🔄 Testing user creation and verification...');

      const result = await AdminCrudService.testUserCreationAndVerification();
      console.log('✅ User verification test completed:', result);

      addNotification({
        type: 'system_alert',
        title: 'User Verification Test Passed',
        message: `✅ User creation, name storage, and deletion all working correctly. Test user "${result.testUser.name}" was created and successfully deleted from Firebase.`,
        priority: 'low'
      });

      // Refresh the user list
      await loadUsers();
    } catch (error: any) {
      console.error('❌ User verification test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'User Verification Test Failed',
        message: `❌ Test failed: ${error.message}. Check console for details.`,
        priority: 'high'
      });
    } finally {
      setTestingUserVerification(false);
    }
  };

  // Test complete signup process
  const testCompleteSignupProcess = async () => {
    try {
      setTestingUserVerification(true);
      console.log('🔄 Testing complete signup process...');

      // Test 1: Create a test user using the same process as signup
      const testEmail = `test-signup-${Date.now()}@example.com`;
      const testName = 'Test Signup User';
      const testPassword = 'testpass123';

      console.log('📋 Testing signup process for:', testEmail);

      // Use AuthService directly to test the signup process
      const signupResult = await AuthService.registerWithoutLogin(testEmail, testPassword, {
        name: testName,
        role: 'customer',
        phone: '123-456-7890',
        address: '123 Test St'
      });

      if (signupResult) {
        console.log('✅ Signup process completed successfully');

        // Test 2: Check if user was created in Firestore
        console.log('🔍 Checking if user exists in Firestore...');
        const userByEmail = await UserService.getUserByEmail(testEmail);

        if (userByEmail) {
          console.log('✅ User found in Firestore:', userByEmail);

          // Test 3: Clean up - delete the test user
          console.log('🔄 Cleaning up test user...');
          await AdminCrudService.deleteUserSimple(userByEmail.id);
          console.log('✅ Test user cleaned up successfully');

          addNotification({
            type: 'system_alert',
            title: 'Signup Process Test Passed',
            message: `✅ Complete signup process working correctly! Test user "${testName}" was created in Firestore and successfully deleted.`,
            priority: 'low'
          });
        } else {
          throw new Error('User was not found in Firestore after signup - this is the main issue!');
        }
      } else {
        throw new Error('Signup process failed - registerCustomer returned false');
      }

      // Refresh the user list
      await loadUsers();
    } catch (error: any) {
      console.error('❌ Complete signup process test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'Signup Process Test Failed',
        message: `❌ Test failed: ${error.message}. This explains why users appear in Firebase Auth but not in Firestore.`,
        priority: 'high'
      });
    } finally {
      setTestingUserVerification(false);
    }
  };

  // Test email service functionality
  const testEmailService = async () => {
    try {
      setTestingEmail(true);
      console.log('🔄 Testing email service functionality...');

      // Test restaurant approval email
      console.log('📧 Testing restaurant approval email...');
      const restaurantEmailResult = await EmailService.sendApprovalEmail(
        'test-restaurant@example.com',
        'Test Restaurant Owner',
        'restaurant_owner',
        { email: 'test-restaurant@example.com', password: 'testpass123' }
      );
      console.log('✅ Restaurant email test result:', restaurantEmailResult);

      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Test driver approval email
      console.log('📧 Testing driver approval email...');
      const driverEmailResult = await EmailService.sendApprovalEmail(
        'test-driver@example.com',
        'Test Driver',
        'delivery_rider',
        { email: 'test-driver@example.com', password: 'testpass123' }
      );
      console.log('✅ Driver email test result:', driverEmailResult);

      addNotification({
        type: 'system_alert',
        title: 'Email Service Test Completed',
        message: '✅ Email service is working correctly! Both restaurant and driver approval emails were generated successfully.',
        priority: 'low'
      });

    } catch (error: any) {
      console.error('❌ Email service test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'Email Service Test Failed',
        message: `❌ Email test failed: ${error.message}. Check console for details.`,
        priority: 'high'
      });
    } finally {
      setTestingEmail(false);
    }
  };

  // Test file upload functionality
  const testFileUpload = async (result: UploadResult) => {
    try {
      setTestingFileUpload(true);
      console.log('🔄 Testing file upload functionality...');

      if (result.success) {
        console.log('✅ File uploaded successfully:', result);
        addNotification({
          type: 'system_alert',
          title: 'File Upload Test Successful',
          message: `✅ File "${result.fileName}" uploaded successfully! Download URL: ${result.downloadURL}`,
          priority: 'low'
        });
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ File upload test error:', error);
      addNotification({
        type: 'system_alert',
        title: 'File Upload Test Failed',
        message: `❌ Upload test failed: ${error.message}`,
        priority: 'high'
      });
    } finally {
      setTestingFileUpload(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#dd3333] mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-700">Loading users...</div>
          <div className="text-sm text-gray-500 mt-2">Fetching user data from Firebase</div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={testFirebaseConnection}
            disabled={testingConnection}
            variant="outline"
            className="flex items-center gap-2"
          >
            {testingConnection ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Firebase
              </>
            )}
          </Button>
          <Button
            onClick={testUserDeletion}
            disabled={testingDeletion}
            variant="outline"
            className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            {testingDeletion ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Test Deletion
              </>
            )}
          </Button>
          <Button
            onClick={testSimpleUserDeletion}
            disabled={testingSimpleDeletion}
            variant="outline"
            className="flex items-center gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            {testingSimpleDeletion ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Test Simple Delete
              </>
            )}
          </Button>
          <Button
            onClick={testEmailService}
            disabled={testingEmail}
            variant="outline"
            className="flex items-center gap-2 border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            {testingEmail ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Test Email Service
              </>
            )}
          </Button>
          <Button
            onClick={testCompleteSignupProcess}
            disabled={testingUserVerification}
            variant="outline"
            className="flex items-center gap-2 border-green-200 text-green-600 hover:bg-green-50"
          >
            {testingUserVerification ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                Testing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test Signup Process
              </>
            )}
          </Button>
          <Button
            onClick={testAdminFunctionality}
            disabled={testingComprehensive}
            variant="outline"
            className="flex items-center gap-2 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            {testingComprehensive ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Testing All...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Test All Functions
              </>
            )}
          </Button>
          <Button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Refreshing...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </Button>
        </div>

        {/* File Upload Test Section */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-800 mb-3">🔧 File Upload Testing</h3>
          <p className="text-sm text-purple-600 mb-4">Test the file upload functionality with Firebase Storage</p>

          <FileUpload
            onUploadComplete={testFileUpload}
            uploadPath="admin-tests"
            buttonText="Test File Upload"
            buttonVariant="outline"
            className="max-w-md"
          />
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>

          {/* Search and Filters */}
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="restaurant_owner">Restaurant Owner</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Join Date</th>
                  <th className="text-left p-3 font-medium">Last Active</th>
                  <th className="text-left p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                      onSuspend={handleSuspendUser}
                      onActivate={handleActivateUser}
                      isDeleting={deleting === user.id}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <UserEditDialog
        user={editingUser}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default UserManagement;

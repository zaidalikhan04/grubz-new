import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ProfilePictureUpload } from '../ui/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { AuthService } from '../../services/auth';
import { ImageUploadService } from '../../services/imageUpload';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';

export const ProfileSection: React.FC = () => {
  const { currentUser } = useAuth();
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);

  // Safe date formatting utility with memoization
  const formatCreatedDate = useMemo(() => {
    if (!currentUser?.createdAt) {
      return 'N/A';
    }

    try {
      let date: Date;

      // Handle Firestore Timestamp
      if (currentUser.createdAt && typeof currentUser.createdAt === 'object' && 'toDate' in currentUser.createdAt) {
        date = currentUser.createdAt.toDate();
      }
      // Handle ISO string or number
      else if (typeof currentUser.createdAt === 'string' || typeof currentUser.createdAt === 'number') {
        date = new Date(currentUser.createdAt);
      }
      // Handle Date object
      else if (currentUser.createdAt instanceof Date) {
        date = currentUser.createdAt;
      }
      // Fallback
      else {
        return 'N/A';
      }

      // Validate the date
      if (isNaN(date.getTime())) {
        return 'N/A';
      }

      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting createdAt date:', error);
      return 'N/A';
    }
  }, [currentUser?.createdAt]);

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </CardContent>
      </Card>
    );
  }

  const handleProfilePictureUpload = async (file: File): Promise<string> => {
    if (!currentUser?.id) {
      throw new Error('User not authenticated');
    }

    setIsUpdatingPicture(true);
    try {
      // Upload image using alternative service (no Firebase Storage needed!)
      const result = await AlternativeImageUploadService.uploadProfilePicture(
        currentUser.id,
        file,
        (progress) => {
          console.log(`Profile picture upload progress: ${progress.progress}%`);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update user profile in Firestore
      await AuthService.updateProfilePicture(currentUser.id, result.url!);

      console.log('✅ Profile picture updated successfully via', result.provider);
      return result.url!;
    } catch (error) {
      console.error('❌ Error updating profile picture:', error);
      throw error;
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const handleProfilePictureRemove = async (): Promise<void> => {
    if (!currentUser?.profilePictureUrl || !currentUser?.id) return;

    setIsUpdatingPicture(true);
    try {
      // Delete image from Firebase Storage
      const storagePath = ImageUploadService.getStoragePathFromUrl(currentUser.profilePictureUrl);
      if (storagePath) {
        await ImageUploadService.deleteImage(storagePath);
      }

      // Remove URL from user profile in Firestore
      await AuthService.updateProfilePicture(currentUser.id, '');

      console.log('✅ Profile picture removed successfully');
    } catch (error) {
      console.error('❌ Error removing profile picture:', error);
      throw error;
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'customer':
        return 'Customer';
      case 'restaurant_owner':
        return 'Restaurant Owner';
      case 'delivery_rider':
        return 'Delivery Driver';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'customer':
        return 'bg-blue-100 text-blue-800';
      case 'restaurant_owner':
        return 'bg-green-100 text-green-800';
      case 'delivery_rider':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          My Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <ProfilePictureUpload
            currentImageUrl={currentUser?.profilePictureUrl}
            onImageUpload={handleProfilePictureUpload}
            onImageRemove={currentUser?.profilePictureUrl ? handleProfilePictureRemove : undefined}
            disabled={isUpdatingPicture}
          />
          <div className="text-center">
            <h3 className="text-lg font-semibold">{currentUser?.name || 'User'}</h3>
            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(currentUser?.role || 'customer')}`}>
              <Shield className="h-3 w-3" />
              {getRoleDisplayName(currentUser?.role || 'customer')}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{currentUser?.email || 'No email'}</p>
              </div>
            </div>

            {currentUser?.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Phone</p>
                  <p className="text-sm text-gray-900">{currentUser.phone}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {currentUser?.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Address</p>
                  <p className="text-sm text-gray-900">{currentUser.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">Member Since</p>
                <p className="text-sm text-gray-900">
                  {formatCreatedDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Status */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentUser?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-sm text-gray-600">
                Email {currentUser?.emailVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${currentUser?.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                Account {currentUser?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" className="w-full md:w-auto">
            Edit Profile Information
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

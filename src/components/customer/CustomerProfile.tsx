import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { ProfilePictureUpload } from '../ui/ImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { UserService } from '../../services/database';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  User,
  Camera,
  Edit,
  Save,
  MapPin,
  Phone,
  Mail,
  Upload,
  Loader,
  Wifi,
  WifiOff,
  CheckCircle
} from 'lucide-react';

export const CustomerProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    profilePhoto: '',
    dateJoined: '',
    totalOrders: 0,
    favoriteRestaurants: 0,
    averageRating: 0,
    moneySaved: 0
  });

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update last update time when user data changes
  useEffect(() => {
    if (currentUser) {
      setLastUpdate(new Date());
    }
  }, [currentUser]);

  // Set up real-time listener for user profile data
  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    console.log('🔄 Setting up real-time profile listener for:', currentUser.id);

    // Set up real-time listener using onSnapshot
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.id),
      (doc) => {
        console.log('📄 Profile document updated:', doc.exists(), doc.data());
        if (doc.exists()) {
          const userData = doc.data();
          setProfileData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            profilePhoto: userData.profilePhoto || '',
            dateJoined: userData.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : '',
            totalOrders: userData.totalOrders || 0,
            favoriteRestaurants: userData.favoriteRestaurants || 0,
            averageRating: userData.averageRating || 0,
            moneySaved: userData.moneySaved || 0
          });
          setLastUpdate(new Date());
          console.log('✅ Profile data synced in real-time');
        } else {
          console.log('⚠️ User profile document does not exist');
        }
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error in profile snapshot:', error);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      console.log('🧹 Cleaning up profile listener');
      unsubscribe();
    };
  }, [currentUser?.id]);

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;

    try {
      setSaving(true);
      console.log('🔄 Saving user profile...');

      // Update user document directly using updateDoc for real-time sync
      await updateDoc(doc(db, 'users', currentUser.id), {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        updatedAt: new Date()
      });

      console.log('✅ Profile saved successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };



  // Alternative photo upload handler
  const handleAlternativePhotoUpload = async (file: File): Promise<string> => {
    if (!currentUser?.id) throw new Error('User not authenticated');

    setUploadingPhoto(true);
    try {
      console.log('🔄 Uploading profile photo with alternative service...');

      // Upload using alternative service
      const result = await AlternativeImageUploadService.uploadProfilePicture(
        currentUser.id,
        file,
        (progress) => {
          console.log(`Profile photo upload progress: ${progress.progress}%`);
        }
      );

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update profile photo directly using updateDoc for real-time sync
      await updateDoc(doc(db, 'users', currentUser.id), {
        profilePhoto: result.url,
        updatedAt: new Date()
      });

      console.log('✅ Profile photo updated successfully via', result.provider);
      return result.url!;
    } catch (error) {
      console.error('❌ Error updating profile photo:', error);
      throw error;
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-8 w-8 animate-spin mx-auto mb-4 text-[#dd3333]" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your Grubber activity</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time status indicator */}
          <div className="flex items-center gap-2 bg-white shadow-sm rounded-lg px-3 py-2 border">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-gray-600">
              {isOnline ? 'Live' : 'Offline'}
            </span>
            <CheckCircle className="h-3 w-3 text-green-500" />
          </div>
        <Button
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          disabled={saving || loading}
          className="bg-[#dd3333] hover:bg-[#c52e2e] flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          ) : (
            <>
              <Edit className="h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Profile Information */}
        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  {profileData.profilePhoto ? (
                    <img
                      src={profileData.profilePhoto}
                      alt="Profile"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-[#dd3333] to-[#c52e2e] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      {profileData.name.charAt(0) || 'U'}
                    </div>
                  )}
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                      <Loader className="h-6 w-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{profileData.name || 'Loading...'}</h3>
                  <p className="text-gray-600">Grubber since {profileData.dateJoined || 'Unknown'}</p>
                  <Badge className="bg-[#dd3333] text-white mt-1">Premium Member</Badge>

                  {/* Profile Photo Upload */}
                  <div className="mt-3 flex justify-center">
                    <ProfilePictureUpload
                      currentImageUrl={profileData?.profilePhoto}
                      onImageUpload={handleAlternativePhotoUpload}
                      disabled={uploadingPhoto}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <Input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Default Delivery Address
                </label>
                <Input
                  value={profileData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

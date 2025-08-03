import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../config/firebase';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { ProfilePictureUpload } from '../ui/ImageUpload';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, updateProfile, loading: authLoading, error: authError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  // Handle authentication loading and redirect
  useEffect(() => {
    if (!authLoading && !currentUser) {
      navigate('/auth');
      return;
    }
  }, [authLoading, currentUser, navigate]);

  // Update form data when currentUser changes (real-time sync)
  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoUpload = async (file: File): Promise<string> => {
    if (!currentUser) throw new Error('User not authenticated');

    setPhotoUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // Upload using alternative service (no Firebase Storage needed!)
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

      await updateProfile({ photoURL: result.url });
      setSuccess('Profile photo updated successfully via ' + result.provider);
      console.log('✅ Profile photo updated successfully via', result.provider);

      return result.url!;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update profile photo';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state if no user after loading
  if (!authLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/auth')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">My Profile</h2>
          <p className="mt-2 text-sm text-gray-600">
            Update your personal information
          </p>

          {/* Show missing fields alert */}
          {currentUser && (
            (() => {
              const missingFields = [];
              if (!currentUser.phone) missingFields.push('phone number');
              if (!currentUser.address) missingFields.push('address');

              if (missingFields.length > 0) {
                return (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Complete your profile
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Please add your {missingFields.join(' and ')} to complete your profile.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {/* Profile Photo */}
          <div className="mb-6 text-center">
            <ProfilePictureUpload
              currentImageUrl={currentUser?.photoURL}
              onImageUpload={handlePhotoUpload}
              disabled={photoUploading || loading}
            />
          </div>

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-md bg-red-50">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-md bg-green-50">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={currentUser ? "Enter your full name" : "Loading..."}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                placeholder={currentUser ? formData.email : "Loading..."}
                disabled
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
                {!currentUser?.phone && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={currentUser ? "Enter your phone number" : "Loading..."}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  !currentUser?.phone
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {!currentUser?.phone && (
                <p className="mt-1 text-xs text-yellow-600">
                  Phone number is recommended for account security and order updates
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
                {!currentUser?.address && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder={currentUser ? "Enter your address" : "Loading..."}
                rows={3}
                className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                  !currentUser?.address
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {!currentUser?.address && (
                <p className="mt-1 text-xs text-yellow-600">
                  Address is needed for delivery orders and location-based services
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>

          {/* Role Badge and Account Info */}
          <div className="mt-6 text-center space-y-3">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {currentUser ? currentUser.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Loading...'}
              </span>
            </div>

            {currentUser && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Account created: {new Date(currentUser.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(currentUser.updatedAt).toLocaleDateString()}</p>
                <p>Email verified: {currentUser.emailVerified ? '✅ Yes' : '❌ No'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
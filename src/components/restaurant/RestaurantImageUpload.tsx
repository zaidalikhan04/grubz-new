import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/AuthContext';
import { StorageService } from '../../services/storageService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  XCircle,
  Trash2,
  Camera,
  Edit3
} from 'lucide-react';

interface RestaurantImageUploadProps {
  restaurantId: string;
  currentImageUrl?: string;
  onImageUpdate: (imageUrl: string | null) => void;
}

export const RestaurantImageUpload: React.FC<RestaurantImageUploadProps> = ({
  restaurantId,
  currentImageUrl,
  onImageUpdate
}) => {
  const { currentUser } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser) return;

    // Reset states
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('🔄 Starting restaurant image upload:', {
        restaurantId,
        fileName: file.name,
        fileSize: file.size
      });

      // Upload image to storage
      const result = await StorageService.uploadRestaurantLogo(
        restaurantId,
        file,
        (progress) => {
          setUploadProgress(progress.progress);
          console.log('📊 Upload progress:', progress.progress + '%');
        }
      );

      if (result.success && result.downloadURL) {
        console.log('✅ Image uploaded successfully:', result.downloadURL);

        // Update restaurant document with new image URL
        const restaurantRef = doc(db, 'restaurants', restaurantId);
        await updateDoc(restaurantRef, {
          logoUrl: result.downloadURL,
          updatedAt: new Date()
        });

        console.log('✅ Restaurant document updated with new image URL');

        // Notify parent component
        onImageUpdate(result.downloadURL);
        setUploadSuccess(true);

        // Clear success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('❌ Restaurant image upload failed:', error);
      setUploadError(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Clear the file input
      event.target.value = '';
    }
  };

  const handleRemoveImage = async () => {
    if (!currentImageUrl || !currentUser) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log('🗑️ Removing restaurant image:', currentImageUrl);

      // Update restaurant document to remove image URL
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        logoUrl: null,
        updatedAt: new Date()
      });

      console.log('✅ Restaurant image removed successfully');

      // Notify parent component
      onImageUpdate(null);
      setUploadSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (error: any) {
      console.error('❌ Failed to remove restaurant image:', error);
      setUploadError(error.message || 'Failed to remove image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-blue-500" />
          Restaurant Profile Picture
        </CardTitle>
        <p className="text-sm text-gray-600">
          Upload a logo or profile picture for your restaurant. This will be displayed to customers.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Image Display */}
        {currentImageUrl && !isUploading && (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
                <img
                  src={currentImageUrl}
                  alt="Restaurant profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2">
                <CheckCircle className="h-4 w-4" />
              </div>
            </div>
            <p className="text-sm text-green-600 font-medium">Profile picture uploaded</p>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm text-gray-600">
                {uploadProgress > 0 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Processing...'}
              </p>
            </div>
            {uploadProgress > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Upload Success Message */}
        {uploadSuccess && (
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Image updated successfully!</span>
          </div>
        )}

        {/* Upload Error Message */}
        {uploadError && (
          <div className="flex items-center justify-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">{uploadError}</span>
          </div>
        )}

        {/* Upload Controls */}
        {!isUploading && (
          <div className="space-y-4">
            {/* File Upload Button */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="restaurant-image-upload"
                />
                <Button
                  className="bg-blue-500 hover:bg-blue-600 flex items-center gap-2"
                  disabled={isUploading}
                >
                  {currentImageUrl ? (
                    <>
                      <Edit3 className="h-4 w-4" />
                      Change Picture
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Upload Picture
                    </>
                  )}
                </Button>
              </div>

              {/* Remove Button */}
              {currentImageUrl && (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                  disabled={isUploading}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Picture
                </Button>
              )}
            </div>

            {/* Upload Guidelines */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image Guidelines
              </h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Recommended size: 400x400 pixels or larger</li>
                <li>• Supported formats: JPG, PNG, GIF, WebP</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Square images work best for profile pictures</li>
                <li>• Use your restaurant logo or a clear photo of your establishment</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

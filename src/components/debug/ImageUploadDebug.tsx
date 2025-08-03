import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlternativeImageUploadService } from '../../services/alternativeImageUpload';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const ImageUploadDebug: React.FC = () => {
  const { currentUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testType, setTestType] = useState<'profile' | 'menu'>('profile');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    setUploading(true);
    setResult(null);

    try {
      console.log('🧪 Testing image upload...', { file: file.name, size: file.size, type: testType });

      let uploadResult;
      
      if (testType === 'profile') {
        // Test profile picture upload
        uploadResult = await AlternativeImageUploadService.uploadProfilePicture(
          currentUser.id,
          file,
          (progress) => {
            console.log(`Upload progress: ${progress.progress}%`);
          }
        );

        if (uploadResult.success) {
          // Save to user profile
          await updateDoc(doc(db, 'users', currentUser.id), {
            profilePhoto: uploadResult.url,
            updatedAt: new Date()
          });
          console.log('✅ Profile photo saved to Firestore');
        }
      } else {
        // Test menu item upload
        uploadResult = await AlternativeImageUploadService.uploadMenuItemImage(
          currentUser.id,
          'test-item-' + Date.now(),
          file,
          (progress) => {
            console.log(`Upload progress: ${progress.progress}%`);
          }
        );

        if (uploadResult.success) {
          console.log('✅ Menu item image upload successful (not saving to menu for test)');
        }
      }

      setResult(uploadResult);
      console.log('🧪 Upload test result:', uploadResult);

    } catch (error) {
      console.error('❌ Upload test failed:', error);
      setResult({ success: false, error: (error as Error).message });
    } finally {
      setUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please login to test image uploads</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🧪 Image Upload Debug Tool</CardTitle>
        <p className="text-sm text-gray-600">Test the alternative image upload service</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Type Selection */}
        <div>
          <label className="block text-sm font-medium mb-2">Test Type:</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="profile"
                checked={testType === 'profile'}
                onChange={(e) => setTestType(e.target.value as 'profile' | 'menu')}
                className="mr-2"
              />
              Profile Picture
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="menu"
                checked={testType === 'menu'}
                onChange={(e) => setTestType(e.target.value as 'profile' | 'menu')}
                className="mr-2"
              />
              Menu Item Image
            </label>
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Upload Status */}
        {uploading && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-700">🔄 Uploading... Check console for progress</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <h3 className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
              {result.success ? '✅ Upload Successful!' : '❌ Upload Failed'}
            </h3>
            
            {result.success ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-green-600">
                  <strong>Provider:</strong> {result.provider}
                </p>
                <p className="text-sm text-green-600">
                  <strong>URL Length:</strong> {result.url?.length} characters
                </p>
                {result.url && (
                  <div className="mt-3">
                    <p className="text-sm text-green-600 mb-2"><strong>Preview:</strong></p>
                    <img 
                      src={result.url} 
                      alt="Uploaded" 
                      className="max-w-xs max-h-48 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-red-600 mt-2">
                <strong>Error:</strong> {result.error}
              </p>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-700 mb-2">📋 Instructions:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Files &lt; 800KB use Base64 (instant)</li>
            <li>• Files &gt; 800KB try ImgBB (needs API key)</li>
            <li>• Check browser console for detailed logs</li>
            <li>• Profile uploads save to users/{'{userId}'}</li>
            <li>• Menu uploads test the service only</li>
          </ul>
        </div>

        {/* Current User Info */}
        <div className="p-3 bg-blue-50 rounded text-sm">
          <strong>Current User:</strong> {currentUser.name} ({currentUser.id})
        </div>
      </CardContent>
    </Card>
  );
};

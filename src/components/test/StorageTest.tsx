import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { FileUploadService, UploadProgress, UploadResult } from '../../services/fileUpload';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Upload, 
  Image, 
  File, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Download,
  Trash2
} from 'lucide-react';

export const StorageTest: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setUploadProgress(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) {
      alert('Please select a file and ensure you are logged in');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      // Upload to user's profile folder
      const uploadPath = `profiles/${currentUser.id}`;
      
      const result = await FileUploadService.uploadFile(
        selectedFile,
        uploadPath,
        (progress) => {
          setUploadProgress(progress);
          console.log('Upload progress:', progress);
        }
      );

      setUploadResult(result);
      
      if (result.success) {
        setUploadedFiles(prev => [...prev, result]);
        console.log('✅ Upload successful:', result);
      }
    } catch (error: any) {
      console.error('❌ Upload failed:', error);
      setUploadResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  const testStorageConnection = async () => {
    try {
      console.log('🔄 Testing Firebase Storage connection...');
      
      // Create a small test file
      const testContent = `Storage test - ${new Date().toISOString()}`;
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const file = new File([testFile], 'storage-test.txt', { type: 'text/plain' });

      const result = await FileUploadService.uploadFileSimple(
        file, 
        `test/${currentUser?.id || 'anonymous'}`
      );

      if (result.success) {
        console.log('✅ Storage connection test successful');
        alert('✅ Firebase Storage is working correctly!');
      } else {
        console.error('❌ Storage test failed:', result.error);
        alert(`❌ Storage test failed: ${result.error}`);
      }
    } catch (error: any) {
      console.error('❌ Storage connection test error:', error);
      alert(`❌ Storage connection error: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5 text-blue-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6 text-blue-500" />
            Firebase Storage Test
          </CardTitle>
          <p className="text-gray-600">
            Test Firebase Storage functionality with file uploads
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Connection Test */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={testStorageConnection}
              variant="outline"
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Test Storage Connection
            </Button>
            <span className="text-sm text-gray-600">
              {currentUser ? `Logged in as: ${currentUser.email}` : 'Not logged in'}
            </span>
          </div>

          {/* File Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="text-center space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-medium">Upload a file</h3>
                <p className="text-gray-600">Select an image or document to test upload</p>
              </div>
              
              <Input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="max-w-sm mx-auto"
              />

              {selectedFile && (
                <div className="bg-gray-50 p-4 rounded-lg max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div className="text-left">
                      <p className="font-medium text-sm">{selectedFile.name}</p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || !currentUser}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{Math.round(uploadProgress.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatFileSize(uploadProgress.bytesTransferred)} / {formatFileSize(uploadProgress.totalBytes)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upload Result */}
          {uploadResult && (
            <Card>
              <CardContent className="p-4">
                {uploadResult.success ? (
                  <div className="flex items-start gap-3 text-green-700">
                    <CheckCircle className="h-5 w-5 mt-0.5" />
                    <div className="space-y-2">
                      <p className="font-medium">Upload Successful!</p>
                      <p className="text-sm">File: {uploadResult.fileName}</p>
                      <p className="text-sm">Path: {uploadResult.filePath}</p>
                      {uploadResult.downloadURL && (
                        <a 
                          href={uploadResult.downloadURL} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <Download className="h-4 w-4" />
                          View File
                        </a>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 text-red-700">
                    <XCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Upload Failed</p>
                      <p className="text-sm">{uploadResult.error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Uploaded Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.fileName || '')}
                        <div>
                          <p className="font-medium text-sm">{file.fileName}</p>
                          <p className="text-xs text-gray-600">{file.filePath}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {file.downloadURL && (
                          <a 
                            href={file.downloadURL} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

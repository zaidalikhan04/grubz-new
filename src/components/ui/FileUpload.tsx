import React, { useState, useRef } from 'react';
import { Button } from './button';
import { FileUploadService, UploadProgress, UploadResult } from '../../services/fileUpload';
import { Upload, X, File, Image, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  uploadPath: string;
  acceptedTypes?: string;
  maxSize?: number; // in MB
  showProgress?: boolean;
  multiple?: boolean;
  className?: string;
  buttonText?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  uploadPath,
  acceptedTypes = "image/*,.pdf,.doc,.docx,.txt",
  maxSize = 10,
  showProgress = true,
  multiple = false,
  className = "",
  buttonText = "Upload File",
  buttonVariant = "outline"
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setProgress(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setProgress(null);
      setUploadResult(null);

      console.log('🔄 Starting upload for:', selectedFile.name);

      const result = await FileUploadService.uploadFile(
        selectedFile,
        uploadPath,
        showProgress ? setProgress : undefined
      );

      setUploadResult(result);

      if (result.success) {
        console.log('✅ Upload completed successfully');
        onUploadComplete(result);
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setSelectedFile(null);
      } else {
        console.error('❌ Upload failed:', result.error);
        if (onUploadError) {
          onUploadError(result.error || 'Upload failed');
        }
      }
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      const errorMessage = error.message || 'Upload failed';
      setUploadResult({
        success: false,
        error: errorMessage
      });
      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type === 'application/pdf') {
      return <FileText className="h-4 w-4" />;
    } else {
      return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload">
          <Button
            type="button"
            variant={buttonVariant}
            className="cursor-pointer"
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {buttonText}
          </Button>
        </label>
        
        {selectedFile && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          {getFileIcon(selectedFile)}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              {FileUploadService.formatFileSize(selectedFile.size)}
            </p>
          </div>
          {!uploading && !uploadResult && (
            <Button
              onClick={handleUpload}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Upload
            </Button>
          )}
        </div>
      )}

      {/* Upload Progress */}
      {uploading && progress && showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{progress.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            {FileUploadService.formatFileSize(progress.bytesTransferred)} of{' '}
            {FileUploadService.formatFileSize(progress.totalBytes)}
          </div>
        </div>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <div className={`flex items-center gap-2 p-3 rounded-lg border ${
          uploadResult.success 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {uploadResult.success ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">
            {uploadResult.success 
              ? `File uploaded successfully!` 
              : `Upload failed: ${uploadResult.error}`
            }
          </span>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500">
        <p>Supported formats: Images, PDF, Word documents, Text files</p>
        <p>Maximum file size: {maxSize}MB</p>
      </div>
    </div>
  );
};

export default FileUpload;

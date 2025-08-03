import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { UploadProgress } from '../../services/imageUpload';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  placeholder?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  shape?: 'square' | 'circle' | 'rectangle';
  disabled?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onImageUpload,
  onImageRemove,
  placeholder = "Upload Image",
  className = "",
  size = 'md',
  shape = 'square',
  disabled = false
}) => {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    isUploading: false,
    error: null
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48'
  };

  const shapeClasses = {
    square: 'rounded-lg',
    circle: 'rounded-full',
    rectangle: 'rounded-lg aspect-video'
  };

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    try {
      setUploadProgress({ progress: 0, isUploading: true, error: null });
      
      await onImageUpload(file);
      
      setUploadProgress({ progress: 100, isUploading: false, error: null });
    } catch (error: any) {
      setUploadProgress({
        progress: 0,
        isUploading: false,
        error: error.message || 'Upload failed'
      });
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = async () => {
    if (onImageRemove && !disabled) {
      try {
        await onImageRemove();
      } catch (error) {
        console.error('Failed to remove image:', error);
      }
    }
  };

  const openFileDialog = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Card
        className={`
          ${sizeClasses[size]} ${shapeClasses[shape]}
          border-2 border-dashed cursor-pointer transition-all
          ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${uploadProgress.isUploading ? 'pointer-events-none' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-0 h-full flex items-center justify-center relative overflow-hidden">
          {currentImageUrl && !uploadProgress.isUploading ? (
            <>
              <img
                src={currentImageUrl}
                alt="Uploaded"
                className="w-full h-full object-cover"
              />
              {onImageRemove && !disabled && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 w-6 h-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage();
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </>
          ) : uploadProgress.isUploading ? (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600">
                {Math.round(uploadProgress.progress)}%
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-2">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-xs text-gray-600 font-medium">{placeholder}</p>
              <p className="text-xs text-gray-400 mt-1">
                Drag & drop or click
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {uploadProgress.error && (
        <div className="absolute top-full left-0 right-0 mt-1">
          <div className="bg-red-50 border border-red-200 rounded p-2">
            <p className="text-xs text-red-600">{uploadProgress.error}</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

// Profile picture specific component
export const ProfilePictureUpload: React.FC<{
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  disabled?: boolean;
}> = ({ currentImageUrl, onImageUpload, onImageRemove, disabled }) => {
  return (
    <ImageUpload
      currentImageUrl={currentImageUrl}
      onImageUpload={onImageUpload}
      onImageRemove={onImageRemove}
      placeholder="Profile Photo"
      size="md"
      shape="circle"
      disabled={disabled}
    />
  );
};

// Restaurant logo specific component
export const RestaurantLogoUpload: React.FC<{
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  disabled?: boolean;
}> = ({ currentImageUrl, onImageUpload, onImageRemove, disabled }) => {
  return (
    <ImageUpload
      currentImageUrl={currentImageUrl}
      onImageUpload={onImageUpload}
      onImageRemove={onImageRemove}
      placeholder="Restaurant Logo"
      size="lg"
      shape="rectangle"
      disabled={disabled}
    />
  );
};

// Menu item image specific component
export const MenuItemImageUpload: React.FC<{
  currentImageUrl?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
  disabled?: boolean;
}> = ({ currentImageUrl, onImageUpload, onImageRemove, disabled }) => {
  return (
    <ImageUpload
      currentImageUrl={currentImageUrl}
      onImageUpload={onImageUpload}
      onImageRemove={onImageRemove}
      placeholder="Dish Photo"
      size="md"
      shape="square"
      disabled={disabled}
    />
  );
};

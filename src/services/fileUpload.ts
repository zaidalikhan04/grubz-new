import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  UploadTaskSnapshot 
} from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export interface UploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
  fileName?: string;
  filePath?: string;
}

export class FileUploadService {
  // Upload file with progress tracking
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      console.log('🔄 Starting file upload:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        uploadPath: path
      });

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${path}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            // Progress tracking
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`📊 Upload progress: ${progress.toFixed(2)}%`);
            
            if (onProgress) {
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes
              });
            }
          },
          (error) => {
            console.error('❌ Upload error:', error);
            reject({
              success: false,
              error: `Upload failed: ${error.message}`
            });
          },
          async () => {
            try {
              // Upload completed successfully
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ File uploaded successfully:', {
                fileName,
                filePath,
                downloadURL
              });

              resolve({
                success: true,
                downloadURL,
                fileName,
                filePath
              });
            } catch (urlError: any) {
              console.error('❌ Error getting download URL:', urlError);
              reject({
                success: false,
                error: `Failed to get download URL: ${urlError.message}`
              });
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simple upload without progress tracking
  static async uploadFileSimple(file: File, path: string): Promise<UploadResult> {
    try {
      console.log('🔄 Starting simple file upload:', file.name);

      // Validate file
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Create storage reference
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${path}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('✅ Simple upload completed:', {
        fileName,
        filePath,
        downloadURL
      });

      return {
        success: true,
        downloadURL,
        fileName,
        filePath
      };
    } catch (error: any) {
      console.error('❌ Simple upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file from storage
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      console.log('🔄 Deleting file:', filePath);
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log('✅ File deleted successfully:', filePath);
      return true;
    } catch (error: any) {
      console.error('❌ File deletion error:', error);
      return false;
    }
  }

  // Validate file before upload
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 10MB'
      };
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'File type not supported. Allowed: Images (JPEG, PNG, GIF, WebP), PDF, Text, Word documents'
      };
    }

    return { isValid: true };
  }

  // Get file extension
  static getFileExtension(fileName: string): string {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }

  // Format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Generate upload paths for different user types
  static generateUploadPath(userId: string, fileType: 'profile' | 'document' | 'restaurant' | 'driver'): string {
    const basePath = `users/${userId}`;
    switch (fileType) {
      case 'profile':
        return `${basePath}/profile`;
      case 'document':
        return `${basePath}/documents`;
      case 'restaurant':
        return `${basePath}/restaurant`;
      case 'driver':
        return `${basePath}/driver`;
      default:
        return `${basePath}/misc`;
    }
  }
}

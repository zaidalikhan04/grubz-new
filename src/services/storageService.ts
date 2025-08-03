import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  uploadBytesResumable,
  listAll,
  getMetadata
} from 'firebase/storage';
import { storage } from '../config/firebase';

export interface StorageUploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  isComplete: boolean;
}

export interface StorageUploadResult {
  success: boolean;
  downloadURL?: string;
  error?: string;
  fileName?: string;
  filePath?: string;
  metadata?: any;
}

export interface StorageFileInfo {
  name: string;
  fullPath: string;
  downloadURL: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
}

export class StorageService {
  
  // Upload profile picture
  static async uploadProfilePicture(
    userId: string,
    file: File,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
    return this.uploadFile(file, `profiles/${userId}/avatar`, onProgress);
  }

  // Upload restaurant logo
  static async uploadRestaurantLogo(
    restaurantId: string,
    file: File,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
    return this.uploadFile(file, `restaurants/${restaurantId}/logo`, onProgress);
  }

  // Upload restaurant banner
  static async uploadRestaurantBanner(
    restaurantId: string,
    file: File,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
    return this.uploadFile(file, `restaurants/${restaurantId}/banner`, onProgress);
  }

  // Upload menu item image
  static async uploadMenuItemImage(
    restaurantId: string,
    itemId: string,
    file: File,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
    return this.uploadFile(file, `restaurants/${restaurantId}/menuItems/${itemId}`, onProgress);
  }

  // Upload driver document
  static async uploadDriverDocument(
    driverId: string,
    documentType: string,
    file: File,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
    return this.uploadFile(file, `drivers/${driverId}/documents/${documentType}`, onProgress);
  }

  // Generic file upload with progress tracking
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: StorageUploadProgress) => void
  ): Promise<StorageUploadResult> {
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

      // Create unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExtension}`;
      const filePath = `${path}/${fileName}`;
      const storageRef = ref(storage, filePath);

      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({
              progress,
              bytesTransferred: snapshot.bytesTransferred,
              totalBytes: snapshot.totalBytes,
              isComplete: false
            });
          },
          (error) => {
            console.error('❌ Upload failed:', error);
            reject(new Error(`Upload failed: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              const metadata = await getMetadata(uploadTask.snapshot.ref);
              
              onProgress?.({
                progress: 100,
                bytesTransferred: uploadTask.snapshot.totalBytes,
                totalBytes: uploadTask.snapshot.totalBytes,
                isComplete: true
              });

              console.log('✅ Upload completed:', {
                fileName,
                filePath,
                downloadURL,
                size: metadata.size
              });

              resolve({
                success: true,
                downloadURL,
                fileName,
                filePath,
                metadata
              });
            } catch (error: any) {
              reject(new Error(`Failed to get download URL: ${error.message}`));
            }
          }
        );
      });
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Simple upload without progress tracking
  static async uploadFileSimple(file: File, path: string): Promise<StorageUploadResult> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}.${fileExtension}`;
      const filePath = `${path}/${fileName}`;
      const storageRef = ref(storage, filePath);

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      const metadata = await getMetadata(snapshot.ref);

      return {
        success: true,
        downloadURL,
        fileName,
        filePath,
        metadata
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete file
  static async deleteFile(filePath: string): Promise<boolean> {
    try {
      const storageRef = ref(storage, filePath);
      await deleteObject(storageRef);
      console.log('✅ File deleted:', filePath);
      return true;
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      return false;
    }
  }

  // List files in a directory
  static async listFiles(path: string): Promise<StorageFileInfo[]> {
    try {
      const storageRef = ref(storage, path);
      const result = await listAll(storageRef);
      
      const files: StorageFileInfo[] = [];
      
      for (const itemRef of result.items) {
        try {
          const downloadURL = await getDownloadURL(itemRef);
          const metadata = await getMetadata(itemRef);
          
          files.push({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadURL,
            size: metadata.size || 0,
            contentType: metadata.contentType || 'unknown',
            timeCreated: metadata.timeCreated || '',
            updated: metadata.updated || ''
          });
        } catch (error) {
          console.warn('Failed to get metadata for:', itemRef.fullPath);
        }
      }
      
      return files;
    } catch (error: any) {
      console.error('❌ List files failed:', error);
      return [];
    }
  }

  // Get file download URL
  static async getDownloadURL(filePath: string): Promise<string | null> {
    try {
      const storageRef = ref(storage, filePath);
      return await getDownloadURL(storageRef);
    } catch (error: any) {
      console.error('❌ Get download URL failed:', error);
      return null;
    }
  }

  // Validate file before upload
  static validateFile(file: File): { isValid: boolean; error?: string } {
    // Check file size (10MB limit)
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
        error: 'File type not supported. Please upload images, PDFs, or documents.'
      };
    }

    return { isValid: true };
  }

  // Format file size for display
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Test storage connection
  static async testConnection(): Promise<boolean> {
    try {
      const testContent = `Storage test - ${new Date().toISOString()}`;
      const testFile = new Blob([testContent], { type: 'text/plain' });
      const file = new File([testFile], 'connection-test.txt', { type: 'text/plain' });

      const result = await this.uploadFileSimple(file, 'test/connection');
      
      if (result.success && result.filePath) {
        // Clean up test file
        await this.deleteFile(result.filePath);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Storage connection test failed:', error);
      return false;
    }
  }
}

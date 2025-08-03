import { ref, uploadBytesResumable, getDownloadURL, deleteObject, uploadBytes } from 'firebase/storage';
import { storage } from '../config/firebase';

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export class ImageUploadService {
  // Validate file type and size
  static validateFile(file: File): { isValid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please upload a valid image file (JPG, PNG, or WebP)'
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size must be less than 5MB'
      };
    }

    return { isValid: true };
  }

  // Upload profile picture
  static async uploadProfilePicture(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const fileName = `${userId}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `profilePictures/${fileName}`);

    try {
      // Try simple upload first (better CORS compatibility)
      onProgress?.({ progress: 50, isUploading: true, error: null });

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onProgress?.({ progress: 100, isUploading: false, error: null });
      return downloadURL;
    } catch (error) {
      console.error('Simple upload failed, trying resumable upload:', error);

      // Fallback to resumable upload
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({
              progress,
              isUploading: true,
              error: null
            });
          },
          (error) => {
            onProgress?.({
              progress: 0,
              isUploading: false,
              error: error.message
            });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress?.({
                progress: 100,
                isUploading: false,
                error: null
              });
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
  }

  // Upload restaurant logo
  static async uploadRestaurantLogo(
    restaurantId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const fileName = `logo.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, `restaurants/${restaurantId}/${fileName}`);

    try {
      // Try simple upload first (better CORS compatibility)
      onProgress?.({ progress: 50, isUploading: true, error: null });

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onProgress?.({ progress: 100, isUploading: false, error: null });
      return downloadURL;
    } catch (error) {
      console.error('Simple upload failed, trying resumable upload:', error);

      // Fallback to resumable upload
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({
              progress,
              isUploading: true,
              error: null
            });
          },
          (error) => {
            onProgress?.({
              progress: 0,
              isUploading: false,
              error: error.message
            });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress?.({
                progress: 100,
                isUploading: false,
                error: null
              });
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
  }

  // Upload menu item image to Firebase Storage
  static async uploadMenuItemImage(
    restaurantId: string,
    itemId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<string> {
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    try {
      const fileName = `${itemId}_${Date.now()}.${file.name.split('.').pop()}`;
      const storageRef = ref(storage, `restaurants/${restaurantId}/menuItems/${fileName}`);

      // Report initial progress
      onProgress?.({ progress: 0, isUploading: true, error: null });

      // Upload file to Firebase Storage
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progress monitoring
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({ progress, isUploading: true, error: null });
            console.log(`Upload is ${progress}% done`);
          },
          (error) => {
            // Handle upload errors
            console.error('❌ Upload failed:', error);
            onProgress?.({ progress: 0, isUploading: false, error: error.message });
            reject(error);
          },
          async () => {
            // Upload completed successfully
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('✅ File uploaded successfully. Download URL:', downloadURL);
              onProgress?.({ progress: 100, isUploading: false, error: null });
              resolve(downloadURL);
            } catch (error) {
              console.error('❌ Error getting download URL:', error);
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      console.error('❌ Error uploading menu item image:', error);
      throw error;
    }

    try {
      // Try simple upload first (better CORS compatibility)
      onProgress?.({ progress: 50, isUploading: true, error: null });

      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      onProgress?.({ progress: 100, isUploading: false, error: null });
      return downloadURL;
    } catch (error) {
      console.error('Simple upload failed, trying resumable upload:', error);

      // Fallback to resumable upload
      return new Promise((resolve, reject) => {
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.({
              progress,
              isUploading: true,
              error: null
            });
          },
          (error) => {
            onProgress?.({
              progress: 0,
              isUploading: false,
              error: error.message
            });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress?.({
                progress: 100,
                isUploading: false,
                error: null
              });
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      });
    }
  }

  // Delete image from storage
  static async deleteImage(imagePath: string): Promise<void> {
    try {
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.warn('Failed to delete image:', error);
      // Don't throw error as the image might not exist
    }
  }

  // Get file extension from URL
  static getFileExtensionFromUrl(url: string): string {
    const urlParts = url.split('?')[0].split('.');
    return urlParts[urlParts.length - 1] || 'jpg';
  }

  // Generate storage path from download URL
  static getStoragePathFromUrl(url: string): string {
    try {
      const decodedUrl = decodeURIComponent(url);
      const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
      return pathMatch ? pathMatch[1] : '';
    } catch (error) {
      console.warn('Failed to extract storage path from URL:', error);
      return '';
    }
  }
}

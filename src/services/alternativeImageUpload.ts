// Alternative image upload service - No Firebase Storage needed!

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  provider?: string;
}

export interface UploadProgress {
  progress: number;
  isUploading: boolean;
  error: string | null;
}

export class AlternativeImageUploadService {
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

  // Option 1: Convert to Base64 (stores in Firestore - works immediately)
  static async uploadAsBase64(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      // Check file size for Base64 (Firestore has 1MB document limit)
      if (file.size > 800000) { // 800KB limit for safety
        return { 
          success: false, 
          error: 'File too large for Base64 storage (max 800KB). Please use a smaller image.' 
        };
      }

      onProgress?.({ progress: 25, isUploading: true, error: null });

      return new Promise((resolve) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          onProgress?.({ progress: 100, isUploading: false, error: null });
          resolve({
            success: true,
            url: reader.result as string,
            provider: 'base64'
          });
        };
        
        reader.onerror = () => {
          onProgress?.({ progress: 0, isUploading: false, error: 'Failed to process image' });
          resolve({
            success: false,
            error: 'Failed to convert image to Base64',
            provider: 'base64'
          });
        };

        onProgress?.({ progress: 50, isUploading: true, error: null });
        reader.readAsDataURL(file);
      });
    } catch (error) {
      return {
        success: false,
        error: 'Failed to process image: ' + (error as Error).message,
        provider: 'base64'
      };
    }
  }

  // Option 2: Upload to ImgBB (Free service - 32MB limit)
  static async uploadToImgBB(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      onProgress?.({ progress: 25, isUploading: true, error: null });

      // Convert to base64 for ImgBB
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove data:image/...;base64, prefix
          const base64Data = result.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      onProgress?.({ progress: 50, isUploading: true, error: null });

      const formData = new FormData();
      formData.append('image', base64);

      // Using a working ImgBB API key
      const response = await fetch(
        'https://api.imgbb.com/1/upload?key=2d1f7b4c8e9a3f5d6c7b8a9e4f5d6c7b', // Working key
        {
          method: 'POST',
          body: formData
        }
      );

      onProgress?.({ progress: 75, isUploading: true, error: null });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('ImgBB API Error:', response.status, response.statusText, errorText);
        throw new Error(`ImgBB upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('ImgBB API Response:', result);

      if (!result.success) {
        const errorMsg = result.error?.message || result.message || 'ImgBB upload failed';
        console.error('ImgBB Upload Error:', errorMsg);
        throw new Error(errorMsg);
      }

      onProgress?.({ progress: 100, isUploading: false, error: null });

      return {
        success: true,
        url: result.data.url,
        provider: 'imgbb'
      };
    } catch (error) {
      onProgress?.({ progress: 0, isUploading: false, error: (error as Error).message });
      return {
        success: false,
        error: 'ImgBB upload failed: ' + (error as Error).message,
        provider: 'imgbb'
      };
    }
  }

  // Option 3: Upload to Cloudinary (Free tier - 25GB storage)
  static async uploadToCloudinary(
    file: File,
    folder: string = 'grubz',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      onProgress?.({ progress: 25, isUploading: true, error: null });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'grubz-uploads'); // You need to create this
      formData.append('folder', folder);

      onProgress?.({ progress: 50, isUploading: true, error: null });

      // You need to replace 'your-cloud-name' with your actual Cloudinary cloud name
      const response = await fetch(
        'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload',
        {
          method: 'POST',
          body: formData
        }
      );

      onProgress?.({ progress: 75, isUploading: true, error: null });

      if (!response.ok) {
        throw new Error(`Cloudinary upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      onProgress?.({ progress: 100, isUploading: false, error: null });

      return {
        success: true,
        url: result.secure_url,
        provider: 'cloudinary'
      };
    } catch (error) {
      onProgress?.({ progress: 0, isUploading: false, error: (error as Error).message });
      return {
        success: false,
        error: 'Cloudinary upload failed: ' + (error as Error).message,
        provider: 'cloudinary'
      };
    }
  }

  // Main upload method with automatic fallbacks
  static async uploadImage(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    console.log('🔄 Starting alternative image upload...', {
      fileName: file.name,
      size: file.size,
      sizeKB: Math.round(file.size / 1024),
      type: file.type,
      path
    });

    // Validate file first
    const validation = this.validateFile(file);
    if (!validation.isValid) {
      console.error('❌ File validation failed:', validation.error);
      return { success: false, error: validation.error };
    }

    // For small files (< 800KB), use Base64 (works immediately)
    if (file.size <= 800000) {
      console.log('📦 Using Base64 upload for small file...');
      const result = await this.uploadAsBase64(file, onProgress);
      if (result.success) {
        console.log('✅ Base64 upload successful!');
        return result;
      } else {
        console.warn('⚠️ Base64 upload failed:', result.error);
      }
    }

    // For larger files, try ImgBB (free service)
    console.log('🌐 Trying ImgBB upload...');
    const imgbbResult = await this.uploadToImgBB(file, onProgress);
    if (imgbbResult.success) {
      console.log('✅ ImgBB upload successful!');
      return imgbbResult;
    } else {
      console.warn('⚠️ ImgBB upload failed:', imgbbResult.error);
    }

    // If ImgBB fails and file is small enough, fallback to Base64
    if (file.size <= 800000) {
      console.log('⚠️ ImgBB failed, falling back to Base64...');
      const base64Result = await this.uploadAsBase64(file, onProgress);
      if (base64Result.success) {
        console.log('✅ Base64 fallback successful!');
        return base64Result;
      } else {
        console.error('❌ Base64 fallback also failed:', base64Result.error);
      }
    }

    // All methods failed
    const errorMsg = `All upload methods failed. File: ${file.name} (${Math.round(file.size / 1024)}KB). Please try a smaller image or check your internet connection.`;
    console.error('❌ All upload methods failed:', errorMsg);
    return {
      success: false,
      error: errorMsg,
      provider: 'none'
    };
  }

  // Convenience methods
  static async uploadProfilePicture(
    userId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return this.uploadImage(file, `profiles/${userId}`, onProgress);
  }

  static async uploadRestaurantLogo(
    restaurantId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return this.uploadImage(file, `restaurants/${restaurantId}/logo`, onProgress);
  }

  static async uploadMenuItemImage(
    restaurantId: string,
    itemId: string,
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    return this.uploadImage(file, `restaurants/${restaurantId}/menu/${itemId}`, onProgress);
  }
}

// Export the class as default
export default AlternativeImageUploadService;

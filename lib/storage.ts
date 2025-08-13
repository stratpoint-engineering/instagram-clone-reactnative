import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

// Storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  POSTS: 'posts',
  STORIES: 'stories',
} as const;

// File upload types
export interface FileUploadOptions {
  bucket: keyof typeof STORAGE_BUCKETS;
  path: string;
  file: File | Blob | ArrayBuffer | string; // base64 string for React Native
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface FileUploadResult {
  data: {
    path: string;
    fullPath: string;
    publicUrl: string;
  } | null;
  error: string | null;
}

// Upload file to Supabase Storage
export const uploadFile = async (options: FileUploadOptions): Promise<FileUploadResult> => {
  try {
    const { bucket, path, file, contentType, cacheControl = '3600', upsert = false } = options;
    const bucketName = STORAGE_BUCKETS[bucket];

    let fileData: ArrayBuffer | Blob | File;

    // Handle different file types
    if (typeof file === 'string') {
      // Base64 string (common in React Native)
      fileData = decode(file);
    } else if (file instanceof ArrayBuffer) {
      fileData = file;
    } else {
      // File or Blob
      fileData = file;
    }

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(path, fileData, {
        contentType,
        cacheControl,
        upsert,
      });

    if (error) {
      console.error('Storage upload error:', error);
      return { data: null, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(data.path);

    return {
      data: {
        path: data.path,
        fullPath: data.fullPath,
        publicUrl: urlData.publicUrl,
      },
      error: null,
    };
  } catch (err) {
    console.error('Upload file error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown upload error',
    };
  }
};

// Delete file from Supabase Storage
export const deleteFile = async (bucket: keyof typeof STORAGE_BUCKETS, path: string) => {
  try {
    const bucketName = STORAGE_BUCKETS[bucket];
    const { error } = await supabase.storage.from(bucketName).remove([path]);

    if (error) {
      console.error('Storage delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    console.error('Delete file error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown delete error',
    };
  }
};

// Get public URL for a file
export const getPublicUrl = (bucket: keyof typeof STORAGE_BUCKETS, path: string): string => {
  const bucketName = STORAGE_BUCKETS[bucket];
  const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
  return data.publicUrl;
};

// Generate unique file path
export const generateFilePath = (userId: string, fileName: string, folder?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = fileName.split('.').pop();
  const baseName = `${timestamp}_${randomString}`;
  
  if (folder) {
    return `${folder}/${userId}/${baseName}.${extension}`;
  }
  
  return `${userId}/${baseName}.${extension}`;
};

// Upload avatar image
export const uploadAvatar = async (userId: string, file: File | Blob | string): Promise<FileUploadResult> => {
  const path = generateFilePath(userId, 'avatar.jpg', 'avatars');
  
  return uploadFile({
    bucket: 'AVATARS',
    path,
    file,
    contentType: 'image/jpeg',
    upsert: true, // Allow overwriting existing avatar
  });
};

// Upload post image
export const uploadPostImage = async (userId: string, file: File | Blob | string, fileName: string): Promise<FileUploadResult> => {
  const path = generateFilePath(userId, fileName, 'posts');
  
  return uploadFile({
    bucket: 'POSTS',
    path,
    file,
    contentType: 'image/jpeg',
  });
};

// Upload story image
export const uploadStoryImage = async (userId: string, file: File | Blob | string, fileName: string): Promise<FileUploadResult> => {
  const path = generateFilePath(userId, fileName, 'stories');
  
  return uploadFile({
    bucket: 'STORIES',
    path,
    file,
    contentType: 'image/jpeg',
  });
};

// List files in a bucket (for admin purposes)
export const listFiles = async (bucket: keyof typeof STORAGE_BUCKETS, folder?: string) => {
  try {
    const bucketName = STORAGE_BUCKETS[bucket];
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 100,
        offset: 0,
      });

    if (error) {
      console.error('Storage list error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('List files error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown list error',
    };
  }
};

// Get file metadata
export const getFileMetadata = async (bucket: keyof typeof STORAGE_BUCKETS, path: string) => {
  try {
    const bucketName = STORAGE_BUCKETS[bucket];
    const { data, error } = await supabase.storage
      .from(bucketName)
      .info(path);

    if (error) {
      console.error('Storage info error:', error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error('Get file metadata error:', err);
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown metadata error',
    };
  }
};

// Storage configuration for React Native Image Picker
export const getImagePickerConfig = () => ({
  mediaTypes: 'Images' as const,
  allowsEditing: true,
  aspect: [1, 1], // Square aspect ratio for Instagram-like posts
  quality: 0.8,
  base64: true, // Enable base64 for easy upload
});

// Validate image file
export const validateImageFile = (file: File | { size: number; type: string }): { valid: boolean; error?: string } => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File must be a JPEG, PNG, or WebP image' };
  }

  return { valid: true };
};

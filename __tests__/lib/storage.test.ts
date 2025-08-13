import { decode } from 'base64-arraybuffer';
import {
  uploadFile,
  deleteFile,
  getPublicUrl,
  generateFilePath,
  uploadAvatar,
  uploadPostImage,
  uploadStoryImage,
  validateImageFile,
  STORAGE_BUCKETS,
} from '../../lib/storage';
import { supabase } from '../../lib/supabase';

// Mock dependencies
jest.mock('base64-arraybuffer');
jest.mock('../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
        list: jest.fn(),
        info: jest.fn(),
      })),
    },
  },
}));

const mockDecode = decode as jest.MockedFunction<typeof decode>;
const mockSupabase = supabase as jest.Mocked<typeof supabase>;

describe('Storage Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('STORAGE_BUCKETS', () => {
    it('should define correct bucket names', () => {
      expect(STORAGE_BUCKETS.AVATARS).toBe('avatars');
      expect(STORAGE_BUCKETS.POSTS).toBe('posts');
      expect(STORAGE_BUCKETS.STORIES).toBe('stories');
    });
  });

  describe('uploadFile', () => {
    const mockStorageFrom = {
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    };

    beforeEach(() => {
      mockSupabase.storage = {
        from: jest.fn().mockReturnValue(mockStorageFrom),
      } as any;
    });

    it('should upload file successfully with base64 string', async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      mockDecode.mockReturnValue(mockArrayBuffer);

      mockStorageFrom.upload.mockResolvedValue({
        data: { path: 'test/path.jpg', fullPath: 'avatars/test/path.jpg' },
        error: null,
      });

      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/test/path.jpg' },
      });

      const result = await uploadFile({
        bucket: 'AVATARS',
        path: 'test/path.jpg',
        file: 'base64string',
        contentType: 'image/jpeg',
      });

      expect(mockDecode).toHaveBeenCalledWith('base64string');
      expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(mockStorageFrom.upload).toHaveBeenCalledWith(
        'test/path.jpg',
        mockArrayBuffer,
        {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false,
        }
      );
      expect(result).toEqual({
        data: {
          path: 'test/path.jpg',
          fullPath: 'avatars/test/path.jpg',
          publicUrl: 'https://example.com/test/path.jpg',
        },
        error: null,
      });
    });

    it('should handle upload error', async () => {
      mockStorageFrom.upload.mockResolvedValue({
        data: null,
        error: { message: 'Upload failed' },
      });

      const result = await uploadFile({
        bucket: 'POSTS',
        path: 'test/path.jpg',
        file: new ArrayBuffer(8),
      });

      expect(result).toEqual({
        data: null,
        error: 'Upload failed',
      });
    });
  });

  describe('deleteFile', () => {
    const mockStorageFrom = {
      remove: jest.fn(),
    };

    beforeEach(() => {
      mockSupabase.storage = {
        from: jest.fn().mockReturnValue(mockStorageFrom),
      } as any;
    });

    it('should delete file successfully', async () => {
      mockStorageFrom.remove.mockResolvedValue({ error: null });

      const result = await deleteFile('AVATARS', 'test/path.jpg');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('avatars');
      expect(mockStorageFrom.remove).toHaveBeenCalledWith(['test/path.jpg']);
      expect(result).toEqual({ success: true, error: null });
    });

    it('should handle delete error', async () => {
      mockStorageFrom.remove.mockResolvedValue({
        error: { message: 'Delete failed' },
      });

      const result = await deleteFile('POSTS', 'test/path.jpg');

      expect(result).toEqual({ success: false, error: 'Delete failed' });
    });
  });

  describe('getPublicUrl', () => {
    const mockStorageFrom = {
      getPublicUrl: jest.fn(),
    };

    beforeEach(() => {
      mockSupabase.storage = {
        from: jest.fn().mockReturnValue(mockStorageFrom),
      } as any;
    });

    it('should return public URL', () => {
      mockStorageFrom.getPublicUrl.mockReturnValue({
        data: { publicUrl: 'https://example.com/test/path.jpg' },
      });

      const result = getPublicUrl('STORIES', 'test/path.jpg');

      expect(mockSupabase.storage.from).toHaveBeenCalledWith('stories');
      expect(mockStorageFrom.getPublicUrl).toHaveBeenCalledWith('test/path.jpg');
      expect(result).toBe('https://example.com/test/path.jpg');
    });
  });

  describe('generateFilePath', () => {
    it('should generate unique file path with folder', () => {
      const userId = 'user123';
      const fileName = 'image.jpg';
      const folder = 'avatars';

      const result = generateFilePath(userId, fileName, folder);

      expect(result).toMatch(/^avatars\/user123\/\d+_[a-z0-9]+\.jpg$/);
    });

    it('should generate unique file path without folder', () => {
      const userId = 'user123';
      const fileName = 'image.png';

      const result = generateFilePath(userId, fileName);

      expect(result).toMatch(/^user123\/\d+_[a-z0-9]+\.png$/);
    });
  });

  describe('validateImageFile', () => {
    it('should validate file size and type correctly', () => {
      const validFile = {
        size: 5 * 1024 * 1024, // 5MB
        type: 'image/jpeg',
      };

      const result = validateImageFile(validFile);

      expect(result).toEqual({ valid: true });
    });

    it('should reject file that is too large', () => {
      const largeFile = {
        size: 15 * 1024 * 1024, // 15MB
        type: 'image/jpeg',
      };

      const result = validateImageFile(largeFile);

      expect(result).toEqual({
        valid: false,
        error: 'File size must be less than 10MB',
      });
    });

    it('should reject invalid file type', () => {
      const invalidFile = {
        size: 5 * 1024 * 1024, // 5MB
        type: 'application/pdf',
      };

      const result = validateImageFile(invalidFile);

      expect(result).toEqual({
        valid: false,
        error: 'File must be a JPEG, PNG, or WebP image',
      });
    });
  });

  describe('Specialized Upload Functions', () => {
    it('should have correct function signatures', () => {
      expect(typeof uploadAvatar).toBe('function');
      expect(typeof uploadPostImage).toBe('function');
      expect(typeof uploadStoryImage).toBe('function');
    });
  });
});

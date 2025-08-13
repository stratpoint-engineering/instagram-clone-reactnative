// Mock the dependencies at the top level
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      remove: jest.fn(),
      getPublicUrl: jest.fn(),
      list: jest.fn(),
      info: jest.fn(),
    })),
  },
  from: jest.fn(() => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
};

const mockCreateClient = jest.fn(() => mockSupabaseClient);

jest.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Supabase Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set environment variables
    process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.EXPO_PUBLIC_SUPABASE_KEY = 'test-key';
  });

  describe('Client Initialization', () => {
    it('should create Supabase client with correct configuration', () => {
      // Import the module to trigger client creation
      require('../../lib/supabase');

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-key',
        expect.objectContaining({
          auth: expect.objectContaining({
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: false,
          }),
          realtime: expect.objectContaining({
            params: {
              eventsPerSecond: 10,
            },
          }),
          global: expect.objectContaining({
            headers: {
              'X-Client-Info': 'rork-instagram-clone',
            },
          }),
        })
      );
    });

    it('should throw error when SUPABASE_URL is missing', () => {
      delete process.env.EXPO_PUBLIC_SUPABASE_URL;
      jest.resetModules(); // Clear module cache

      expect(() => {
        require('../../lib/supabase');
      }).toThrow('Missing EXPO_PUBLIC_SUPABASE_URL environment variable');
    });

    it('should throw error when SUPABASE_KEY is missing', () => {
      // Reset env vars first
      process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
      delete process.env.EXPO_PUBLIC_SUPABASE_KEY;
      jest.resetModules(); // Clear module cache

      expect(() => {
        require('../../lib/supabase');
      }).toThrow('Missing EXPO_PUBLIC_SUPABASE_KEY environment variable');
    });
  });

  describe('Helper Functions', () => {
    let supabaseModule: any;

    beforeEach(() => {
      // Import the module after setting up mocks
      supabaseModule = require('../../lib/supabase');
    });

    describe('getCurrentUser', () => {
      it('should return user when successful', async () => {
        const mockUser = { id: '123', email: 'test@example.com' };
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        const result = await supabaseModule.getCurrentUser();

        expect(result).toEqual(mockUser);
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalled();
      });

      it('should return null when error occurs', async () => {
        const mockError = new Error('Auth error');
        mockSupabaseClient.auth.getUser.mockResolvedValue({
          data: { user: null },
          error: mockError,
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await supabaseModule.getCurrentUser();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Error getting current user:', mockError);
        consoleSpy.mockRestore();
      });
    });

    describe('getCurrentSession', () => {
      it('should return session when successful', async () => {
        const mockSession = { access_token: 'token123', user: { id: '123' } };
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await supabaseModule.getCurrentSession();

        expect(result).toEqual(mockSession);
        expect(mockSupabaseClient.auth.getSession).toHaveBeenCalled();
      });

      it('should return null when error occurs', async () => {
        const mockError = new Error('Session error');
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: mockError,
        });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
        const result = await supabaseModule.getCurrentSession();

        expect(result).toBeNull();
        expect(consoleSpy).toHaveBeenCalledWith('Error getting current session:', mockError);
        consoleSpy.mockRestore();
      });
    });

    describe('signOut', () => {
      it('should sign out successfully', async () => {
        mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

        await expect(supabaseModule.signOut()).resolves.not.toThrow();
        expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      });

      it('should throw error when sign out fails', async () => {
        const mockError = new Error('Sign out error');
        mockSupabaseClient.auth.signOut.mockResolvedValue({ error: mockError });

        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await expect(supabaseModule.signOut()).rejects.toThrow('Sign out error');
        expect(consoleSpy).toHaveBeenCalledWith('Error signing out:', mockError);
        consoleSpy.mockRestore();
      });
    });

    describe('isAuthenticated', () => {
      it('should return true when user has valid session', async () => {
        const mockSession = { access_token: 'token123', user: { id: '123' } };
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: mockSession },
          error: null,
        });

        const result = await supabaseModule.isAuthenticated();

        expect(result).toBe(true);
      });

      it('should return false when no session exists', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: null,
        });

        const result = await supabaseModule.isAuthenticated();

        expect(result).toBe(false);
      });

      it('should return false when session check fails', async () => {
        mockSupabaseClient.auth.getSession.mockResolvedValue({
          data: { session: null },
          error: new Error('Session error'),
        });

        const result = await supabaseModule.isAuthenticated();

        expect(result).toBe(false);
      });
    });
  });

  describe('Exports', () => {
    it('should export supabase client', () => {
      const { supabase } = require('../../lib/supabase');
      expect(supabase).toBeDefined();
    });

    it('should export supabase client as default', () => {
      const defaultExport = require('../../lib/supabase').default;
      expect(defaultExport).toBeDefined();
    });

    it('should export all helper functions', () => {
      const module = require('../../lib/supabase');
      expect(typeof module.getCurrentUser).toBe('function');
      expect(typeof module.getCurrentSession).toBe('function');
      expect(typeof module.signOut).toBe('function');
      expect(typeof module.isAuthenticated).toBe('function');
    });
  });
});

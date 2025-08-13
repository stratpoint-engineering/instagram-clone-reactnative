// Unit tests for Zustand auth store
import { useAuthStore, getAuthState, isUserAuthenticated } from '../../store/authStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().reset();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useAuthStore.getState();
      
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.isFirstTimeUser).toBe(true);
    });
  });

  describe('Basic Setters', () => {
    it('should set user', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      
      useAuthStore.getState().setUser(mockUser as any);
      
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should set loading state', () => {
      useAuthStore.getState().setLoading(true);
      
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set error', () => {
      const errorMessage = 'Test error';
      
      useAuthStore.getState().setError(errorMessage);
      
      expect(useAuthStore.getState().error).toBe(errorMessage);
    });

    it('should clear error', () => {
      useAuthStore.getState().setError('Test error');
      useAuthStore.getState().clearError();
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });

  describe('Login Action', () => {
    it('should handle successful login', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockProfile = { id: '123', username: 'testuser', full_name: 'Test User' };
      const mockSession = { access_token: 'token123', user: mockUser };

      useAuthStore.getState().login(mockUser as any, mockProfile as any, mockSession as any);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.profile).toEqual(mockProfile);
      expect(state.session).toEqual(mockSession);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.isFirstTimeUser).toBe(false);
    });

    it('should set first time user to true when no profile', () => {
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123', user: mockUser };

      useAuthStore.getState().login(mockUser as any, null, mockSession as any);

      const state = useAuthStore.getState();
      expect(state.isFirstTimeUser).toBe(true);
    });
  });

  describe('Logout Action', () => {
    it('should handle logout', () => {
      // First login
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockProfile = { id: '123', username: 'testuser' };
      const mockSession = { access_token: 'token123' };
      
      useAuthStore.getState().login(mockUser as any, mockProfile as any, mockSession as any);
      
      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.profile).toBeNull();
      expect(state.session).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('Profile Updates', () => {
    it('should update profile', () => {
      const mockProfile = { id: '123', username: 'testuser', full_name: 'Test User' };
      
      useAuthStore.getState().setProfile(mockProfile as any);
      useAuthStore.getState().updateProfile({ bio: 'Updated bio' });

      const state = useAuthStore.getState();
      expect(state.profile).toEqual({
        ...mockProfile,
        bio: 'Updated bio',
      });
    });

    it('should not update profile if no current profile', () => {
      useAuthStore.getState().updateProfile({ bio: 'Updated bio' });

      const state = useAuthStore.getState();
      expect(state.profile).toBeNull();
    });
  });

  describe('Onboarding State', () => {
    it('should set onboarding complete', () => {
      useAuthStore.getState().setOnboardingComplete(true);
      
      expect(useAuthStore.getState().hasCompletedOnboarding).toBe(true);
    });

    it('should set first time user', () => {
      useAuthStore.getState().setFirstTimeUser(false);
      
      expect(useAuthStore.getState().isFirstTimeUser).toBe(false);
    });
  });

  describe('Helper Functions', () => {
    it('should get auth state', () => {
      const state = getAuthState();
      
      expect(state).toBeDefined();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should check if user is authenticated', () => {
      expect(isUserAuthenticated()).toBe(false);
      
      // Login user
      const mockUser = { id: '123', email: 'test@example.com' };
      const mockSession = { access_token: 'token123' };
      
      useAuthStore.getState().login(mockUser as any, null, mockSession as any);
      
      expect(isUserAuthenticated()).toBe(true);
    });
  });

  describe('Reset Action', () => {
    it('should reset to initial state', () => {
      // Set some state
      useAuthStore.getState().setUser({ id: '123' } as any);
      useAuthStore.getState().setError('Test error');
      useAuthStore.getState().setOnboardingComplete(true);
      
      // Reset
      useAuthStore.getState().reset();
      
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
      expect(state.hasCompletedOnboarding).toBe(false);
      expect(state.isFirstTimeUser).toBe(true);
    });
  });
});

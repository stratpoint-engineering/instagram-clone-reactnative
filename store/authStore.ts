import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/database/types';

// Auth store state interface
export interface AuthState {
  // User data
  user: User | null;
  profile: Profile | null;
  session: Session | null;

  // UI state
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Onboarding state
  hasCompletedOnboarding: boolean;
  isFirstTimeUser: boolean;
}

// Auth store actions interface
export interface AuthActions {
  // Authentication actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;

  // UI state actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Onboarding actions
  setOnboardingComplete: (completed: boolean) => void;
  setFirstTimeUser: (isFirstTime: boolean) => void;

  // Combined actions
  login: (user: User, profile: Profile | null, session: Session) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => void;

  // Reset actions
  reset: () => void;
}

// Combined store type
export type AuthStore = AuthState & AuthActions;

// Initial state
const initialState: AuthState = {
  user: null,
  profile: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  hasCompletedOnboarding: false,
  isFirstTimeUser: true,
};

/**
 * Zustand store for authentication state management
 *
 * Features:
 * - Persistent storage using AsyncStorage
 * - User session management
 * - Profile data management
 * - Loading and error states
 * - Onboarding state tracking
 *
 * Usage:
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Basic setters
      setUser: (user) => {
        set({ user });
      },

      setProfile: (profile) => {
        set({ profile });
      },

      setSession: (session) => {
        set({ session });
      },

      setAuthenticated: (isAuthenticated) => {
        set({ isAuthenticated });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setOnboardingComplete: (completed) => {
        set({ hasCompletedOnboarding: completed });
      },

      setFirstTimeUser: (isFirstTime) => {
        set({ isFirstTimeUser: isFirstTime });
      },

      // Combined actions
      login: (user, profile, session) => {
        set({
          user,
          profile,
          session,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          isFirstTimeUser: !profile,
        });
      },

      logout: () => {
        set({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: (updates) => {
        const currentProfile = get().profile;
        if (currentProfile) {
          set({
            profile: { ...currentProfile, ...updates },
          });
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'auth-storage', // Storage key
      storage: createJSONStorage(() => AsyncStorage),

      // Only persist certain fields
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
        isFirstTimeUser: state.isFirstTimeUser,
        // Don't persist loading states and errors
      }),

      // Version for migration support
      version: 1,

      // Migration function for future schema changes
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          // Migration from version 0 to 1
          // Add any migration logic here
          return {
            ...persistedState,
            hasCompletedOnboarding: false,
            isFirstTimeUser: true,
          };
        }
        return persistedState;
      },

      // Merge function to handle hydration
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<AuthState>),
        // Always start with loading false and no error
        isLoading: false,
        error: null,
      }),
    }
  )
);

// Selector hooks for better performance
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthProfile = () => useAuthStore((state) => state.profile);
export const useAuthSession = () => useAuthStore((state) => state.session);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useOnboardingState = () => useAuthStore((state) => ({
  hasCompletedOnboarding: state.hasCompletedOnboarding,
  isFirstTimeUser: state.isFirstTimeUser,
}));

// Action selectors
export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setProfile: state.setProfile,
  setSession: state.setSession,
  setAuthenticated: state.setAuthenticated,
  setLoading: state.setLoading,
  setError: state.setError,
  clearError: state.clearError,
  setOnboardingComplete: state.setOnboardingComplete,
  setFirstTimeUser: state.setFirstTimeUser,
  login: state.login,
  logout: state.logout,
  updateProfile: state.updateProfile,
  reset: state.reset,
}));

// Helper function to get auth state outside of React components
export const getAuthState = () => useAuthStore.getState();

// Helper function to check if user is authenticated outside of React components
export const isUserAuthenticated = () => {
  const state = useAuthStore.getState();
  return state.isAuthenticated && !!state.user && !!state.session;
};

// Helper function to get current user outside of React components
export const getCurrentAuthUser = () => {
  const state = useAuthStore.getState();
  return state.user;
};

// Helper function to get current profile outside of React components
export const getCurrentAuthProfile = () => {
  const state = useAuthStore.getState();
  return state.profile;
};

/**
 * Store Index - Centralized State Management
 * 
 * This file exports all Zustand stores for easy importing.
 * 
 * Usage:
 * import { useAuthStore, useAuthActions } from '@/store';
 */

// Export auth store and all its utilities
export {
  useAuthStore,
  useAuthUser,
  useAuthProfile,
  useAuthSession,
  useIsAuthenticated,
  useAuthLoading,
  useAuthError,
  useOnboardingState,
  useAuthActions,
  getAuthState,
  isUserAuthenticated,
  getCurrentAuthUser,
  getCurrentAuthProfile,
} from './authStore';

// Export types
export type { AuthState, AuthActions, AuthStore } from './authStore';

import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore, useAuthActions } from '@/store';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import type { Profile } from '@/lib/database/types';

// Re-export auth state interface from store
export type { AuthState } from '@/store';

// Auth credentials interfaces
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  username?: string;
  fullName?: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  password: string;
  newPassword: string;
}

/**
 * Custom hook for Supabase authentication with Zustand store integration
 *
 * Provides comprehensive authentication functionality including:
 * - User session management
 * - Login/logout/signup operations
 * - Profile data integration
 * - Real-time auth state updates
 * - Error handling
 * - Centralized state management via Zustand
 *
 * Usage:
 * const { user, isAuthenticated, login, logout, signUp } = useAuth();
 */
export function useAuth() {
  // Get state from Zustand store
  const state = useAuthStore();
  const actions = useAuthActions();

  // Set error helper
  const setError = useCallback((error: string | null) => {
    actions.setError(error);
    actions.setLoading(false);
  }, [actions]);

  // Clear error helper
  const clearError = useCallback(() => {
    actions.clearError();
  }, [actions]);

  // Fetch user profile from database
  const fetchUserProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.clearError();

      // Get current session
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Error getting session:', error);
        setError('Failed to initialize authentication');
        return;
      }

      if (session?.user) {
        // Fetch user profile
        const profile = await fetchUserProfile(session.user.id);

        actions.login(session.user, profile, session);
      } else {
        actions.logout();
        actions.setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setError('Failed to initialize authentication');
    }
  }, [actions, setError, fetchUserProfile]);

  // Login with email and password
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      if (data.user && data.session) {
        const profile = await fetchUserProfile(data.user.id);
        actions.login(data.user, profile, data.session);
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [actions, setError, fetchUserProfile]);

  // Sign up with email and password
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: credentials.fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // Note: User might need to verify email before being fully authenticated
      if (data.user) {
        if (data.session) {
          // User is immediately authenticated (no email verification required)
          const profile = await fetchUserProfile(data.user.id);
          actions.login(data.user, profile, data.session);
        } else {
          // User needs to verify email
          actions.setUser(data.user);
          actions.setAuthenticated(false);
          actions.setLoading(false);
        }
      }

      return {
        success: true,
        error: null,
        needsVerification: !data.session // If no session, email verification is required
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [actions, setError, fetchUserProfile]);

  // Logout
  const logout = useCallback(async () => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      actions.logout();

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [actions, setError]);

  // Reset password
  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      actions.setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [actions, setError]);

  // Update password
  const updatePassword = useCallback(async (data: UpdatePasswordData) => {
    try {
      actions.setLoading(true);
      actions.clearError();

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      actions.setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [actions, setError]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!state.user) return;

    try {
      const profile = await fetchUserProfile(state.user.id);
      actions.setProfile(profile);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [state.user, fetchUserProfile, actions]);

  // Set up auth state listener
  useEffect(() => {
    // Initialize auth on mount
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          actions.login(session.user, profile, session);
        } else {
          actions.logout();
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserProfile, actions]);

  return {
    // State
    ...state,

    // Actions
    login,
    signUp,
    logout,
    resetPassword,
    updatePassword,
    refreshUser,
    clearError,
  };
}

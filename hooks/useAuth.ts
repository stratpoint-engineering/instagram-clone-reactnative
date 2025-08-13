import { useEffect, useCallback, useRef } from 'react';
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
  // Get state and actions from Zustand store
  const store = useAuthStore();

  // Set error helper
  const setError = useCallback((error: string | null) => {
    store.setError(error);
    store.setLoading(false);
  }, [store]);

  // Clear error helper
  const clearError = useCallback(() => {
    store.clearError();
  }, [store]);

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



  // Login with email and password
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      store.setLoading(true);
      store.clearError();

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
        store.login(data.user, profile, data.session);
      }

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [store, setError, fetchUserProfile]);

  // Sign up with email and password
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      store.setLoading(true);
      store.clearError();

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
          store.login(data.user, profile, data.session);
        } else {
          // User needs to verify email
          store.setUser(data.user);
          store.setAuthenticated(false);
          store.setLoading(false);
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
  }, [store, setError, fetchUserProfile]);

  // Logout
  const logout = useCallback(async () => {
    try {
      store.setLoading(true);
      store.clearError();

      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      store.logout();

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [store, setError]);

  // Reset password
  const resetPassword = useCallback(async (data: ResetPasswordData) => {
    try {
      store.setLoading(true);
      store.clearError();

      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      store.setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [store, setError]);

  // Update password
  const updatePassword = useCallback(async (data: UpdatePasswordData) => {
    try {
      store.setLoading(true);
      store.clearError();

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      store.setLoading(false);
      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [store, setError]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!store.user) return;

    try {
      const profile = await fetchUserProfile(store.user.id);
      store.setProfile(profile);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [store, fetchUserProfile]);

  // Initialize auth state once on mount
  const initializationRef = useRef(false);

  useEffect(() => {
    if (initializationRef.current) return; // Prevent multiple initializations
    initializationRef.current = true;

    let mounted = true;

    const initAuth = async () => {
      if (!mounted) return;

      try {
        store.setLoading(true);

        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mounted) return;

        if (error) {
          console.error('Auth session error:', error);
          store.logout();
          return;
        }

        if (session?.user) {
          // User is authenticated
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            store.login(session.user, profile, session);
          }
        } else {
          // No session
          if (mounted) {
            store.logout();
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        if (mounted) {
          store.logout();
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event);

        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          if (mounted) {
            store.login(session.user, profile, session);
          }
        } else {
          if (mounted) {
            store.logout();
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to run only once

  return {
    // State
    ...store,

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

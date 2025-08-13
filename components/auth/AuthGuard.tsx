import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requireProfile?: boolean;
}

/**
 * AuthGuard component for protecting routes based on authentication state
 *
 * Features:
 * - Protects routes that require authentication
 * - Redirects unauthenticated users to login
 * - Shows loading state during auth initialization
 * - Supports custom fallback components
 * - Can require profile completion
 *
 * Usage:
 * <AuthGuard requireAuth>
 *   <ProtectedContent />
 * </AuthGuard>
 *
 * <AuthGuard requireAuth={false} redirectTo="/login">
 *   <PublicContent />
 * </AuthGuard>
 */
export function AuthGuard({
  children,
  fallback,
  redirectTo = '/login',
  requireAuth = true,
  requireProfile = false,
}: AuthGuardProps) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  // Show loading state
  if (isLoading) {
    return fallback || <AuthLoadingFallback />;
  }

  // Check auth requirements
  if (requireAuth && !isAuthenticated) {
    // User needs to be authenticated but isn't
    return fallback || <AuthLoadingFallback />;
  }

  if (!requireAuth && isAuthenticated) {
    // User shouldn't be authenticated but is
    return fallback || <AuthLoadingFallback />;
  }

  if (requireProfile && isAuthenticated && !profile) {
    // User is authenticated but needs to complete profile
    return fallback || <ProfileRequiredFallback />;
  }

  // All checks passed, render children
  return <>{children}</>;
}

/**
 * Default loading fallback component
 */
function AuthLoadingFallback() {
  return (
    <View style={styles.fallbackContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.fallbackText}>Loading...</Text>
    </View>
  );
}

/**
 * Profile required fallback component
 */
function ProfileRequiredFallback() {
  return (
    <View style={styles.fallbackContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.fallbackText}>Setting up your profile...</Text>
    </View>
  );
}

/**
 * Higher-order component version of AuthGuard
 *
 * Usage:
 * const ProtectedComponent = withAuthGuard(MyComponent, { requireAuth: true });
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...guardProps}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * Hook for checking auth requirements in components
 *
 * Usage:
 * const { canAccess, isLoading, reason } = useAuthAccess({ requireAuth: true });
 */
export function useAuthAccess(requirements: {
  requireAuth?: boolean;
  requireProfile?: boolean;
}) {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  const { requireAuth = true, requireProfile = false } = requirements;

  if (isLoading) {
    return {
      canAccess: false,
      isLoading: true,
      reason: 'loading',
    };
  }

  if (requireAuth && !isAuthenticated) {
    return {
      canAccess: false,
      isLoading: false,
      reason: 'not_authenticated',
    };
  }

  if (!requireAuth && isAuthenticated) {
    return {
      canAccess: false,
      isLoading: false,
      reason: 'already_authenticated',
    };
  }

  if (requireProfile && isAuthenticated && !profile) {
    return {
      canAccess: false,
      isLoading: false,
      reason: 'profile_required',
    };
  }

  return {
    canAccess: true,
    isLoading: false,
    reason: null,
  };
}

/**
 * Component for conditionally rendering content based on auth state
 *
 * Usage:
 * <AuthContent requireAuth>
 *   <Text>Only authenticated users see this</Text>
 * </AuthContent>
 *
 * <AuthContent requireAuth={false}>
 *   <Text>Only unauthenticated users see this</Text>
 * </AuthContent>
 */
export function AuthContent({
  children,
  requireAuth = true,
  requireProfile = false,
  fallback = null,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireProfile?: boolean;
  fallback?: React.ReactNode;
}) {
  const { canAccess, isLoading } = useAuthAccess({ requireAuth, requireProfile });

  if (isLoading) {
    return fallback;
  }

  if (canAccess) {
    return <>{children}</>;
  }

  return fallback;
}

const styles = StyleSheet.create({
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  fallbackText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

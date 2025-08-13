import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';

export type SocialProvider = 'google' | 'apple' | 'facebook' | 'github';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

/**
 * SocialLoginButton component for OAuth authentication
 * 
 * Features:
 * - Support for multiple OAuth providers (Google, Apple, Facebook, GitHub)
 * - Supabase OAuth integration
 * - Loading states
 * - Error handling
 * - Customizable styling
 * - Provider-specific icons and colors
 * 
 * Usage:
 * <SocialLoginButton 
 *   provider="google" 
 *   onSuccess={() => router.push('/(tabs)')} 
 * />
 */
export function SocialLoginButton({
  provider,
  onPress,
  onSuccess,
  onError,
  disabled = false,
  loading = false,
  style,
  textStyle,
}: SocialLoginButtonProps) {
  
  const handlePress = async () => {
    if (disabled || loading) return;

    try {
      if (onPress) {
        onPress();
        return;
      }

      // Use Supabase OAuth
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`${provider} login error:`, error);
        if (onError) {
          onError(error.message);
        }
        return;
      }

      // OAuth redirect will handle the rest
      // onSuccess will be called after successful authentication
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      const errorMessage = error instanceof Error ? error.message : `${provider} login failed`;
      if (onError) {
        onError(errorMessage);
      }
    }
  };

  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: '🔍', // In a real app, use proper Google icon
          text: 'Continue with Google',
          backgroundColor: '#4285F4',
          textColor: '#FFFFFF',
        };
      case 'apple':
        return {
          icon: '🍎', // In a real app, use proper Apple icon
          text: 'Continue with Apple',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
        };
      case 'facebook':
        return {
          icon: '📘', // In a real app, use proper Facebook icon
          text: 'Continue with Facebook',
          backgroundColor: '#1877F2',
          textColor: '#FFFFFF',
        };
      case 'github':
        return {
          icon: '🐙', // In a real app, use proper GitHub icon
          text: 'Continue with GitHub',
          backgroundColor: '#333333',
          textColor: '#FFFFFF',
        };
      default:
        return {
          icon: '🔐',
          text: 'Continue with OAuth',
          backgroundColor: '#6B7280',
          textColor: '#FFFFFF',
        };
    }
  };

  const config = getProviderConfig();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: config.backgroundColor },
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="small" color={config.textColor} />
        ) : (
          <Text style={styles.icon}>{config.icon}</Text>
        )}
        
        <Text
          style={[
            styles.text,
            { color: config.textColor },
            textStyle,
          ]}
        >
          {config.text}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * SocialLoginGroup component for displaying multiple social login options
 * 
 * Usage:
 * <SocialLoginGroup 
 *   providers={['google', 'apple']}
 *   onSuccess={() => router.push('/(tabs)')}
 * />
 */
interface SocialLoginGroupProps {
  providers: SocialProvider[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
  style?: any;
}

export function SocialLoginGroup({ providers, onSuccess, onError, style }: SocialLoginGroupProps) {
  return (
    <View style={[styles.group, style]}>
      {providers.map((provider) => (
        <SocialLoginButton
          key={provider}
          provider={provider}
          onSuccess={onSuccess}
          onError={onError}
          style={styles.groupButton}
        />
      ))}
    </View>
  );
}

/**
 * SocialLoginDivider component for separating social login from email/password
 * 
 * Usage:
 * <SocialLoginDivider />
 */
export function SocialLoginDivider({ text = 'or' }: { text?: string }) {
  return (
    <View style={styles.divider}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 4,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 18,
    marginRight: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  group: {
    gap: 8,
  },
  groupButton: {
    marginVertical: 0,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
});

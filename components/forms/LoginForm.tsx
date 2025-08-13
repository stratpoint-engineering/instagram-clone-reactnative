import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';

interface LoginFormProps {
  onLogin?: (email: string, password: string) => void;
  onSuccess?: () => void;
  onSignUpPress?: () => void;
  onForgotPasswordPress?: () => void;
}

/**
 * LoginForm component with Supabase authentication integration
 * Located in: components/forms/LoginForm.tsx
 *
 * Features:
 * - Supabase authentication integration
 * - Form validation
 * - Loading states and error handling
 * - Password visibility toggle
 * - Links to sign up and forgot password
 *
 * Usage:
 * import { LoginForm } from '@/components/forms';
 * <LoginForm onSuccess={() => router.push('/(tabs)')} />
 */
export function LoginForm({ onLogin, onSuccess, onSignUpPress, onForgotPasswordPress }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  // Update field and clear errors
  const updateEmail = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const updatePassword = (value: string) => {
    setPassword(value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; general?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (onLogin) {
        // Use custom handler if provided
        onLogin(email, password);
      } else {
        // Use built-in auth
        const result = await login({
          email: email.trim(),
          password,
        });

        if (result.success) {
          Alert.alert(
            'Welcome Back!',
            'You have been logged in successfully.',
            [{ text: 'OK', onPress: onSuccess }]
          );

          // Reset form
          setEmail('');
          setPassword('');
          setErrors({});

          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      <View style={styles.form}>
        {/* General Error */}
        {(errors.general || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general || error}</Text>
          </View>
        )}

        <Input
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={updateEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={updatePassword}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoComplete="password"
          rightIcon={showPassword ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        {/* Forgot Password Link */}
        {onForgotPasswordPress && (
          <View style={styles.forgotPasswordContainer}>
            <Button
              variant="link"
              onPress={onForgotPasswordPress}
              style={styles.forgotPasswordButton}
            >
              Forgot Password?
            </Button>
          </View>
        )}

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Sign Up Link */}
        {onSignUpPress && (
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>Don't have an account? </Text>
            <Button
              variant="link"
              onPress={onSignUpPress}
              style={styles.signUpButton}
            >
              Sign Up
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordButton: {
    paddingHorizontal: 0,
  },
  submitButton: {
    marginBottom: 24,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#666',
  },
  signUpButton: {
    paddingHorizontal: 0,
  },
});

export default LoginForm;

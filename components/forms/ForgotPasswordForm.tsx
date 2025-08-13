import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert } from 'react-native';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';

interface ForgotPasswordFormProps {
  onResetPassword?: (email: string) => void;
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

/**
 * ForgotPasswordForm component for password reset
 * 
 * Features:
 * - Email validation
 * - Supabase password reset integration
 * - Loading states and error handling
 * - Success feedback
 * - Back to login navigation
 * 
 * Usage:
 * <ForgotPasswordForm onSuccess={() => router.push('/login')} />
 */
export function ForgotPasswordForm({ onResetPassword, onSuccess, onBackToLogin }: ForgotPasswordFormProps) {
  const { resetPassword, isLoading, error, clearError } = useAuth();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Update email and clear errors
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

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: { email?: string; general?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (onResetPassword) {
        // Use custom handler if provided
        onResetPassword(email.trim());
      } else {
        // Use built-in auth
        const result = await resetPassword({
          email: email.trim(),
        });

        if (result.success) {
          setIsSubmitted(true);
          Alert.alert(
            'Check Your Email',
            'We sent you a password reset link. Please check your email and follow the instructions to reset your password.',
            [{ text: 'OK', onPress: onSuccess }]
          );
          
          if (onSuccess) {
            onSuccess();
          }
        }
      }
    } catch (error) {
      console.error('Password reset error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  // Success state
  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We sent a password reset link to{'\n'}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          <Text style={styles.successInstructions}>
            Click the link in the email to reset your password. If you don't see the email, check your spam folder.
          </Text>
          
          <Button
            onPress={onBackToLogin}
            variant="outline"
            style={styles.backButton}
          >
            Back to Login
          </Button>
          
          <Button
            onPress={() => {
              setIsSubmitted(false);
              setEmail('');
              setErrors({});
            }}
            variant="link"
            style={styles.resendButton}
          >
            Resend Email
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        {/* General Error */}
        {(errors.general || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general || error}</Text>
          </View>
        )}

        {/* Email Input */}
        <Input
          label="Email"
          placeholder="Enter your email address"
          value={email}
          onChangeText={updateEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoFocus
        />

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>

        {/* Back to Login */}
        {onBackToLogin && (
          <View style={styles.backToLoginContainer}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <Button
              variant="link"
              onPress={onBackToLogin}
              style={styles.backToLoginButton}
            >
              Back to Login
            </Button>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  form: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
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
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#666',
  },
  backToLoginButton: {
    paddingHorizontal: 0,
  },
  // Success state styles
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: '#000',
  },
  successInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  backButton: {
    marginBottom: 16,
    width: '100%',
  },
  resendButton: {
    paddingHorizontal: 0,
  },
});

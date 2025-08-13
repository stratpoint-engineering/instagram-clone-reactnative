import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView } from 'react-native';
import { useAuth } from '@/hooks';
import { Button, Input } from '@/components/ui';

interface SignUpFormProps {
  onSignUp?: (email: string, password: string, username?: string, fullName?: string) => void;
  onSuccess?: (email?: string) => void;
  onLoginPress?: () => void;
}

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  fullName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  username?: string;
  fullName?: string;
  general?: string;
}

/**
 * SignUpForm component for user registration
 *
 * Features:
 * - Email and password registration
 * - Username and full name collection
 * - Form validation
 * - Password confirmation
 * - Integration with Supabase Auth
 * - Loading states and error handling
 *
 * Usage:
 * <SignUpForm onSuccess={() => router.push('/profile-setup')} />
 */
export function SignUpForm({ onSignUp, onSuccess, onLoginPress }: SignUpFormProps) {
  const { signUp, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    fullName: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Update form field
  const updateField = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }

    // Clear auth error
    if (error) {
      clearError();
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (onSignUp) {
        // Use custom handler if provided
        onSignUp(formData.email, formData.password, formData.username, formData.fullName);
      } else {
        // Use built-in auth
        const result = await signUp({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          fullName: formData.fullName,
        });

        if (result.success) {
          if (result.needsVerification) {
            Alert.alert(
              'Check Your Email',
              'We sent you a verification link. Please check your email and click the link to verify your account.',
              [{ text: 'OK' }]
            );
          } else {
            Alert.alert(
              'Welcome!',
              'Your account has been created successfully.',
              [{ text: 'OK', onPress: () => onSuccess?.(formData.email) }]
            );
          }

          // Reset form
          const userEmail = formData.email; // Store email before resetting
          setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            fullName: '',
          });
          setErrors({});

          if (onSuccess) {
            onSuccess(userEmail);
          }
        }
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join our community today</Text>

        {/* General Error */}
        {(errors.general || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general || error}</Text>
          </View>
        )}

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChangeText={(value) => updateField('fullName', value)}
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
        />

        {/* Username */}
        <Input
          label="Username"
          placeholder="Choose a username"
          value={formData.username}
          onChangeText={(value) => updateField('username', value.toLowerCase())}
          error={errors.username}
          autoCapitalize="none"
          autoComplete="username"
        />

        {/* Email */}
        <Input
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onChangeText={(value) => updateField('email', value)}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />

        {/* Password */}
        <Input
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(value) => updateField('password', value)}
          error={errors.password}
          secureTextEntry={!showPassword}
          autoComplete="new-password"
          rightIcon={showPassword ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowPassword(!showPassword)}
        />

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateField('confirmPassword', value)}
          error={errors.confirmPassword}
          secureTextEntry={!showConfirmPassword}
          autoComplete="new-password"
          rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
          onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
        />

        {/* Password Requirements */}
        <View style={styles.requirementsContainer}>
          <Text style={styles.requirementsTitle}>Password must contain:</Text>
          <Text style={styles.requirement}>• At least 8 characters</Text>
          <Text style={styles.requirement}>• One uppercase letter</Text>
          <Text style={styles.requirement}>• One lowercase letter</Text>
          <Text style={styles.requirement}>• One number</Text>
        </View>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Button
            variant="link"
            onPress={onLoginPress}
            style={styles.loginButton}
          >
            Sign In
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  requirementsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  submitButton: {
    marginBottom: 24,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666',
  },
  loginButton: {
    paddingHorizontal: 0,
  },
});

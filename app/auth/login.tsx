import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoginForm } from '@/components/forms';
import { SocialLoginGroup, SocialLoginDivider } from '@/components/auth';

/**
 * Login Screen Component
 *
 * Features:
 * - Integration with existing LoginForm component
 * - Social login options (Google, Apple, Facebook, GitHub)
 * - Navigation to signup and forgot password screens
 * - AuthGuard protection (redirects if already authenticated)
 * - Responsive design with proper spacing
 * - Error handling and loading states
 *
 * Navigation:
 * - Success: Redirects to main app (tabs)
 * - Sign Up: Navigates to signup screen
 * - Forgot Password: Navigates to forgot password screen
 */
export default function LoginScreen() {
  // Handle successful login
  const handleLoginSuccess = () => {
    console.log('Login successful, navigating to main app');
    router.replace('/(tabs)');
  };

  // Handle navigation to signup
  const handleSignUpPress = () => {
    router.push('/auth/signup');
  };

  // Handle navigation to forgot password
  const handleForgotPasswordPress = () => {
    router.push('/auth/forgot-password');
  };

  // Handle social login success
  const handleSocialLoginSuccess = () => {
    console.log('Social login successful, navigating to main app');
    router.replace('/(tabs)');
  };

  // Handle social login error
  const handleSocialLoginError = (error: string) => {
    console.error('Social login error:', error);
    Alert.alert(
      'Login Failed',
      'There was an error signing in with your social account. Please try again.',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appName}>Instagram</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSignUpPress={handleSignUpPress}
            onForgotPasswordPress={handleForgotPasswordPress}
          />
        </View>

        {/* Social Login Divider */}
        <View style={styles.divider}>
          <SocialLoginDivider />
        </View>

        {/* Social Login Options */}
        <View style={styles.socialContainer}>
          <SocialLoginGroup
            providers={['google', 'apple']}
            onSuccess={handleSocialLoginSuccess}
            onError={handleSocialLoginError}
          />
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>
            Don't have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleSignUpPress}>
            <Text style={styles.signupLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 8,
    fontFamily: 'System', // Instagram-style font
  },
  welcomeText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: 32,
  },
  divider: {
    marginVertical: 24,
  },
  socialContainer: {
    marginBottom: 32,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  signupText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  signupLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

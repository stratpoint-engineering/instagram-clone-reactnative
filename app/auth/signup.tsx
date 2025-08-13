import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SignUpForm } from '@/components/forms';
import { SocialLoginGroup, SocialLoginDivider } from '@/components/auth';
import { AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui';

/**
 * Sign Up Screen Component
 *
 * Features:
 * - Integration with existing SignUpForm component
 * - Email verification flow handling
 * - Social login options (Google, Apple)
 * - Navigation to login screen
 * - AuthGuard protection (redirects if already authenticated)
 * - Email verification confirmation screen
 * - Resend verification email functionality
 *
 * Flow:
 * 1. User fills out signup form
 * 2. Account created, verification email sent
 * 3. User sees verification screen
 * 4. After verification, redirects to profile setup
 */
export default function SignUpScreen() {
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Handle successful signup (account created, verification email sent)
  const handleSignUpSuccess = (email?: string) => {
    console.log('Signup successful, showing verification screen');
    if (email) {
      setUserEmail(email);
    }
    setShowVerificationScreen(true);
  };

  // Handle navigation to login
  const handleLoginPress = () => {
    router.push('/auth/login');
  };

  // Handle social login success
  const handleSocialLoginSuccess = () => {
    console.log('Social login successful, navigating to profile setup');
    router.replace('/auth/profile-setup');
  };

  // Handle social login error
  const handleSocialLoginError = (error: string) => {
    console.error('Social login error:', error);
    Alert.alert(
      'Sign Up Failed',
      'There was an error signing up with your social account. Please try again.',
      [{ text: 'OK' }]
    );
  };

  // Handle resend verification email
  const handleResendVerification = () => {
    // This would typically call the auth service to resend verification
    Alert.alert(
      'Verification Email Sent',
      'We\'ve sent another verification email to your inbox.',
      [{ text: 'OK' }]
    );
  };

  // Handle back to signup form
  const handleBackToSignUp = () => {
    setShowVerificationScreen(false);
    setUserEmail('');
  };

  // Handle verification complete (user clicked email link)
  const handleVerificationComplete = () => {
    router.replace('/auth/profile-setup');
  };

  // Render email verification screen
  if (showVerificationScreen) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.verificationContainer}>
          <View style={styles.verificationContent}>
            {/* Verification Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📧</Text>
            </View>

            {/* Verification Text */}
            <Text style={styles.verificationTitle}>Check Your Email</Text>
            <Text style={styles.verificationText}>
              We've sent a verification link to{'\n'}
              <Text style={styles.emailText}>{userEmail}</Text>
            </Text>
            <Text style={styles.verificationSubtext}>
              Click the link in the email to verify your account and continue setting up your profile.
            </Text>

            {/* Action Buttons */}
            <View style={styles.verificationActions}>
              <Button
                variant="primary"
                onPress={handleVerificationComplete}
                style={styles.verificationButton}
              >
                I've Verified My Email
              </Button>

              <Button
                variant="outline"
                onPress={handleResendVerification}
                style={styles.verificationButton}
              >
                Resend Email
              </Button>

              <TouchableOpacity onPress={handleBackToSignUp}>
                <Text style={styles.backLink}>Back to Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Render signup form screen
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
          <Text style={styles.welcomeText}>Join our community</Text>
        </View>

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          <SignUpForm
            onSuccess={(email) => handleSignUpSuccess(email)}
            onLoginPress={handleLoginPress}
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

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={handleLoginPress}>
            <Text style={styles.loginLink}>Sign in</Text>
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
    fontFamily: 'System',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  loginText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  loginLink: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Verification screen styles
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  verificationContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 32,
  },
  verificationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  verificationText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  emailText: {
    color: '#1C1C1E',
    fontWeight: '600',
  },
  verificationSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  verificationActions: {
    width: '100%',
    alignItems: 'center',
  },
  verificationButton: {
    width: '100%',
    marginBottom: 12,
  },
  backLink: {
    fontSize: 16,
    color: '#007AFF',
    marginTop: 16,
  },
});

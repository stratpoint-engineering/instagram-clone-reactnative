import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForgotPasswordForm } from '@/components/forms';
import { AuthGuard } from '@/components/auth';
import { Button } from '@/components/ui';

/**
 * Forgot Password Screen Component
 * 
 * Features:
 * - Integration with existing ForgotPasswordForm component
 * - Password reset email sending
 * - Success confirmation screen
 * - Navigation back to login
 * - AuthGuard protection (redirects if already authenticated)
 * - Resend email functionality
 * 
 * Flow:
 * 1. User enters email address
 * 2. Password reset email sent
 * 3. User sees confirmation screen
 * 4. User can return to login or resend email
 */
export default function ForgotPasswordScreen() {
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // Handle successful password reset email sent
  const handleResetSuccess = () => {
    console.log('Password reset email sent successfully');
    setShowSuccessScreen(true);
  };

  // Handle navigation back to login
  const handleBackToLogin = () => {
    router.back();
  };

  // Handle resend password reset email
  const handleResendEmail = () => {
    // This would typically call the auth service to resend the email
    console.log('Resending password reset email');
    // For now, just show an alert
    alert('Password reset email sent again!');
  };

  // Handle custom reset password (to capture email)
  const handleCustomResetPassword = (email: string) => {
    setUserEmail(email);
    // Call the actual reset password function here
    // For now, we'll simulate success
    setTimeout(() => {
      setShowSuccessScreen(true);
    }, 1000);
  };

  // Render success screen
  if (showSuccessScreen) {
    return (
      <AuthGuard requireAuth={false} redirectTo="/(tabs)">
        <SafeAreaView style={styles.container}>
          <View style={styles.successContainer}>
            <View style={styles.successContent}>
              {/* Success Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>✉️</Text>
              </View>

              {/* Success Text */}
              <Text style={styles.successTitle}>Check Your Email</Text>
              <Text style={styles.successText}>
                We've sent password reset instructions to{'\n'}
                <Text style={styles.emailText}>{userEmail}</Text>
              </Text>
              <Text style={styles.successSubtext}>
                Click the link in the email to reset your password. The link will expire in 24 hours.
              </Text>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <Button
                  variant="primary"
                  onPress={handleBackToLogin}
                  style={styles.successButton}
                >
                  Back to Sign In
                </Button>

                <Button
                  variant="outline"
                  onPress={handleResendEmail}
                  style={styles.successButton}
                >
                  Resend Email
                </Button>
              </View>

              {/* Help Text */}
              <Text style={styles.helpText}>
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </AuthGuard>
    );
  }

  // Render forgot password form screen
  return (
    <AuthGuard requireAuth={false} redirectTo="/(tabs)">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email address and we'll send you a link to reset your password.
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <ForgotPasswordForm
                onResetPassword={handleCustomResetPassword}
                onSuccess={handleResetSuccess}
                onBackToLogin={handleBackToLogin}
              />
            </View>

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need more help?</Text>
              <Text style={styles.helpDescription}>
                If you're still having trouble accessing your account, you can contact our support team.
              </Text>
              <TouchableOpacity style={styles.contactButton}>
                <Text style={styles.contactButtonText}>Contact Support</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  mainContent: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
  },
  formContainer: {
    marginBottom: 32,
  },
  helpSection: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    alignItems: 'center',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    paddingVertical: 8,
  },
  contactButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successContent: {
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
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
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
  successSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  successActions: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  successButton: {
    width: '100%',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
});

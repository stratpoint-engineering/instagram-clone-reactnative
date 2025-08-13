import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSetupForm } from '@/components/forms';
import { AuthGuard } from '@/components/auth';

/**
 * Profile Setup Screen Component
 * 
 * Features:
 * - Integration with existing ProfileSetupForm component
 * - Initial profile creation after registration
 * - Skip option for later completion
 * - AuthGuard protection (requires authentication)
 * - Navigation to main app after completion
 * - Progress indication
 * 
 * Flow:
 * 1. User arrives after email verification or social login
 * 2. User fills out profile information (username, name, bio, etc.)
 * 3. Profile created in Supabase
 * 4. User redirected to main app
 * 5. Optional: User can skip and complete later
 */
export default function ProfileSetupScreen() {
  // Handle successful profile setup
  const handleProfileComplete = () => {
    console.log('Profile setup completed, navigating to main app');
    router.replace('/(tabs)');
  };

  // Handle skip profile setup
  const handleSkipProfile = () => {
    console.log('Profile setup skipped, navigating to main app');
    router.replace('/(tabs)');
  };

  return (
    <AuthGuard requireAuth={true} redirectTo="/auth/login">
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={styles.progressFill} />
              </View>
              <Text style={styles.progressText}>Step 2 of 2</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>Complete Your Profile</Text>
              <Text style={styles.subtitle}>
                Help others discover you by setting up your profile. You can always change this later.
              </Text>
            </View>

            {/* Form Container */}
            <View style={styles.formContainer}>
              <ProfileSetupForm
                onComplete={handleProfileComplete}
                onSkip={handleSkipProfile}
                allowSkip={true}
              />
            </View>

            {/* Skip Section */}
            <View style={styles.skipSection}>
              <Text style={styles.skipText}>
                Want to set this up later?
              </Text>
              <TouchableOpacity onPress={handleSkipProfile} style={styles.skipButton}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </Text>
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
  progressContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#E5E5EA',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    width: '100%', // 100% since this is the final step
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
  },
  titleSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    lineHeight: 22,
    textAlign: 'center',
    maxWidth: 300,
  },
  formContainer: {
    flex: 1,
  },
  skipSection: {
    alignItems: 'center',
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  skipText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 12,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
});

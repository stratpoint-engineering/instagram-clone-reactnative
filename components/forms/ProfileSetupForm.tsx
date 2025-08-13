import React, { useState } from 'react';
import { View, StyleSheet, Text, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/hooks';
import { useAuthActions } from '@/store';
import { supabase } from '@/lib/supabase';
import { Button, Input } from '@/components/ui';

interface ProfileSetupFormProps {
  onComplete?: () => void;
  onSkip?: () => void;
  allowSkip?: boolean;
}

interface ProfileData {
  username: string;
  fullName: string;
  bio: string;
  website: string;
  avatar?: string;
}

interface FormErrors {
  username?: string;
  fullName?: string;
  bio?: string;
  website?: string;
  avatar?: string;
  general?: string;
}

/**
 * ProfileSetupForm component for initial user profile creation
 *
 * Features:
 * - Username availability checking
 * - Profile data collection (name, bio, website)
 * - Avatar upload (placeholder for now)
 * - Form validation
 * - Integration with Supabase profiles table
 * - Skip option for later completion
 *
 * Usage:
 * <ProfileSetupForm onComplete={() => router.push('/(tabs)')} />
 */
export function ProfileSetupForm({ onComplete, onSkip, allowSkip = true }: ProfileSetupFormProps) {
  const { user, refreshUser } = useAuth();
  const { setOnboardingComplete, updateProfile } = useAuthActions();

  const [profileData, setProfileData] = useState<ProfileData>({
    username: '',
    fullName: user?.user_metadata?.full_name || '',
    bio: '',
    website: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Update form field
  const updateField = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Clear general error
    if (errors.general) {
      setErrors(prev => ({ ...prev, general: undefined }));
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    if (!username || username.length < 3) return false;

    try {
      setIsCheckingUsername(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which means username is available
        console.error('Error checking username:', error);
        return false;
      }

      return !data; // If no data found, username is available
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Validate form
  const validateForm = async (): Promise<boolean> => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!profileData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(profileData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    } else {
      // Check availability
      const isAvailable = await checkUsernameAvailability(profileData.username);
      if (!isAvailable) {
        newErrors.username = 'Username is already taken';
      }
    }

    // Full name validation
    if (!profileData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (profileData.fullName.length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Bio validation (optional but with limits)
    if (profileData.bio && profileData.bio.length > 150) {
      newErrors.bio = 'Bio must be 150 characters or less';
    }

    // Website validation (optional but must be valid URL if provided)
    if (profileData.website) {
      const urlPattern = /^https?:\/\/.+\..+/;
      if (!urlPattern.test(profileData.website)) {
        newErrors.website = 'Please enter a valid website URL (including http:// or https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user) {
      setErrors({ general: 'User not found. Please try logging in again.' });
      return;
    }

    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      // Create/update profile in Supabase
      const profilePayload = {
        id: user.id,
        username: profileData.username.toLowerCase(),
        full_name: profileData.fullName,
        bio: profileData.bio || null,
        website: profileData.website || null,
        avatar_url: profileData.avatar || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profilePayload)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        setErrors({ general: 'Failed to create profile. Please try again.' });
        return;
      }

      // Update local state
      updateProfile(data);
      setOnboardingComplete(true);

      // Refresh user data
      await refreshUser();

      Alert.alert(
        'Profile Created!',
        'Your profile has been set up successfully.',
        [{ text: 'OK', onPress: onComplete }]
      );

      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Profile setup error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle skip
  const handleSkip = () => {
    setOnboardingComplete(true);
    if (onSkip) {
      onSkip();
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <Text style={styles.title}>Set Up Your Profile</Text>
        <Text style={styles.subtitle}>
          Tell us a bit about yourself to personalize your experience
        </Text>

        {/* General Error */}
        {errors.general && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.general}</Text>
          </View>
        )}

        {/* Avatar Upload Placeholder */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity style={styles.avatarPlaceholder}>
            <Text style={styles.avatarIcon}>📷</Text>
            <Text style={styles.avatarText}>Add Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={profileData.fullName}
          onChangeText={(value) => updateField('fullName', value)}
          error={errors.fullName}
          autoCapitalize="words"
          autoComplete="name"
        />

        {/* Username */}
        <View>
          <Input
            label="Username"
            placeholder="Choose a unique username"
            value={profileData.username}
            onChangeText={(value) => updateField('username', value.toLowerCase())}
            error={errors.username}
            autoCapitalize="none"
            autoComplete="username"
            rightIcon={isCheckingUsername ? 'loading' : undefined}
          />
          <Text style={styles.usernameHint}>
            This will be your unique identifier on the platform
          </Text>
        </View>

        {/* Bio */}
        <View>
          <Input
            label="Bio (Optional)"
            placeholder="Tell us about yourself..."
            value={profileData.bio}
            onChangeText={(value) => updateField('bio', value)}
            error={errors.bio}
            multiline
            numberOfLines={3}
            maxLength={150}
          />
          <Text style={styles.characterCount}>
            {profileData.bio.length}/150 characters
          </Text>
        </View>

        {/* Website */}
        <Input
          label="Website (Optional)"
          placeholder="https://yourwebsite.com"
          value={profileData.website}
          onChangeText={(value) => updateField('website', value)}
          error={errors.website}
          keyboardType="url"
          autoCapitalize="none"
          autoComplete="url"
        />

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={isLoading || isCheckingUsername}
          style={styles.submitButton}
        >
          {isLoading ? 'Creating Profile...' : 'Complete Setup'}
        </Button>

        {/* Skip Button */}
        {allowSkip && (
          <Button
            variant="link"
            onPress={handleSkip}
            style={styles.skipButton}
          >
            Skip for now
          </Button>
        )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  avatarText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  usernameHint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  characterCount: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'right',
    marginTop: 4,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  skipButton: {
    paddingHorizontal: 0,
  },
});

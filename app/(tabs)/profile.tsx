import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Grid, UserCheck, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';

import LinearGradient from '@/components/LinearGradient';

import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const { width } = Dimensions.get('window');
const imageSize = (width - 6) / 3;

export default function ProfileScreen() {
  const { user, posts, isFollowing, toggleFollow, isLoading, error, isOwnProfile } = useProfile();
  const { logout } = useAuth();

  console.log('ProfileScreen render - isOwnProfile:', isOwnProfile, 'user:', user?.username);

  // Handle logout
  const handleLogout = async () => {
    console.log('handleLogout called');

    const performLogout = async () => {
      console.log('Sign Out confirmed');
      try {
        console.log('Calling logout...');
        const result = await logout();
        console.log('Logout result:', result);
        console.log('Navigating to login...');
        router.replace('/auth/login');
      } catch (error) {
        console.error('Logout error:', error);
        if (Platform.OS === 'web') {
          alert('Failed to sign out. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to sign out. Please try again.');
        }
      }
    };

    // Use different confirmation methods for web vs mobile
    if (Platform.OS === 'web') {
      const confirmed = confirm('Are you sure you want to sign out?');
      if (confirmed) {
        await performLogout();
      } else {
        console.log('Logout cancelled');
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign Out',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show error state
  if (error || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Failed to load profile'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.username}>{user.username}</Text>
        {isOwnProfile ? (
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <LogOut size={24} color="#000" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity>
            <Settings size={24} color="#000" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <LinearGradient
                colors={['#833ab4', '#fd1d1d', '#fcb045']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.avatarGradient}
              >
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              </LinearGradient>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{user.postsCount}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{user.followersCount}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{user.followingCount}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user.displayName}</Text>
            <Text style={styles.bio}>{user.bio}</Text>
            {user.website && (
              <Text style={styles.website}>{user.website}</Text>
            )}
          </View>

          <View style={styles.actionButtons}>
            {isOwnProfile ? (
              <>
                <TouchableOpacity style={styles.editProfileButton}>
                  <Text style={styles.editProfileButtonText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareProfileButton}>
                  <Text style={styles.shareProfileButtonText}>Share Profile</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={toggleFollow}>
                  <LinearGradient
                    colors={isFollowing ? ['#f5f5f5', '#f5f5f5'] : ['#833ab4', '#fd1d1d', '#fcb045']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.followButton}
                  >
                    <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                      {isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tab}>
            <Grid size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <UserCheck size={24} color="#8e8e8e" />
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsGrid}>
          {posts.map((post) => (
            <TouchableOpacity key={post.id} style={styles.gridItem}>
              <Image
                source={{ uri: post.image }}
                style={styles.gridImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  username: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatarGradient: {
    width: 90,
    height: 90,
    borderRadius: 45,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
  },
  statLabel: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 2,
  },
  profileInfo: {
    marginBottom: 16,
  },
  displayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
    marginBottom: 4,
  },
  website: {
    fontSize: 14,
    color: '#0095f6',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  followButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#ffffff',
  },
  followingButtonText: {
    color: '#000000',
  },
  messageButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  postsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
    padding: 2,
  },
  gridItem: {
    width: imageSize,
    height: imageSize,
  },
  gridImage: {
    width: '100%',
    height: '100%',
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#8e8e8e',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 4,
  },
  editProfileButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
  },
  editProfileButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  shareProfileButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  shareProfileButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
});

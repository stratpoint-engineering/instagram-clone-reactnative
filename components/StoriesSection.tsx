import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { Plus } from 'lucide-react-native';

import LinearGradient from '@/components/LinearGradient';

interface Story {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  hasViewed: boolean;
}

interface StoriesSectionProps {
  stories: Story[];
}

export default function StoriesSection({ stories }: StoriesSectionProps) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Your Story */}
        <TouchableOpacity style={styles.storyItem}>
          <View style={styles.yourStoryContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face' }}
              style={styles.yourStoryAvatar}
            />
            <View style={styles.addStoryIcon}>
              <Plus size={16} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.storyUsername}>Your Story</Text>
        </TouchableOpacity>

        {/* Other Stories */}
        {stories.map((story) => (
          <TouchableOpacity key={story.id} style={styles.storyItem}>
            <LinearGradient
              colors={story.hasViewed ? ['#c7c7c7', '#c7c7c7'] : ['#833ab4', '#fd1d1d', '#fcb045']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.storyGradient}
            >
              <Image source={{ uri: story.user.avatar }} style={styles.storyAvatar} />
            </LinearGradient>
            <Text style={styles.storyUsername} numberOfLines={1}>
              {story.user.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 70,
  },
  yourStoryContainer: {
    position: 'relative',
  },
  yourStoryAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e1e1e1',
  },
  addStoryIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0095f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyGradient: {
    width: 68,
    height: 68,
    borderRadius: 34,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storyAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  storyUsername: {
    fontSize: 12,
    color: '#000000',
    marginTop: 4,
    textAlign: 'center',
  },
});

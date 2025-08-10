import React from 'react';
import { ScrollView, StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useActivity } from '@/hooks/useActivity';

export default function ActivityScreen() {
  const { activities } = useActivity();

  const renderActivity = (activity: any) => {
    return (
      <TouchableOpacity key={activity.id} style={styles.activityItem}>
        <Image source={{ uri: activity.user.avatar }} style={styles.avatar} />
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>
            <Text style={styles.username}>{activity.user.username}</Text>
            {' '}
            {activity.type === 'like' && 'liked your photo.'}
            {activity.type === 'comment' && `commented: "${activity.comment}"`}
            {activity.type === 'follow' && 'started following you.'}
          </Text>
          <Text style={styles.timestamp}>{activity.timestamp}</Text>
        </View>
        {activity.post && (
          <Image source={{ uri: activity.post.image }} style={styles.postThumbnail} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Activity</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          {activities.today.map(renderActivity)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          {activities.thisWeek.map(renderActivity)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>
          {activities.thisMonth.map(renderActivity)}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#000000',
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  username: {
    fontWeight: '600' as const,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
    marginTop: 2,
  },
  postThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 4,
  },
});

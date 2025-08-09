import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Post {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  image: string;
  caption: string;
  likes: number;
  comments: number;
  timestamp: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
          <Text style={styles.username}>{post.user.username}</Text>
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} contentFit="cover" />

      {/* Actions */}
      <View style={styles.actions}>
        <View style={styles.leftActions}>
          <TouchableOpacity onPress={() => setIsLiked(!isLiked)} style={styles.actionButton}>
            <Heart size={24} color={isLiked ? "#ed4956" : "#000"} fill={isLiked ? "#ed4956" : "none"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <MessageCircle size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Send size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setIsSaved(!isSaved)}>
          <Bookmark size={24} color="#000" fill={isSaved ? "#000" : "none"} />
        </TouchableOpacity>
      </View>

      {/* Likes */}
      <View style={styles.content}>
        <Text style={styles.likes}>{post.likes + (isLiked ? 1 : 0)} likes</Text>

        {/* Caption */}
        <View style={styles.captionContainer}>
          <Text style={styles.caption}>
            <Text style={styles.username}>{post.user.username}</Text> {post.caption}
          </Text>
        </View>

        {/* Comments */}
        {post.comments > 0 && (
          <TouchableOpacity>
            <Text style={styles.viewComments}>View all {post.comments} comments</Text>
          </TouchableOpacity>
        )}

        {/* Timestamp */}
        <Text style={styles.timestamp}>{post.timestamp}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
  },
  postImage: {
    width: width,
    height: width,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginRight: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  likes: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#000000',
    marginBottom: 4,
  },
  captionContainer: {
    marginBottom: 4,
  },
  caption: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18,
  },
  viewComments: {
    fontSize: 14,
    color: '#8e8e8e',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#8e8e8e',
    textTransform: 'uppercase',
  },
});
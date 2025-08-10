import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon } from 'lucide-react-native';

import ImagePicker from '@/components/ImagePicker';
import LinearGradient from '@/components/LinearGradient';

export default function CameraScreen() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const sharePost = () => {
    if (selectedImage) {
      Alert.alert('Success!', 'Your post has been shared!');
      setSelectedImage(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Post</Text>
      </View>

      <View style={styles.content}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} resizeMode="cover" />
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => setSelectedImage(null)}>
                <Text style={styles.actionButtonText}>Choose Different</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={sharePost}>
                <LinearGradient
                  colors={['#833ab4', '#fd1d1d', '#fcb045']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.shareButton}
                >
                  <Text style={styles.shareButtonText}>Share</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.cameraOptions}>
              <TouchableOpacity style={styles.cameraOption} onPress={takePhoto}>
                <View style={styles.cameraOptionIcon}>
                  <Camera size={32} color="#ffffff" />
                </View>
                <Text style={styles.cameraOptionText}>Take Photo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cameraOption} onPress={pickImage}>
                <View style={styles.cameraOptionIcon}>
                  <ImageIcon size={32} color="#ffffff" />
                </View>
                <Text style={styles.cameraOptionText}>Choose from Library</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    width: '100%',
  },
  selectedImage: {
    width: 300,
    height: 300,
    borderRadius: 12,
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500' as const,
  },
  shareButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  shareButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600' as const,
  },
  emptyState: {
    alignItems: 'center',
  },
  cameraOptions: {
    gap: 24,
  },
  cameraOption: {
    alignItems: 'center',
    gap: 12,
  },
  cameraOptionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraOptionText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500' as const,
  },
});

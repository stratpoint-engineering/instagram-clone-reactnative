import React, { useRef } from 'react';
import { Platform, Alert } from 'react-native';

export interface ImagePickerResult {
  canceled: boolean;
  assets?: Array<{
    uri: string;
    width: number;
    height: number;
    type?: string;
  }>;
}

export interface ImagePickerOptions {
  mediaTypes?: 'Images' | 'Videos' | 'All';
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}

/**
 * Custom ImagePicker component that works across platforms
 * - Web: Uses HTML5 File API
 * - Native: Shows placeholder alert (would need native module in production)
 */
export class ImagePicker {
  static async launchImageLibraryAsync(
    options: ImagePickerOptions = {}
  ): Promise<ImagePickerResult> {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                resolve({
                  canceled: false,
                  assets: [
                    {
                      uri: e.target?.result as string,
                      width: img.width,
                      height: img.height,
                      type: file.type,
                    },
                  ],
                });
              };
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
          } else {
            resolve({ canceled: true });
          }
        };

        input.oncancel = () => {
          resolve({ canceled: true });
        };

        input.click();
      });
    }

    // Native placeholder - in production, you'd use react-native-image-picker
    Alert.alert(
      'Image Picker',
      'Image picker functionality requires native modules. In production, use react-native-image-picker.',
      [{ text: 'OK' }]
    );

    return { canceled: true };
  }

  static async launchCameraAsync(
    options: ImagePickerOptions = {}
  ): Promise<ImagePickerResult> {
    if (Platform.OS === 'web') {
      return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment'; // Use rear camera

        input.onchange = (event) => {
          const file = (event.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              const img = new Image();
              img.onload = () => {
                resolve({
                  canceled: false,
                  assets: [
                    {
                      uri: e.target?.result as string,
                      width: img.width,
                      height: img.height,
                      type: file.type,
                    },
                  ],
                });
              };
              img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
          } else {
            resolve({ canceled: true });
          }
        };

        input.oncancel = () => {
          resolve({ canceled: true });
        };

        input.click();
      });
    }

    // Native placeholder
    Alert.alert(
      'Camera',
      'Camera functionality requires native modules. In production, use react-native-image-picker.',
      [{ text: 'OK' }]
    );

    return { canceled: true };
  }
}

export default ImagePicker;

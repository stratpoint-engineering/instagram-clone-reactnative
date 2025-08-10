import React from 'react';
import { View, ViewStyle, Platform } from 'react-native';

interface LinearGradientProps {
  colors: string[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  style?: ViewStyle;
  children?: React.ReactNode;
}

/**
 * Custom LinearGradient component that works across platforms
 * - Web: Uses CSS linear-gradient
 * - Native: Falls back to solid background color (first color)
 */
export function LinearGradient({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  style,
  children,
}: LinearGradientProps) {
  if (Platform.OS === 'web') {
    // Calculate angle from start/end points
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);
    
    const webStyle: ViewStyle = {
      ...style,
      // @ts-ignore - Web-specific CSS property
      background: `linear-gradient(${angle}deg, ${colors.join(', ')})`,
    };

    return <View style={webStyle}>{children}</View>;
  }

  // Native fallback: use first color as solid background
  const nativeStyle: ViewStyle = {
    ...style,
    backgroundColor: colors[0],
  };

  return <View style={nativeStyle}>{children}</View>;
}

export default LinearGradient;

import React from 'react';
import { View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
}

/**
 * Reusable Card component following Phase 1 flat structure
 * Located in: components/ui/Card.tsx
 * 
 * Usage:
 * import { Card } from '@/components/ui';
 * <Card variant="elevated">
 *   <Text>Card content</Text>
 * </Card>
 */
export function Card({ 
  children, 
  style, 
  variant = 'default' 
}: CardProps) {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: 16,
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {},
      elevated: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        borderWidth: 1,
        borderColor: '#E5E5EA',
      },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...style,
    };
  };

  return (
    <View style={getCardStyle()}>
      {children}
    </View>
  );
}

export default Card;

import React from 'react';
import { Pressable, Text, PressableProps, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/**
 * Reusable Button component following Phase 1 flat structure
 * Located in: components/ui/Button.tsx
 *
 * Usage:
 * import { Button } from '@/components/ui';
 * <Button variant="primary" size="md" onPress={handlePress}>Click me</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  textStyle,
  disabled,
  ...props
}: ButtonProps) {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 12, paddingVertical: 8, minHeight: 36 },
      md: { paddingHorizontal: 16, paddingVertical: 12, minHeight: 44 },
      lg: { paddingHorizontal: 20, paddingVertical: 16, minHeight: 52 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: { backgroundColor: '#007AFF' },
      secondary: { backgroundColor: '#8E8E93' },
      outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#007AFF' },
      ghost: { backgroundColor: 'transparent' },
      link: { backgroundColor: 'transparent', paddingHorizontal: 0, paddingVertical: 0, minHeight: 'auto' as any },
    };

    // Disabled styles
    const disabledStyle: ViewStyle = disabled
      ? { opacity: 0.5 }
      : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    // Size text styles
    const sizeTextStyles: Record<string, TextStyle> = {
      sm: { fontSize: 14 },
      md: { fontSize: 16 },
      lg: { fontSize: 18 },
    };

    // Variant text styles
    const variantTextStyles: Record<string, TextStyle> = {
      primary: { color: '#FFFFFF' },
      secondary: { color: '#FFFFFF' },
      outline: { color: '#007AFF' },
      ghost: { color: '#007AFF' },
      link: { color: '#007AFF', textDecorationLine: 'underline' },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
      ...textStyle,
    };
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getButtonStyle(),
        pressed && { opacity: 0.8 },
      ]}
      disabled={disabled}
      {...props}
    >
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </Pressable>
  );
}

export default Button;

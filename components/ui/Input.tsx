import React, { forwardRef } from 'react';
import { TextInput, TextInputProps, View, Text, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  rightIcon?: string;
  onRightIconPress?: () => void;
}

/**
 * Reusable Input component following Phase 1 flat structure
 * Located in: components/ui/Input.tsx
 *
 * Usage:
 * import { Input } from '@/components/ui';
 * <Input label="Email" placeholder="Enter your email" error={errors.email} />
 */
export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  style,
  containerStyle,
  labelStyle,
  errorStyle,
  rightIcon,
  onRightIconPress,
  ...props
}, ref) => {
  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      borderWidth: 1,
      borderColor: error ? '#FF3B30' : '#E5E5EA',
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#FFFFFF',
      minHeight: 44,
    };

    return {
      ...baseStyle,
      ...(style as TextStyle),
    };
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 14,
      fontWeight: '500',
      color: '#1C1C1E',
      marginBottom: 8,
    };

    return {
      ...baseStyle,
      ...labelStyle,
    };
  };

  const getErrorStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 12,
      color: '#FF3B30',
      marginTop: 4,
    };

    return {
      ...baseStyle,
      ...errorStyle,
    };
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: 16,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
        </Text>
      )}
      <View style={{ position: 'relative' }}>
        <TextInput
          ref={ref}
          style={[getInputStyle(), rightIcon && { paddingRight: 50 }]}
          placeholderTextColor="#8E8E93"
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={{
              position: 'absolute',
              right: 16,
              top: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'center',
              width: 24,
            }}
          >
            <Text style={{ fontSize: 16, color: '#8E8E93' }}>
              {rightIcon === 'eye' ? '👁️' : rightIcon === 'eye-off' ? '🙈' : rightIcon === 'loading' ? '⏳' : rightIcon}
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={getErrorStyle()}>
          {error}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;

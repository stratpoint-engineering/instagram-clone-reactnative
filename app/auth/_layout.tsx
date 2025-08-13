import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';

/**
 * Authentication Layout Component
 * 
 * This layout wraps all authentication-related screens and provides:
 * - Consistent navigation structure for auth flow
 * - Proper screen transitions
 * - Status bar configuration
 * - Common styling for auth screens
 * 
 * Screens included:
 * - login: User login screen
 * - signup: User registration screen  
 * - forgot-password: Password reset screen
 * - profile-setup: Initial profile creation screen
 */
export default function AuthLayout() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: styles.screenContent,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* Login Screen */}
        <Stack.Screen 
          name="login" 
          options={{
            title: 'Sign In',
            gestureEnabled: false, // Disable swipe back on login
          }}
        />
        
        {/* Sign Up Screen */}
        <Stack.Screen 
          name="signup" 
          options={{
            title: 'Create Account',
            animation: 'slide_from_right',
          }}
        />
        
        {/* Forgot Password Screen */}
        <Stack.Screen 
          name="forgot-password" 
          options={{
            title: 'Reset Password',
            animation: 'slide_from_bottom',
            presentation: 'modal',
          }}
        />
        
        {/* Profile Setup Screen */}
        <Stack.Screen 
          name="profile-setup" 
          options={{
            title: 'Complete Profile',
            gestureEnabled: false, // Prevent going back during profile setup
            animation: 'fade',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContent: {
    backgroundColor: '#ffffff',
  },
});

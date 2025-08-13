// Jest setup file for React Native testing
// Note: @testing-library/react-native/extend-expect is not needed for basic unit tests

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      EXPO_PUBLIC_SUPABASE_KEY: 'test-key',
    },
  },
}));

// Mock environment variables
process.env.EXPO_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.EXPO_PUBLIC_SUPABASE_KEY = 'test-key';

// Note: Supabase mocking is handled in individual test files

// Mock base64-arraybuffer
jest.mock('base64-arraybuffer', () => ({
  decode: jest.fn((str) => new ArrayBuffer(8)),
}));

// Global test utilities
global.console = {
  ...console,
  // Suppress console.error in tests unless explicitly needed
  error: jest.fn(),
  warn: jest.fn(),
};

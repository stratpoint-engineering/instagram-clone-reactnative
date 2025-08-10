/**
 * Color Constants - Phase 1 Flat Structure
 * Located in: lib/constants/colors.ts
 * 
 * Demonstrates:
 * - Centralized color definitions
 * - Design system organization
 * - TypeScript const assertions for type safety
 * 
 * Usage:
 * import { colors } from '@/lib/constants';
 * backgroundColor: colors.primary.main
 */

export const colors = {
  // Primary brand colors
  primary: {
    main: '#007AFF',
    light: '#5AC8FA',
    dark: '#0051D5',
    contrast: '#FFFFFF',
  },

  // Secondary colors
  secondary: {
    main: '#8E8E93',
    light: '#C7C7CC',
    dark: '#636366',
    contrast: '#FFFFFF',
  },

  // Semantic colors
  success: {
    main: '#34C759',
    light: '#30D158',
    dark: '#248A3D',
    contrast: '#FFFFFF',
  },

  warning: {
    main: '#FF9500',
    light: '#FF9F0A',
    dark: '#D2720A',
    contrast: '#FFFFFF',
  },

  error: {
    main: '#FF3B30',
    light: '#FF453A',
    dark: '#D70015',
    contrast: '#FFFFFF',
  },

  // Neutral colors
  neutral: {
    white: '#FFFFFF',
    black: '#000000',
    gray: {
      50: '#F9F9F9',
      100: '#F2F2F7',
      200: '#E5E5EA',
      300: '#D1D1D6',
      400: '#C7C7CC',
      500: '#AEAEB2',
      600: '#8E8E93',
      700: '#636366',
      800: '#48484A',
      900: '#1C1C1E',
    },
  },

  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#F9F9F9',
    inverse: '#1C1C1E',
  },

  // Text colors
  text: {
    primary: '#1C1C1E',
    secondary: '#8E8E93',
    tertiary: '#C7C7CC',
    inverse: '#FFFFFF',
    link: '#007AFF',
  },

  // Border colors
  border: {
    light: '#E5E5EA',
    medium: '#D1D1D6',
    dark: '#C7C7CC',
  },

  // Instagram-specific colors (for this demo app)
  instagram: {
    gradient: {
      start: '#833ab4',
      middle: '#fd1d1d',
      end: '#fcb045',
    },
    blue: '#1877f2',
    lightGray: '#fafafa',
    darkGray: '#262626',
  },
} as const;

export default colors;

/**
 * Hooks Index - Phase 1 Flat Structure
 *
 * This file exports all custom hooks for easy importing.
 * Following Phase 1 pattern: hooks/
 *
 * Usage:
 * import { useApi, useLocalStorage, useFeed } from '@/hooks';
 */

// New Phase 1 demonstration hooks
export { useApi } from './useApi';
export { useLocalStorage } from './useLocalStorage';
export { useAuth } from './useAuth';

// Existing app-specific hooks
export { useActivity } from './useActivity';
export { useFeed } from './useFeed';
export { useProfile } from './useProfile';
export { useSearch } from './useSearch';

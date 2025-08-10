/**
 * Components Index - Phase 1 Flat Structure
 * 
 * This file exports all components for easy importing.
 * Following Phase 1 pattern with organized subdirectories.
 * 
 * Usage:
 * import { Button, PostCard, LoginForm } from '@/components';
 * // or specific categories:
 * import { Button, Input, Card } from '@/components/ui';
 * import { PostCard, StoriesSection } from '@/components/social';
 * import { LoginForm } from '@/components/forms';
 */

// UI Components (reusable across app)
export * from './ui';

// Social Components (Instagram-specific)
export * from './social';

// Form Components
export * from './forms';

// Hybrid Components (custom implementations)
export { default as LinearGradient } from './LinearGradient';
export { default as ImagePicker } from './ImagePicker';

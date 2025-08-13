/**
 * Forms Components Index - Phase 1 Flat Structure
 *
 * This file exports all form components for easy importing.
 * Following Phase 1 pattern: components/forms/
 *
 * Usage:
 * import { LoginForm, SignUpForm } from '@/components/forms';
 */

export { LoginForm } from './LoginForm';
export { SignUpForm } from './SignUpForm';
export { ForgotPasswordForm } from './ForgotPasswordForm';
export { ProfileSetupForm } from './ProfileSetupForm';

// Re-export default for convenience
export { default as LoginFormDefault } from './LoginForm';

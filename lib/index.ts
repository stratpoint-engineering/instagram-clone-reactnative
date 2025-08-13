// Export Supabase client and utilities
export { supabase, getCurrentUser, getCurrentSession, signOut, isAuthenticated } from './supabase';
export type { User, Session, AuthError } from './supabase';

// Export database types
export * from './database';

// Export storage utilities
export * from './storage';

// Export API utilities
export * from './api';

// Export constants
export * from './constants';

// Export utilities
export * from './utils';

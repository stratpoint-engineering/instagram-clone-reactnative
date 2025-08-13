import { Redirect } from 'expo-router';

/**
 * Auth Index Route
 * 
 * This file handles the default route for the auth directory.
 * When users navigate to /auth, they are automatically redirected to the login screen.
 * 
 * This ensures there's always a valid route when accessing the auth section.
 */
export default function AuthIndex() {
  return <Redirect href="/auth/login" />;
}

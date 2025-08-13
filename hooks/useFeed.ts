import { usePosts } from './usePosts';

/**
 * Legacy useFeed hook - now delegates to usePosts
 *
 * This hook is maintained for backward compatibility.
 * New code should use usePosts directly for better functionality.
 *
 * @deprecated Use usePosts instead for enhanced functionality
 */
export function useFeed() {
  const { posts, stories, isLoading, error } = usePosts();

  return {
    posts,
    stories,
    isLoading,
    error
  };
}

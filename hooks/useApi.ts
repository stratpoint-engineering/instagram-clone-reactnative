import { useState, useEffect, useCallback, useRef } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

/**
 * Custom hook for API calls following Phase 1 flat structure
 * Located in: hooks/useApi.ts
 *
 * Demonstrates:
 * - Generic API hook pattern
 * - Loading and error state management
 * - Callback options for side effects
 * - Manual and automatic execution
 *
 * Usage:
 * import { useApi } from '@/hooks';
 * const { data, isLoading, error, execute } = useApi<User[]>('/api/users');
 */
export function useApi<T = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const { immediate = true, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async (customUrl?: string) => {
    const requestUrl = customUrl || url;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Simulate API call - in real app, use fetch or axios
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock data based on URL
      let mockData: any = null;

      if (requestUrl.includes('/users')) {
        mockData = [
          { id: 1, name: 'John Doe', email: 'john@example.com' },
          { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
        ];
      } else if (requestUrl.includes('/posts')) {
        mockData = [
          { id: 1, title: 'First Post', content: 'Hello World' },
          { id: 2, title: 'Second Post', content: 'React Native is awesome' },
        ];
      } else {
        mockData = { message: 'API response', url: requestUrl };
      }

      setState({
        data: mockData,
        isLoading: false,
        error: null,
      });

      if (onSuccess) {
        onSuccess(mockData);
      }

      return mockData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
      });

      if (onError) {
        onError(errorMessage);
      }

      throw err;
    }
  }, [url, onSuccess, onError]);

  // Execute immediately if requested - use a ref to track if we've already executed
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (immediate && !hasExecutedRef.current) {
      hasExecutedRef.current = true;
      execute();
    }
  }, [immediate]); // Remove execute from dependencies to prevent infinite loop

  return {
    ...state,
    execute,
    refetch: () => execute(),
  };
}

export default useApi;

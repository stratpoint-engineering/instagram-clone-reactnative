import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom hook for local storage following Phase 1 flat structure
 * Located in: hooks/useLocalStorage.ts
 * 
 * Demonstrates:
 * - Custom hook organization in flat structure
 * - Async storage abstraction
 * - TypeScript generics for type safety
 * - Error handling patterns
 * 
 * Usage:
 * import { useLocalStorage } from '@/hooks';
 * const [user, setUser] = useLocalStorage<User>('user', null);
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => Promise<void>, boolean, string | null] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial value from storage
  useEffect(() => {
    const loadStoredValue = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const item = await AsyncStorage.getItem(key);
        if (item !== null) {
          const parsedItem = JSON.parse(item);
          setStoredValue(parsedItem);
        }
      } catch (err) {
        console.error(`Error loading ${key} from storage:`, err);
        setError(`Failed to load ${key} from storage`);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredValue();
  }, [key]);

  // Function to update both state and storage
  const setValue = async (value: T) => {
    try {
      setError(null);
      
      // Update state immediately for optimistic updates
      setStoredValue(value);
      
      // Save to storage
      if (value === null || value === undefined) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
    } catch (err) {
      console.error(`Error saving ${key} to storage:`, err);
      setError(`Failed to save ${key} to storage`);
      
      // Revert state on error
      const item = await AsyncStorage.getItem(key);
      if (item !== null) {
        const parsedItem = JSON.parse(item);
        setStoredValue(parsedItem);
      } else {
        setStoredValue(initialValue);
      }
    }
  };

  return [storedValue, setValue, isLoading, error];
}

export default useLocalStorage;

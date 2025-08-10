/**
 * API Client - Phase 1 Flat Structure
 * Located in: lib/api/client.ts
 * 
 * Demonstrates:
 * - Centralized API configuration
 * - Request/response interceptors
 * - Error handling patterns
 * - TypeScript interfaces for API responses
 * 
 * Usage:
 * import { apiClient } from '@/lib/api';
 * const users = await apiClient.get<User[]>('/users');
 */

interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    this.timeout = 10000; // 10 seconds
  }

  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  removeAuthToken() {
    delete this.defaultHeaders.Authorization;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const { headers = {}, timeout = this.timeout, ...fetchOptions } = options;

    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...this.defaultHeaders,
        ...headers,
      },
    };

    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      );

      // Make the request with timeout
      const response = await Promise.race([
        fetch(url, config),
        timeoutPromise,
      ]);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', ...config });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', ...config });
  }
}

// Create and export the default API client instance
export const apiClient = new ApiClient(
  process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.example.com'
);

export default apiClient;

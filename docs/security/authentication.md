# Authentication

Comprehensive guide to implementing secure authentication in React Native applications with modern patterns and best practices.

## Authentication Flow Overview

```mermaid
    sequenceDiagram
    participant U as User
    participant A as App
    participant AS as Auth Service
    participant API as API Server
    participant S as Secure Storage

    U->>A: Enter credentials
    A->>AS: Login request
    AS->>API: Authenticate
    API->>AS: Return tokens
    AS->>S: Store tokens securely
    AS->>A: Authentication success
    A->>U: Navigate to app

    Note over A,API: Subsequent API calls
    A->>API: Request with access token
    alt Token valid
        API->>A: Return data
    else Token expired
        API->>A: 401 Unauthorized
        A->>AS: Refresh token
        AS->>API: Refresh request
        API->>AS: New tokens
        AS->>S: Update stored tokens
        AS->>A: Retry original request
    end
```

## Token-Based Authentication

### JWT Token Management

```typescript
// types/auth.ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

// lib/auth/tokenManager.ts
import { jwtDecode } from 'jwt-decode';
import { secureStorage } from './secureStorage';

interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iat: number;
}

class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly EXPIRES_AT_KEY = 'expires_at';

  async setTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      secureStorage.setItem(TokenManager.ACCESS_TOKEN_KEY, tokens.accessToken),
      secureStorage.setItem(TokenManager.REFRESH_TOKEN_KEY, tokens.refreshToken),
      secureStorage.setItem(TokenManager.EXPIRES_AT_KEY, tokens.expiresAt.toString()),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return secureStorage.getItem(TokenManager.ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return secureStorage.getItem(TokenManager.REFRESH_TOKEN_KEY);
  }

  async getExpiresAt(): Promise<number | null> {
    const expiresAt = await secureStorage.getItem(TokenManager.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  async isTokenValid(): Promise<boolean> {
    const token = await this.getAccessToken();
    const expiresAt = await this.getExpiresAt();

    if (!token || !expiresAt) {
      return false;
    }

    // Check if token expires in the next 5 minutes
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return expiresAt > fiveMinutesFromNow;
  }

  async getUserFromToken(): Promise<User | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    try {
      const payload = jwtDecode<JWTPayload>(token);
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        roles: payload.roles,
        permissions: payload.permissions,
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(TokenManager.ACCESS_TOKEN_KEY),
      secureStorage.removeItem(TokenManager.REFRESH_TOKEN_KEY),
      secureStorage.removeItem(TokenManager.EXPIRES_AT_KEY),
    ]);
  }
}

export const tokenManager = new TokenManager();
```

### Secure Storage Implementation

```typescript
// lib/auth/secureStorage.ts
import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

interface SecureStorageOptions {
  service?: string;
  accessGroup?: string;
}

class SecureStorage {
  private service: string;
  private accessGroup?: string;

  constructor(options: SecureStorageOptions = {}) {
    this.service = options.service || 'MyAppAuth';
    this.accessGroup = options.accessGroup;
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await Keychain.setInternetCredentials(key, key, value, {
        service: this.service,
        accessGroup: this.accessGroup,
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
        authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
      });
    } catch (error) {
      console.error('Failed to store secure item:', error);
      throw new Error('Failed to store secure data');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(key, {
        service: this.service,
        accessGroup: this.accessGroup,
        authenticationType: Keychain.AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
      });

      if (credentials && credentials.password) {
        return credentials.password;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(key, {
        service: this.service,
      });
    } catch (error) {
      console.error('Failed to remove secure item:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({
        service: this.service,
      });
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
    }
  }

  async getSupportedBiometryType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      return null;
    }
  }
}

export const secureStorage = new SecureStorage();
```

## Authentication Service

### Auth Service Implementation

```typescript
// services/authService.ts
import { apiClient } from '../lib/api';
import { tokenManager } from '../lib/auth/tokenManager';

interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

interface RefreshResponse {
  tokens: AuthTokens;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);

      await tokenManager.setTokens(response.data.tokens);

      return response.data.user;
    } catch (error) {
      throw new Error('Invalid email or password');
    }
  }

  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', userData);

      await tokenManager.setTokens(response.data.tokens);

      return response.data.user;
    } catch (error) {
      throw new Error('Registration failed');
    }
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      await tokenManager.clearTokens();
    }
  }

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = await tokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await apiClient.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
      });

      await tokenManager.setTokens(response.data.tokens);

      return response.data.tokens;
    } catch (error) {
      await tokenManager.clearTokens();
      throw new Error('Token refresh failed');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const isValid = await tokenManager.isTokenValid();
    if (!isValid) {
      try {
        await this.refreshTokens();
      } catch (error) {
        return null;
      }
    }

    return tokenManager.getUserFromToken();
  }

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { token });
  }

  async resendVerificationEmail(): Promise<void> {
    await apiClient.post('/auth/resend-verification');
  }
}

export const authService = new AuthService();
```

## Authentication Context

### Auth Provider

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth initialization failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const user = await authService.login(credentials);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const user = await authService.register(userData);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('User refresh failed:', error);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

## Biometric Authentication

### Biometric Setup

```typescript
// lib/auth/biometricAuth.ts
import TouchID from 'react-native-touch-id';
import { Platform } from 'react-native';

interface BiometricConfig {
  title: string;
  subtitle?: string;
  description?: string;
  fallbackLabel?: string;
  cancelLabel?: string;
}

class BiometricAuth {
  async isSupported(): Promise<boolean> {
    try {
      const biometryType = await TouchID.isSupported();
      return biometryType !== false;
    } catch (error) {
      return false;
    }
  }

  async getSupportedType(): Promise<string | null> {
    try {
      const biometryType = await TouchID.isSupported();
      if (typeof biometryType === 'string') {
        return biometryType;
      }
      return biometryType ? 'TouchID' : null;
    } catch (error) {
      return null;
    }
  }

  async authenticate(config: BiometricConfig): Promise<boolean> {
    try {
      const isSupported = await this.isSupported();
      if (!isSupported) {
        throw new Error('Biometric authentication not supported');
      }

      const options = {
        title: config.title,
        subtitle: config.subtitle,
        description: config.description,
        fallbackLabel: config.fallbackLabel || 'Use Passcode',
        cancelLabel: config.cancelLabel || 'Cancel',
        color: '#007AFF',
        sensorDescription: 'Touch sensor',
        sensorErrorDescription: 'Failed',
        unifiedErrors: false,
        passcodeFallback: true,
      };

      await TouchID.authenticate(config.title, options);
      return true;
    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return false;
    }
  }

  async authenticateForLogin(): Promise<boolean> {
    return this.authenticate({
      title: 'Authenticate',
      subtitle: 'Use your biometric to sign in',
      description: 'Place your finger on the sensor or look at the camera',
    });
  }

  async authenticateForSensitiveAction(action: string): Promise<boolean> {
    return this.authenticate({
      title: 'Confirm Action',
      subtitle: `Authenticate to ${action}`,
      description: 'This action requires biometric verification',
    });
  }
}

export const biometricAuth = new BiometricAuth();
```

### Biometric Login Hook

```typescript
// hooks/useBiometricLogin.ts
export const useBiometricLogin = () => {
  const { login } = useAuth();
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    checkBiometricSupport();
    loadBiometricPreference();
  }, []);

  const checkBiometricSupport = async () => {
    const supported = await biometricAuth.isSupported();
    setIsSupported(supported);
  };

  const loadBiometricPreference = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      setIsBiometricEnabled(enabled === 'true');
    } catch (error) {
      console.error('Failed to load biometric preference:', error);
    }
  };

  const enableBiometric = async (credentials: LoginCredentials) => {
    try {
      // First, verify credentials with regular login
      await login(credentials);

      // Then enable biometric for future logins
      await secureStorage.setItem('biometric_credentials', JSON.stringify(credentials));
      await AsyncStorage.setItem('biometric_enabled', 'true');
      setIsBiometricEnabled(true);

      return true;
    } catch (error) {
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await secureStorage.removeItem('biometric_credentials');
      await AsyncStorage.setItem('biometric_enabled', 'false');
      setIsBiometricEnabled(false);
    } catch (error) {
      console.error('Failed to disable biometric:', error);
    }
  };

  const loginWithBiometric = async () => {
    try {
      if (!isBiometricEnabled) {
        throw new Error('Biometric login not enabled');
      }

      const authenticated = await biometricAuth.authenticateForLogin();
      if (!authenticated) {
        throw new Error('Biometric authentication failed');
      }

      const credentialsJson = await secureStorage.getItem('biometric_credentials');
      if (!credentialsJson) {
        throw new Error('No stored credentials found');
      }

      const credentials = JSON.parse(credentialsJson) as LoginCredentials;
      await login(credentials);
    } catch (error) {
      throw error;
    }
  };

  return {
    isSupported,
    isBiometricEnabled,
    enableBiometric,
    disableBiometric,
    loginWithBiometric,
  };
};
```

## OAuth Integration

### OAuth Service

```typescript
// lib/auth/oauthService.ts
import { authorize, refresh, revoke } from 'react-native-app-auth';

interface OAuthConfig {
  issuer: string;
  clientId: string;
  redirectUrl: string;
  scopes: string[];
  additionalParameters?: Record<string, string>;
}

class OAuthService {
  private configs: Record<string, OAuthConfig> = {
    google: {
      issuer: 'https://accounts.google.com',
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      redirectUrl: 'com.yourapp://oauth/google',
      scopes: ['openid', 'profile', 'email'],
    },
    apple: {
      issuer: 'https://appleid.apple.com',
      clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID!,
      redirectUrl: 'com.yourapp://oauth/apple',
      scopes: ['openid', 'email', 'name'],
    },
  };

  async signInWithProvider(provider: 'google' | 'apple'): Promise<User> {
    const config = this.configs[provider];
    if (!config) {
      throw new Error(`OAuth provider ${provider} not configured`);
    }

    try {
      const result = await authorize(config);

      // Exchange OAuth token for app tokens
      const response = await apiClient.post<LoginResponse>('/auth/oauth', {
        provider,
        accessToken: result.accessToken,
        idToken: result.idToken,
      });

      await tokenManager.setTokens(response.data.tokens);

      return response.data.user;
    } catch (error) {
      throw new Error(`${provider} sign-in failed`);
    }
  }

  async refreshOAuthToken(provider: 'google' | 'apple', refreshToken: string): Promise<string> {
    const config = this.configs[provider];

    try {
      const result = await refresh(config, {
        refreshToken,
      });

      return result.accessToken;
    } catch (error) {
      throw new Error(`Failed to refresh ${provider} token`);
    }
  }

  async revokeOAuthToken(provider: 'google' | 'apple', token: string): Promise<void> {
    const config = this.configs[provider];

    try {
      await revoke(config, {
        tokenToRevoke: token,
        sendClientId: true,
      });
    } catch (error) {
      console.warn(`Failed to revoke ${provider} token:`, error);
    }
  }
}

export const oauthService = new OAuthService();
```

## Security Best Practices

### Input Validation

```typescript
// utils/validation.ts
import * as yup from 'yup';

export const loginSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

export const registerSchema = yup.object({
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain uppercase, lowercase, number and special character'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
});
```

### Rate Limiting

```typescript
// utils/rateLimiter.ts
class RateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  isAllowed(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (attempt.count >= maxAttempts) {
      return false;
    }

    attempt.count++;
    return true;
  }

  getRemainingTime(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return 0;

    return Math.max(0, attempt.resetTime - Date.now());
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export const rateLimiter = new RateLimiter();
```

## Next Steps

1. Implement secure token storage with proper encryption
2. Set up biometric authentication for enhanced security
3. Add OAuth providers for social login options
4. Implement proper session management and token refresh
5. Add security monitoring and anomaly detection
6. Test authentication flows thoroughly across different scenarios

---

**Pro Tip**: Always use HTTPS for all authentication endpoints, implement proper token expiration and refresh mechanisms, and never store sensitive data in plain text. Consider implementing additional security measures like device fingerprinting and anomaly detection for production applications.

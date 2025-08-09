# Project Structure

Learn how to organize your React Native project for scalability, maintainability, and team collaboration.

## Recommended Project Structure

```
my-app/
├── app/                                # App screens (Expo Router)
│   ├── (tabs)/                         # Tab-based navigation
│   ├── (auth)/                         # Authentication screens
│   ├── _layout.tsx                     # Root layout
│   └── +not-found.tsx                  # 404 screen
├── components/                         # Reusable UI components
│   ├── ui/                             # Base UI components
│   ├── forms/                          # Form components
│   ├── navigation/                     # Navigation components
│   └── index.ts                        # Component exports
├── hooks/                              # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── index.ts
├── lib/                                # Utility libraries
│   ├── api/                            # API configuration
│   ├── auth/                           # Authentication logic
│   ├── storage/                        # Local storage utilities
│   ├── utils/                          # Helper functions
│   └── constants/                      # App constants
├── styles/                             # Global styles
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
├── assets/                             # Static assets
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── animations/
├── store/                              # State management
│   ├── slices/                         # State slices
│   ├── providers/                      # Context providers
│   └── index.ts
├── __tests__/                          # Test files
│   ├── components/
│   ├── hooks/
│   └── utils/
├── docs/                               # Documentation
├── scripts/                            # Build and utility scripts
├── package.json
├── .env                                # Environment variables
├── .gitignore
├── .nvmrc                              # Node version
├── app.json                            # Expo configuration
├── tailwind.config.js                  # Tailwind configuration
├── eslint.config.js                    # ESLint configuration
├── babel.config.js                     # Babel configuration
└── tsconfig.json                       # TypeScript configuration
```

## App Directory (Expo Router)

### File-based Routing Structure

```
app/
├── _layout.tsx                         # Root layout with providers
├── +not-found.tsx                      # 404 error page
├── index.tsx                           # Home/landing page
├── (tabs)/                             # Tab navigation group
│   ├── _layout.tsx                     # Tab layout
│   ├── index.tsx                       # Home tab
│   ├── search.tsx                      # Search tab
│   ├── profile.tsx                     # Profile tab
│   └── settings.tsx                    # Settings tab
├── (auth)/                             # Authentication group
│   ├── _layout.tsx                     # Auth layout
│   ├── login.tsx                       # Login screen
│   ├── register.tsx                    # Register screen
│   └── forgot-password.tsx             # Password reset
├── (modals)/                           # Modal screens
│   ├── camera.tsx                      # Camera modal
│   └── edit-profile.tsx                # Edit profile modal
└── [...missing].tsx                    # Catch-all route
```

### Layout Examples

**Root Layout (`app/_layout.tsx`):**

```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/lib/auth/AuthProvider';

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(modals)" options={{ presentation: 'modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
```

## Components Directory

### Component Organization

```
components/
├── ui/                                 # Base UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   ├── Button.stories.tsx
│   │   └── index.ts
│   ├── Input/
│   ├── Card/
│   └── index.ts                        # Export all UI components
├── forms/                              # Form-specific components
│   ├── LoginForm/
│   ├── RegisterForm/
│   └── index.ts
├── navigation/                         # Navigation components
│   ├── TabBar/
│   ├── Header/
│   └── index.ts
└── index.ts                            # Export all components
```

### Component Template

```typescript
// components/ui/Button/Button.tsx
import React from 'react';
import { Pressable, Text, PressableProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps extends PressableProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'rounded-lg items-center justify-center',
        {
          'bg-blue-500': variant === 'primary',
          'bg-gray-200': variant === 'secondary',
          'border border-gray-300': variant === 'outline',
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        },
        className
      )}
      {...props}
      >
      <Text className={cn(
          'font-medium',
          {
            'text-white': variant === 'primary',
            'text-gray-800': variant === 'secondary',
            'text-gray-600': variant === 'outline',
            'text-sm': size === 'sm',
            'text-base': size === 'md',
            'text-lg': size === 'lg',
          }
        )}>
        {children}
      </Text>
    </Pressable>
  );
}
```

## Hooks Directory

### Custom Hooks Organization

```
hooks/
├── useAuth.ts                          # Authentication hook
├── useApi.ts                           # API request hook
├── useStorage.ts                       # Local storage hook
├── usePermissions.ts                   # Device permissions
├── useNetworkStatus.ts                 # Network connectivity
├── useAppState.ts                      # App state changes
└── index.ts                            # Export all hooks
```

### Hook Example

```typescript
// hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/lib/auth/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}

// Usage
const { user, login, logout, isLoading } = useAuth();
```

## Lib Directory

### Library Organization

```
lib/
├── api/                                # API configuration
│   ├── client.ts                       # HTTP client setup
│   ├── endpoints.ts                    # API endpoints
│   ├── types.ts                        # API types
│   └── index.ts
├── auth/                               # Authentication
│   ├── AuthProvider.tsx                # Auth context
│   ├── storage.ts                      # Token storage
│   ├── types.ts                        # Auth types
│   └── index.ts
├── storage/                            # Local storage
│   ├── mmkv.ts                         # MMKV storage
│   ├── secure.ts                       # Secure storage
│   └── index.ts
├── utils/                              # Utility functions
│   ├── cn.ts                           # Class name utility
│   ├── format.ts                       # Formatting utilities
│   ├── validation.ts                   # Validation schemas
│   └── index.ts
└── constants/                          # App constants
    ├── colors.ts
    ├── spacing.ts
    ├── typography.ts
    └── index.ts
```

## Store Directory (State Management)

### Zustand Store Structure

```
store/
├── slices/                             # State slices
│   ├── authSlice.ts
│   ├── userSlice.ts
│   ├── settingsSlice.ts
│   └── index.ts
├── providers/                          # Context providers
│   ├── ThemeProvider.tsx
│   ├── NotificationProvider.tsx
│   └── index.ts
└── index.ts                            # Main store
```

### Store Example

```typescript
// store/slices/authSlice.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

## Testing Structure

### Test Organization

```
__tests__/
├── components/                         # Component tests
│   ├── ui/
│   │   ├── Button.test.tsx
│   │   └── Input.test.tsx
│   └── forms/
├── hooks/                              # Hook tests
│   ├── useAuth.test.ts
│   └── useApi.test.ts
├── utils/                              # Utility tests
│   ├── format.test.ts
│   └── validation.test.ts
├── e2e/                                # End-to-end tests
│   ├── auth.e2e.ts
│   └── navigation.e2e.ts
└── setup.ts                            # Test setup
```

## Configuration Files

### Essential Configuration Files

**TypeScript Configuration (`tsconfig.json`):**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@/store/*": ["./store/*"],
      "@/styles/*": ["./styles/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Babel Configuration (`babel.config.js`):**

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
            '@/components': './components',
            '@/hooks': './hooks',
            '@/lib': './lib',
            '@/store': './store',
            '@/styles': './styles',
          },
        },
      ],
    ],
  };
};
```

## Best Practices

### 1. Naming Conventions

- **Files**: Use kebab-case for files (`user-profile.tsx`)
- **Components**: Use PascalCase (`UserProfile`)
- **Hooks**: Use camelCase with "use" prefix (`useUserProfile`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`)

### 2. Import Organization

```typescript
// 1. React and React Native imports
import React from 'react';
import { View, Text } from 'react-native';

// 2. Third-party library imports
import { useQuery } from '@tanstack/react-query';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';

// 4. Relative imports
import './styles.css';
```

### 3. Component Structure

```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component definition
// 4. Styles (if using StyleSheet)
// 5. Default export
```

### 4. File Organization Rules

- **One component per file**
- **Co-locate related files** (component, test, styles)
- **Use index.ts files** for clean imports
- **Group by feature**, not by file type

## Next Steps

1. **Set up your project structure** using this template
2. **Configure path aliases** in TypeScript and Babel
3. **Create your first components** following the patterns
4. **Set up state management** with your preferred solution
5. **Add testing setup** for your components and hooks

---

**Pro Tip**: Start with a simple structure and evolve it as your app grows. Don't over-engineer from the beginning, but plan for scalability.

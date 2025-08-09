# Project Structure

Learn how to organize your React Native project for scalability, maintainability, and team collaboration. This guide presents a **progressive approach** that starts simple and evolves as your app grows.

## Architecture Evolution Strategy

### **Start Simple** → **Scale Smart**

1. **Small Projects (< 10 screens)**: Use **Flat Structure**
2. **Medium Projects (10-30 screens)**: Introduce **Domain Grouping**
3. **Large Projects (30+ screens)**: Adopt **Feature-Based Architecture**

---

## Phase 1: Flat Structure (Recommended Start)

**Perfect for**: New projects, MVPs, small teams, learning

```
my-app/
├── app/                                # App screens (Expo Router)
│   ├── (tabs)/                         # Tab-based navigation
│   │   ├── _layout.tsx                 # Tab layout
│   │   ├── index.tsx                   # Home tab
│   │   ├── search.tsx                  # Search tab
│   │   └── profile.tsx                 # Profile tab
│   ├── (auth)/                         # Authentication screens
│   │   ├── _layout.tsx                 # Auth layout
│   │   ├── login.tsx                   # Login screen
│   │   └── register.tsx                # Register screen
│   ├── (modals)/                       # Modal screens
│   │   ├── camera.tsx                  # Camera modal
│   │   └── edit-profile.tsx            # Edit profile modal
│   ├── _layout.tsx                     # Root layout
│   └── +not-found.tsx                  # 404 screen
├── components/                         # Reusable UI components
│   ├── ui/                             # Base UI components (Button, Input, Card)
│   ├── forms/                          # Form components (LoginForm, RegisterForm)
│   ├── navigation/                     # Navigation components (TabBar, Header)
│   └── index.ts                        # Component exports
├── hooks/                              # Custom React hooks
│   ├── useAuth.ts                      # Authentication logic
│   ├── useApi.ts                       # API requests
│   ├── useStorage.ts                   # Local storage
│   └── index.ts                        # Hook exports
├── lib/                                # Utility libraries & configuration
│   ├── api/                            # API configuration
│   │   ├── client.ts                   # HTTP client setup
│   │   ├── endpoints.ts                # API endpoints
│   │   └── types.ts                    # API types
│   ├── auth/                           # Authentication utilities
│   │   ├── storage.ts                  # Token storage
│   │   └── types.ts                    # Auth types
│   ├── storage/                        # Local storage utilities
│   │   ├── mmkv.ts                     # MMKV storage
│   │   └── secure.ts                   # Secure storage
│   ├── utils/                          # Helper functions
│   │   ├── cn.ts                       # Class name utility
│   │   ├── format.ts                   # Formatting utilities
│   │   └── validation.ts               # Validation schemas
│   └── constants/                      # App constants
│       ├── colors.ts                   # Color palette
│       ├── spacing.ts                  # Spacing scale
│       └── typography.ts               # Typography scale
├── store/                              # State management (optional)
│   ├── slices/                         # State slices
│   ├── providers/                      # Context providers
│   └── index.ts                        # Store exports
├── assets/                             # Static assets
│   ├── images/                         # Image files
│   ├── icons/                          # Icon files
│   └── fonts/                          # Custom fonts
├── __tests__/                          # Test files
│   ├── components/                     # Component tests
│   ├── hooks/                          # Hook tests
│   └── utils/                          # Utility tests
├── docs/                               # Documentation
├── scripts/                            # Build and utility scripts
├── package.json                        # Dependencies
├── .env                                # Environment variables
├── app.json                            # Expo configuration
├── babel.config.js                     # Babel configuration
├── eslint.config.js                    # ESLint configuration
├── tsconfig.json                       # TypeScript configuration
└── tailwind.config.js                  # Tailwind configuration (if using)
```

### **Flat Structure Benefits**
- **Simple to understand** and navigate
- **Fast development** for small teams
- **Easy refactoring** when starting out
- **Minimal cognitive overhead**
- **Perfect for Expo Router** file-based routing

---

## Phase 2: Domain Grouping (Growing Projects)

**Perfect for**: 10-30 screens, multiple developers, clear feature boundaries

```
my-app/
├── app/                                # App screens (Expo Router)
│   ├── (tabs)/                         # Main app tabs
│   ├── (auth)/                         # Authentication flow
│   ├── (modals)/                       # Modal screens
│   ├── _layout.tsx                     # Root layout
│   └── +not-found.tsx                  # 404 screen
├── features/                           # Feature-specific code
│   ├── auth/                           # Authentication feature
│   │   ├── components/                 # Auth-specific components
│   │   ├── hooks/                      # Auth-specific hooks
│   │   ├── services/                   # Auth API services
│   │   └── types.ts                    # Auth types
│   ├── profile/                        # User profile feature
│   │   ├── components/                 # Profile components
│   │   ├── hooks/                      # Profile hooks
│   │   └── services/                   # Profile services
│   └── feed/                           # Social feed feature
│       ├── components/                 # Feed components
│       ├── hooks/                      # Feed hooks
│       └── services/                   # Feed services
├── shared/                             # Shared across features
│   ├── components/                     # Reusable UI components
│   │   ├── ui/                         # Base components
│   │   └── layout/                     # Layout components
│   ├── hooks/                          # Common hooks
│   ├── services/                       # Shared services
│   ├── utils/                          # Utility functions
│   └── types/                          # Global types
├── lib/                                # Core utilities & config
├── assets/                             # Static assets
├── __tests__/                          # Test files
└── [config files...]                   # Configuration files
```

### **Domain Grouping Benefits**
- **Clear feature boundaries**
- **Easier team collaboration**
- **Reduced merge conflicts**
- **Better code organization**
- **Preparation for feature-based architecture**

---

## Phase 3: Feature-Based Architecture (Large Projects)

**Perfect for**: 30+ screens, large teams, complex business logic

```
my-app/
├── app/                                # App screens (Expo Router)
├── src/                                # Source code
│   ├── features/                       # Feature modules
│   │   ├── auth/                       # Authentication feature
│   │   │   ├── components/             # Auth-specific components
│   │   │   ├── hooks/                  # Auth-specific hooks
│   │   │   ├── services/               # Auth API services
│   │   │   ├── store/                  # Auth state management
│   │   │   ├── types/                  # Auth type definitions
│   │   │   ├── utils/                  # Auth utilities
│   │   │   └── index.ts                # Feature exports
│   │   ├── profile/                    # User profile feature
│   │   ├── feed/                       # Social feed feature
│   │   ├── chat/                       # Chat feature
│   │   └── notifications/              # Notifications feature
│   ├── shared/                         # Shared across features
│   │   ├── components/                 # Reusable UI components
│   │   ├── hooks/                      # Common hooks
│   │   ├── services/                   # Shared services
│   │   ├── store/                      # Global state
│   │   ├── utils/                      # Utility functions
│   │   └── types/                      # Global types
│   └── app/                            # App-level configuration
│       ├── store/                      # Global state setup
│       ├── navigation/                 # Navigation configuration
│       └── providers/                  # App providers
├── lib/                                # External utilities & config
├── assets/                             # Static assets
└── [config files...]                   # Configuration files
```

### **Feature-Based Benefits**
- **Maximum scalability**
- **Team independence**
- **Clear ownership boundaries**
- **Easier testing and maintenance**
- **Supports micro-frontend patterns**

---

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

## Configuration Files

### Path Aliases Configuration

**Phase 1 & 2: Flat/Domain Structure (`tsconfig.json`):**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/lib/*": ["./lib/*"],
      "@/store/*": ["./store/*"],
      "@/features/*": ["./features/*"],
      "@/shared/*": ["./shared/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
```

**Phase 3: Feature-Based Structure (`tsconfig.json`):**

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/app/*": ["./src/app/*"],
      "@/lib/*": ["./lib/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
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
            // Phase 1 & 2: Flat/Domain Structure
            '@': './',
            '@/components': './components',
            '@/hooks': './hooks',
            '@/lib': './lib',
            '@/store': './store',
            '@/features': './features',
            '@/shared': './shared',

            // Phase 3: Feature-Based Structure (uncomment when migrating)
            // '@': './src',
            // '@/features': './src/features',
            // '@/shared': './src/shared',
            // '@/app': './src/app',
            // '@/lib': './lib',
          },
        },
      ],
    ],
  };
};
```

## Migration Guide

### 🔄 **Phase 1 → Phase 2 Migration**

1. **Create feature directories**:
   ```bash
   mkdir -p features/{auth,profile,feed}
   ```

2. **Move related components**:
   ```bash
   # Move auth-related components
   mv components/LoginForm features/auth/components/
   mv hooks/useAuth.ts features/auth/hooks/
   ```

3. **Update imports** to use new paths
4. **Create shared directory** for common components

### 🔄 **Phase 2 → Phase 3 Migration**

1. **Create src directory**:
   ```bash
   mkdir src
   mv features src/
   mv shared src/
   ```

2. **Update path aliases** in `tsconfig.json` and `babel.config.js`
3. **Update all imports** to use new `@/` paths
4. **Move app-level config** to `src/app/`

---

## Best Practices

### 1. Naming Conventions

- **Files**: Use kebab-case for files (`user-profile.tsx`)
- **Components**: Use PascalCase (`UserProfile`)
- **Hooks**: Use camelCase with "use" prefix (`useUserProfile`)
- **Constants**: Use UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Features**: Use kebab-case (`user-profile`, `social-feed`)

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
// or for feature-based:
import { useAuth } from '@/features/auth';

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
- **Keep shared code truly shared**

### 5. When to Migrate

**Migrate to Phase 2 when**:
- You have 10+ screens
- Multiple developers working on different features
- Merge conflicts become frequent
- Components are becoming feature-specific

**Migrate to Phase 3 when**:
- You have 30+ screens
- Large development team (5+ developers)
- Complex business logic
- Need clear feature ownership

---

## Decision Matrix

| Project Size | Team Size | Complexity | Recommended Phase |
|--------------|-----------|------------|-------------------|
| 1-10 screens | 1-2 devs  | Simple     | **Phase 1** (Flat) |
| 10-30 screens| 2-5 devs  | Medium     | **Phase 2** (Domain) |
| 30+ screens  | 5+ devs   | Complex    | **Phase 3** (Feature-based) |

## Next Steps

1. **Assess your current project** using the decision matrix
2. **Choose the appropriate phase** for your project size and team
3. **Set up path aliases** according to your chosen phase
4. **Create your project structure** following the templates
5. **Plan migration path** for future growth

---

**Pro Tip**: Start simple and evolve progressively. Each phase builds upon the previous one, making migration straightforward when the time comes.

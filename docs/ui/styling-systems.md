# Styling Systems

Comprehensive guide to styling React Native applications using modern approaches including NativeWind, StyleSheet, and other styling solutions.

## Styling Approaches Comparison

| Approach              | Learning Curve                  | Performance | Developer Experience | Bundle Size |
| --------------------- | ------------------------------- | ----------- | -------------------- | ----------- |
| **NativeWind**        | Low (if familiar with Tailwind) | Excellent   | Excellent            | Small       |
| **StyleSheet**        | Low                             | Excellent   | Good                 | Minimal     |
| **Styled Components** | Medium                          | Good        | Excellent            | Medium      |
| **Emotion**           | Medium                          | Good        | Excellent            | Medium      |
| **Tamagui**           | High                            | Excellent   | Excellent            | Large       |

## NativeWind (Recommended)

### Setup

```bash
npm install nativewind
npm install --save-dev tailwindcss
```

### Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

```javascript
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }]],
    plugins: ['nativewind/babel'],
  };
};
```

### Basic Usage

```typescript
// components/Button.tsx
import { Pressable, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  className
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        // Base styles
        'rounded-lg items-center justify-center',
        // Variant styles
        {
          'bg-blue-500 active:bg-blue-600': variant === 'primary',
          'bg-gray-200 active:bg-gray-300': variant === 'secondary',
          'border border-gray-300 active:bg-gray-50': variant === 'outline',
        },
        // Size styles
        {
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        },
        className
      )}
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

### Advanced NativeWind Patterns

```typescript
// lib/utils.ts - Class name utility
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// components/Card.tsx - Complex component with NativeWind
interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className
}: CardProps) {
  return (
    <View className={cn(
        'bg-white rounded-lg',
        {
          'shadow-sm border border-gray-200': variant === 'default',
          'shadow-lg': variant === 'elevated',
          'border-2 border-gray-300': variant === 'outlined',
          'p-0': padding === 'none',
          'p-3': padding === 'sm',
          'p-4': padding === 'md',
          'p-6': padding === 'lg',
        },
        className
      )}>
      {children}
    </View>
  );
}

// Responsive design with NativeWind
export function ResponsiveGrid({ children }: { children: React.ReactNode }) {
  return (
    <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </View>
  );
}
```

### Dark Mode Support

```typescript
// components/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const systemTheme = useColorScheme();

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      <View className={isDark ? 'dark' : ''}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

// Usage with dark mode classes
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">
    This text adapts to theme
  </Text>
</View>
```

## StyleSheet (Native Approach)

### Basic Usage

```typescript
import { StyleSheet, View, Text, Pressable } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <Pressable
      style={[styles.button, styles[variant]]}
      onPress={onPress}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#3b82f6',
  },
  secondary: {
    backgroundColor: '#e5e7eb',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#374151',
  },
});
```

### Advanced StyleSheet Patterns

```typescript
// styles/theme.ts
export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
    textSecondary: '#6b7280',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: '700' },
    h2: { fontSize: 24, fontWeight: '600' },
    h3: { fontSize: 20, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 14, fontWeight: '400' },
  },
} as const;

// styles/createStyles.ts
export function createStyles<T extends Record<string, any>>(stylesFn: (theme: typeof theme) => T) {
  return StyleSheet.create(stylesFn(theme));
}

// Usage
const styles = createStyles(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
}));
```

### Responsive Styles

```typescript
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Responsive dimensions
export const responsive = {
  width,
  height,
  isTablet: width >= 768,
  isLandscape: width > height,

  // Responsive font sizes
  fontSize: (size: number) => {
    const scale = width / 375; // Base on iPhone X width
    const newSize = size * scale;
    return Math.max(12, PixelRatio.roundToNearestPixel(newSize));
  },

  // Responsive spacing
  spacing: (size: number) => {
    const scale = width / 375;
    return Math.round(size * scale);
  },
};

// Usage
const styles = StyleSheet.create({
  container: {
    padding: responsive.spacing(16),
  },
  title: {
    fontSize: responsive.fontSize(24),
  },
  grid: {
    flexDirection: responsive.isTablet ? 'row' : 'column',
  },
});
```

## Styled Components

### Setup

```bash
npm install styled-components
npm install --save-dev @types/styled-components @types/styled-components-react-native
```

### Basic Usage

```typescript
import styled from 'styled-components/native';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

const StyledButton = styled.Pressable<ButtonProps>`
padding: ${props => {
  switch (props.size) {
    case 'sm': return '8px 12px';
    case 'lg': return '16px 24px';
    default: return '12px 16px';
  }
}};
background-color: ${props =>
  props.variant === 'secondary' ? '#e5e7eb' : '#3b82f6'
};
border-radius: 8px;
align-items: center;
justify-content: center;
`;

const ButtonText = styled.Text<ButtonProps>`
color: ${props =>
  props.variant === 'secondary' ? '#374151' : '#ffffff'
};
font-size: ${props => {
  switch (props.size) {
    case 'sm': return '14px';
    case 'lg': return '18px';
    default: return '16px';
  }
}};
font-weight: 600;
`;

export function Button({ children, ...props }: ButtonProps & { children: React.ReactNode }) {
  return (
    <StyledButton {...props}>
      <ButtonText {...props}>{children}</ButtonText>
    </StyledButton>
  );
}
```

### Theme Provider

```typescript
// styles/theme.ts
export const lightTheme = {
  colors: {
    primary: '#3b82f6',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#111827',
  },
  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
};

export const darkTheme = {
  ...lightTheme,
  colors: {
    primary: '#60a5fa',
    background: '#111827',
    surface: '#1f2937',
    text: '#f9fafb',
  },
};

// App.tsx
import { ThemeProvider } from 'styled-components/native';

export default function App() {
  const [isDark, setIsDark] = useState(false);

  return (
    <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
      <YourApp />
    </ThemeProvider>
  );
}

// Usage in components
const Container = styled.View`
background-color: ${props => props.theme.colors.background};
padding: ${props => props.theme.spacing.md};
`;
```

## Performance Optimization

### Style Memoization

```typescript
// Memoize expensive style calculations
const useStyles = (theme: Theme, variant: string) => {
  return useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: theme.colors[variant],
      borderRadius: theme.borderRadius.md,
    },
// ... other styles
  }), [theme, variant]);
};

// Use in component
function MyComponent({ variant }: { variant: string }) {
  const theme = useTheme();
  const styles = useStyles(theme, variant);

  return <View style={styles.container} />;
}
```

### Avoiding Inline Styles

```typescript
// Bad - Creates new object on every render
<View style={{ padding: 16, backgroundColor: 'white' }} />

// Good - Reuse style objects
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: 'white',
  },
});

<View style={styles.container} />

// Good with NativeWind - Compiled at build time
<View className="p-4 bg-white" />
```

## Best Practices

### 1. Consistent Design System

```typescript
// design-system/tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      500: '#6b7280',
      900: '#111827',
    },
  },
  spacing: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  fontSizes: [12, 14, 16, 18, 20, 24, 32, 48],
  lineHeights: [16, 20, 24, 28, 32, 36, 40, 48, 56],
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  borderRadius: [0, 2, 4, 8, 12, 16, 24],
  shadows: {
    sm: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
  },
};
```

### 2. Component Variants

```typescript
// Use consistent variant patterns
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  state?: 'default' | 'loading' | 'disabled';
}

// Map variants to styles consistently
const variantStyles = {
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-200 text-gray-800',
  outline: 'border border-gray-300 text-gray-600',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-6 py-4 text-lg',
};
```

### 3. Accessibility

```typescript
// Include accessibility in your styling
<Pressable
  className="p-4 bg-blue-500 rounded-lg"
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the current form data"
  >
  <Text className="text-white font-medium">Submit</Text>
</Pressable>
```

## Next Steps

1. Choose your preferred styling approach based on team preferences and project requirements
2. Set up a consistent design system with tokens and variants
3. Implement responsive design patterns for different screen sizes
4. Add dark mode support to your styling system
5. Optimize performance by avoiding inline styles and memoizing expensive calculations

---

**Pro Tip**: Start with NativeWind if you're familiar with Tailwind CSS. It provides excellent developer experience and performance. Use StyleSheet for maximum performance in critical components.

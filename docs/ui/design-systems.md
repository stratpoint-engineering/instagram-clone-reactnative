# Design Systems

Guide to building consistent design systems in React Native applications.

## Design System Architecture

A design system provides a unified set of design standards, components, and guidelines that ensure consistency across your application.

### Core Components

#### Design Tokens

```typescript
// tokens/colors.ts
export const colors = {
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
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

// tokens/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// tokens/typography.ts
export const typography = {
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};
```

#### Component Library

```typescript
// components/Button/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
}

export function Button({ variant = 'primary', size = 'md', children, onPress }: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-lg items-center justify-center',
        {
          'bg-blue-500': variant === 'primary',
          'bg-gray-200': variant === 'secondary',
          'border border-gray-300': variant === 'outline',
          'px-3 py-2': size === 'sm',
          'px-4 py-3': size === 'md',
          'px-6 py-4': size === 'lg',
        }
      )}
      >
      <Text className={cn(
          'font-medium',
          {
            'text-white': variant === 'primary',
            'text-gray-800': variant === 'secondary',
            'text-gray-600': variant === 'outline',
          }
        )}>
        {children}
      </Text>
    </Pressable>
  );
}
```

## Component Documentation

### Storybook Integration

```typescript
// stories/Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};
```

## Design Guidelines

### Spacing System

- Use consistent spacing values from design tokens
- Follow 8px grid system for layout consistency
- Maintain proper touch targets (minimum 44px)

### Color Usage

- Use semantic colors for consistent meaning
- Ensure proper contrast ratios for accessibility
- Provide dark mode variants

### Typography Scale

- Use consistent font sizes and weights
- Maintain proper line heights for readability
- Consider platform-specific font rendering

## Implementation Strategy

1. **Start with Design Tokens** - Define core values first
2. **Build Base Components** - Create reusable building blocks
3. **Document Everything** - Use Storybook for component documentation
4. **Test Across Platforms** - Ensure consistency on iOS and Android
5. **Iterate and Refine** - Continuously improve based on usage

---

**Pro Tip**: Start small with a few core components and gradually expand your design system. Focus on consistency and reusability over completeness.

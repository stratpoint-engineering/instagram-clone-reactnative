# Responsive Design

Guide to creating responsive React Native applications that work across different screen sizes and orientations.

## Screen Size Considerations

### Device Categories

- **Phones**: 320px - 428px width
- **Tablets**: 768px - 1024px width
- **Foldables**: Variable dimensions when folded/unfolded

### Responsive Breakpoints

```typescript
// utils/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

export const breakpoints = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1280,
};

export const responsive = {
  width,
  height,
  isSmall: width < breakpoints.sm,
  isMedium: width >= breakpoints.sm && width < breakpoints.md,
  isLarge: width >= breakpoints.md && width < breakpoints.lg,
  isXLarge: width >= breakpoints.lg,
  isTablet: width >= breakpoints.md,
  isPhone: width < breakpoints.md,
  isLandscape: width > height,
  isPortrait: height > width,
};
```

## Responsive Layouts

### Flexbox Layouts

```typescript
// components/ResponsiveGrid.tsx
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: { sm?: number; md?: number; lg?: number };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3 },
  gap = 16
}: ResponsiveGridProps) {
  const getColumns = () => {
    if (responsive.isLarge) return columns.lg || 3;
    if (responsive.isMedium) return columns.md || 2;
    return columns.sm || 1;
  };

  return (
    <View style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: -gap / 2,
      }}>
      {React.Children.map(children, (child, index) => (
        <View style={{
            width: `${100 / getColumns()}%`,
            padding: gap / 2,
          }}>
          {child}
        </View>
      ))}
    </View>
  );
}
```

### Adaptive Components

```typescript
// components/AdaptiveLayout.tsx
export function AdaptiveLayout({ children }: { children: React.ReactNode }) {
  if (responsive.isTablet) {
    return (
      <View className="flex-row">
        <View className="w-1/3 border-r border-gray-200">
          {/* Sidebar */}
        </View>
        <View className="flex-1">
          {children}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {children}
    </View>
  );
}
```

## Orientation Handling

### Orientation Detection

```typescript
// hooks/useOrientation.ts
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export function useOrientation() {
  const [orientation, setOrientation] = useState(
    Dimensions.get('window').width > Dimensions.get('window').height ? 'landscape' : 'portrait'
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setOrientation(window.width > window.height ? 'landscape' : 'portrait');
    });

    return () => subscription?.remove();
  }, []);

  return orientation;
}
```

## Responsive Typography

### Scalable Text

```typescript
// utils/typography.ts
export const getResponsiveFontSize = (baseSize: number) => {
  const scale = Math.min(responsive.width / 375, 1.3); // Base on iPhone X width
  return Math.round(PixelRatio.roundToNearestPixel(baseSize * scale));
};

// components/ResponsiveText.tsx
interface ResponsiveTextProps {
  size?: 'sm' | 'base' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function ResponsiveText({ size = 'base', children }: ResponsiveTextProps) {
  const fontSize = {
    sm: getResponsiveFontSize(14),
    base: getResponsiveFontSize(16),
    lg: getResponsiveFontSize(18),
    xl: getResponsiveFontSize(24),
  }[size];

  return (
    <Text style={{ fontSize }}>
      {children}
    </Text>
  );
}
```

## Safe Area Handling

### Safe Area Implementation

```typescript
// components/SafeAreaView.tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function SafeAreaView({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      {children}
    </View>
  );
}
```

## Best Practices

### 1. Design Mobile-First

Start with mobile layouts and progressively enhance for larger screens.

### 2. Use Relative Units

Prefer percentages and flex properties over fixed dimensions.

### 3. Test on Real Devices

Simulators don't always accurately represent real device behavior.

### 4. Consider Touch Targets

Ensure interactive elements are at least 44px in size.

### 5. Handle Edge Cases

Account for notches, home indicators, and foldable devices.

---

**Pro Tip**: Use responsive design patterns from the start rather than retrofitting them later. Test on various device sizes throughout development.

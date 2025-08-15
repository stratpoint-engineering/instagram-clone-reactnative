# Cross-Platform Design Guide

This guide covers designing and developing for web and mobile platforms in a **hybrid, vendor-agnostic** React Native application. All solutions are designed to work without vendor lock-in, ensuring you can eject or migrate at any time.

## Table of Contents

- [Platform Differences Overview](#platform-differences-overview)
- [Responsive Design Strategies](#responsive-design-strategies)
- [Navigation Patterns](#navigation-patterns)
- [Input Methods](#input-methods)
- [Platform-Specific Features](#platform-specific-features)
- [Vendor-Agnostic Architecture](#vendor-agnostic-architecture)
- [Performance Considerations](#performance-considerations)

## Platform Differences Overview

### Screen Orientations & Sizes

| Platform | Orientations | Common Sizes | Design Considerations |
|----------|-------------|--------------|----------------------|
| **Mobile** | Portrait (primary)<br>Landscape (secondary) | 375x667 (iPhone SE)<br>390x844 (iPhone 12)<br>360x640 (Android) | Thumb-friendly navigation<br>Single-hand usage<br>Vertical scrolling |
| **Tablet** | Both orientations equally | 768x1024 (iPad)<br>820x1180 (iPad Air) | Adaptive layouts<br>Multi-column content<br>Contextual sidebars |
| **Web** | Landscape (primary) | 1920x1080 (Desktop)<br>1366x768 (Laptop)<br>360px+ (Mobile web) | Horizontal navigation<br>Multi-column layouts<br>Hover states |

### Interaction Patterns

```typescript
// Vendor-agnostic platform detection using core React Native
import { Platform, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const isTablet = (width >= 768 && height >= 1024) || (width >= 1024 && height >= 768);

export const PlatformUtils = {
  isWeb,
  isMobile,
  isTablet,
  isLandscape: width > height,
  isPortrait: width <= height,

  // Responsive breakpoints
  breakpoints: {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    wide: 1440,
  }
};
```

## Responsive Design Strategies

### 1. Mobile-First Approach

```typescript
// Responsive hook for cross-platform layouts
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;

  return {
    width,
    height,
    isSmall: width < 480,
    isMedium: width >= 480 && width < 768,
    isLarge: width >= 768 && width < 1024,
    isXLarge: width >= 1024,
    isLandscape: width > height,
    isPortrait: width <= height,

    // Layout helpers
    columns: width < 480 ? 1 : width < 768 ? 2 : width < 1024 ? 3 : 4,
    padding: width < 480 ? 16 : width < 768 ? 24 : 32,
    fontSize: {
      small: width < 480 ? 12 : 14,
      body: width < 480 ? 14 : 16,
      title: width < 480 ? 18 : 24,
      heading: width < 480 ? 24 : 32,
    }
  };
};
```

### 2. Adaptive Component Design

```typescript
// Adaptive layout component
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useResponsive } from '../hooks/useResponsive';

interface AdaptiveLayoutProps {
  children: React.ReactNode;
  mobileLayout?: 'stack' | 'grid';
  desktopLayout?: 'sidebar' | 'grid' | 'columns';
}

export const AdaptiveLayout: React.FC<AdaptiveLayoutProps> = ({
  children,
  mobileLayout = 'stack',
  desktopLayout = 'grid'
}) => {
  const { isMedium, isLarge, isXLarge, columns, padding } = useResponsive();

  const getLayoutStyle = () => {
    if (isMedium || isLarge || isXLarge) {
      // Desktop/Tablet layout
      switch (desktopLayout) {
        case 'sidebar':
          return styles.sidebarLayout;
        case 'columns':
          return styles.columnsLayout;
        default:
          return styles.gridLayout;
      }
    } else {
      // Mobile layout
      return mobileLayout === 'grid' ? styles.mobileGrid : styles.mobileStack;
    }
  };

  return (
    <View style={[getLayoutStyle(), { padding }]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  mobileStack: {
    flexDirection: 'column',
  },
  mobileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sidebarLayout: {
    flexDirection: 'row',
  },
  columnsLayout: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
```

## Navigation Patterns

### Mobile Navigation

```typescript
// Mobile-optimized navigation
export const MobileNavigation = () => {
  return (
    <View style={styles.mobileNav}>
      {/* Bottom tab navigation for thumb accessibility */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity style={styles.tab}>
          <Icon name="home" size={24} />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="search" size={24} />
          <Text style={styles.tabLabel}>Search</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="plus" size={24} />
          <Text style={styles.tabLabel}>Create</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="heart" size={24} />
          <Text style={styles.tabLabel}>Activity</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Icon name="user" size={24} />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mobileNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e1e1e1',
    paddingBottom: 20, // Safe area for home indicator
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    minHeight: 44, // Minimum touch target
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});
```

### Web Navigation

```typescript
// Web-optimized navigation
export const WebNavigation = () => {
  const { isLarge, isXLarge } = useResponsive();

  return (
    <View style={styles.webNav}>
      {/* Horizontal top navigation */}
      <View style={styles.topNav}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>Rork</Text>
        </View>

        <View style={styles.searchBar}>
          <TextInput
            placeholder="Search..."
            style={styles.searchInput}
          />
        </View>

        <View style={styles.navActions}>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="home" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="message-circle" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="plus" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="compass" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.navButton}>
            <Icon name="heart" size={24} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profile}>
            <Image source={{ uri: 'profile.jpg' }} style={styles.profileImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sidebar for larger screens */}
      {(isLarge || isXLarge) && (
        <View style={styles.sidebar}>
          <SidebarNavigation />
        </View>
      )}
    </View>
  );
};
```

## Input Methods

### Touch vs Mouse/Keyboard

```typescript
// Platform-specific input handling
export const PlatformInput = () => {
  const [isHovered, setIsHovered] = useState(false);
  const { isWeb } = useResponsive();

  const handlePress = () => {
    // Handle both touch and click
    console.log('Pressed');
  };

  const webProps = isWeb ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
    style: [
      styles.button,
      isHovered && styles.buttonHovered
    ]
  } : {
    style: styles.button
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      {...webProps}
    >
      <Text>Platform Button</Text>
    </TouchableOpacity>
  );
};

// Keyboard shortcuts for web
export const useKeyboardShortcuts = () => {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        // Open search
      }

      // Escape to close modals
      if (event.key === 'Escape') {
        // Close modal
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
};
```

## Platform-Specific Features

### Mobile-Only Features

```typescript
// Vendor-agnostic mobile features using community packages
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

export const MobileFeatures = {
  // Camera access (vendor-agnostic)
  async openCamera() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    }, (response) => {
      if (response.assets) {
        // Handle camera result
      }
    });
  },

  // Photo library (vendor-agnostic)
  async pickImage() {
    launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    }, (response) => {
      if (response.assets) {
        return response.assets[0];
      }
    });
  },

  // Location services (vendor-agnostic)
  async getCurrentLocation() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) return;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => resolve(position),
        error => reject(error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    });
  },

  // Push notifications (vendor-agnostic)
  async registerForPushNotifications() {
    // Use @react-native-firebase/messaging or similar
    // Implementation depends on chosen push service (Firebase, OneSignal, etc.)
  }
};
```

### Web-Only Features

```typescript
// Web-specific features
export const WebFeatures = {
  // File upload via drag & drop
  setupDragAndDrop(element: HTMLElement, onDrop: (files: FileList) => void) {
    if (Platform.OS !== 'web') return;

    element.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    element.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer?.files;
      if (files) {
        onDrop(files);
      }
    });
  },

  // Clipboard access
  async copyToClipboard(text: string) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
    }
  },

  // Browser history
  updateURL(path: string) {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }
  },

  // Local storage
  setLocalStorage(key: string, value: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
};
```

## Vendor-Agnostic Architecture

### Core Principles

**🎯 No Vendor Lock-in Strategy:**
- Use **React Native core APIs** whenever possible
- Choose **community-maintained packages** over vendor-specific ones
- Implement **abstraction layers** for platform-specific features
- Maintain **ejection readiness** at all times

### Package Selection Guidelines

```typescript
// ✅ Vendor-agnostic package choices
const RECOMMENDED_PACKAGES = {
  // Navigation (vendor-agnostic)
  navigation: '@react-navigation/native', // Not Expo Router

  // State Management (framework-agnostic)
  state: 'zustand', // Or Redux Toolkit, Jotai

  // HTTP Client (universal)
  http: 'axios', // Works everywhere

  // Storage (cross-platform)
  storage: '@react-native-async-storage/async-storage',

  // Camera/Media (community-maintained)
  camera: 'react-native-image-picker',

  // Location (community-maintained)
  location: '@react-native-community/geolocation',

  // Push Notifications (choose your provider)
  push: '@react-native-firebase/messaging', // Or OneSignal, Pusher

  // UI Components (vendor-agnostic)
  ui: 'react-native-elements', // Or NativeBase, Tamagui

  // Icons (universal)
  icons: 'react-native-vector-icons',

  // Forms (framework-agnostic)
  forms: 'react-hook-form',

  // Date/Time (universal)
  dates: 'date-fns', // Or moment.js, dayjs
};

// ❌ Avoid vendor-specific packages
const AVOID_PACKAGES = {
  // Expo-specific (creates vendor lock-in)
  'expo-camera': 'Use react-native-image-picker instead',
  'expo-location': 'Use @react-native-community/geolocation instead',
  'expo-notifications': 'Use @react-native-firebase/messaging instead',

  // Platform-specific (limits portability)
  'react-native-firebase': 'Only if you commit to Firebase ecosystem',
};
```

### Abstraction Layer Pattern

```typescript
// Create abstraction layers for platform-specific features
// This allows easy swapping of implementations

// Abstract interface
interface ILocationService {
  getCurrentPosition(): Promise<LocationData>;
  watchPosition(callback: (location: LocationData) => void): () => void;
  requestPermission(): Promise<boolean>;
}

// Implementation using community package
class CommunityLocationService implements ILocationService {
  async getCurrentPosition(): Promise<LocationData> {
    // Implementation using @react-native-community/geolocation
  }

  watchPosition(callback: (location: LocationData) => void): () => void {
    // Implementation
  }

  async requestPermission(): Promise<boolean> {
    // Implementation
  }
}

// Web implementation
class WebLocationService implements ILocationService {
  async getCurrentPosition(): Promise<LocationData> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        position => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        error => reject(error)
      );
    });
  }

  // ... other methods
}

// Factory pattern for platform selection
export const LocationService: ILocationService = Platform.select({
  web: new WebLocationService(),
  default: new CommunityLocationService(),
});
```

### Configuration Management

```typescript
// Environment-agnostic configuration
export const AppConfig = {
  // API endpoints (not tied to any specific service)
  api: {
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000',
    timeout: 10000,
  },

  // Database (using Supabase but easily replaceable)
  database: {
    url: process.env.REACT_APP_SUPABASE_URL,
    key: process.env.REACT_APP_SUPABASE_ANON_KEY,
  },

  // Storage (cloud-agnostic)
  storage: {
    bucket: process.env.REACT_APP_STORAGE_BUCKET,
    region: process.env.REACT_APP_STORAGE_REGION,
  },

  // Features flags (framework-agnostic)
  features: {
    pushNotifications: true,
    analytics: true,
    crashReporting: true,
  },

  // Platform-specific overrides
  platform: Platform.select({
    ios: {
      // iOS-specific config
    },
    android: {
      // Android-specific config
    },
    web: {
      // Web-specific config
    },
  }),
};
```

### Migration Strategy

```typescript
// Design for easy migration
export class MigrationHelper {
  // Database migration (from Supabase to any other)
  static async migrateDatabase(fromConfig: any, toConfig: any) {
    // Abstract migration logic
  }

  // Auth provider migration
  static async migrateAuth(fromProvider: string, toProvider: string) {
    // Abstract auth migration
  }

  // Storage migration
  static async migrateStorage(fromStorage: any, toStorage: any) {
    // Abstract storage migration
  }
}
```

### Ejection Readiness Checklist

**✅ Before Ejecting:**
- [ ] All dependencies are community-maintained or ejectable
- [ ] No vendor-specific APIs in core business logic
- [ ] Configuration is externalized
- [ ] Platform-specific code is properly abstracted
- [ ] Database schema is portable
- [ ] Authentication is provider-agnostic
- [ ] File storage is cloud-agnostic
- [ ] Push notifications use standard protocols

**🔧 Ejection Process:**
1. **Backup current state**
2. **Run ejection command** (`npx react-native eject` or similar)
3. **Update native dependencies**
4. **Reconfigure build systems**
5. **Test all platforms**
6. **Update CI/CD pipelines**

## Performance Considerations

### Image Optimization

```typescript
// Platform-specific image handling
export const OptimizedImage = ({ source, style, ...props }) => {
  const { width } = useResponsive();

  // Calculate optimal image size based on screen
  const getImageSize = () => {
    if (width < 480) return 'small';
    if (width < 768) return 'medium';
    if (width < 1024) return 'large';
    return 'xlarge';
  };

  const imageSource = typeof source === 'string'
    ? { uri: `${source}?size=${getImageSize()}` }
    : source;

  return (
    <Image
      source={imageSource}
      style={style}
      resizeMode="cover"
      {...props}
    />
  );
};
```

### Lazy Loading

```typescript
// Platform-aware lazy loading
export const LazyContent = ({ children, threshold = 100 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Use Intersection Observer for web
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { rootMargin: `${threshold}px` }
      );

      if (ref.current) {
        observer.observe(ref.current);
      }

      return () => observer.disconnect();
    } else {
      // Use scroll-based detection for mobile
      setIsVisible(true); // Simplified for mobile
    }
  }, [threshold]);

  return (
    <View ref={ref}>
      {isVisible ? children : <View style={{ height: 200 }} />}
    </View>
  );
};
```

## Design System Integration

### Platform-Aware Components

```typescript
// Design tokens that adapt to platform
export const designTokens = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },

  // Platform-specific adjustments
  getPlatformSpacing: (size: keyof typeof designTokens.spacing) => {
    const base = designTokens.spacing[size];

    if (Platform.OS === 'web') {
      return base * 1.2; // Slightly larger for web
    }

    return base;
  },

  // Touch targets
  touchTarget: {
    mobile: 44,
    web: 32,
  },

  // Typography scale
  typography: {
    mobile: {
      small: 12,
      body: 14,
      title: 18,
      heading: 24,
    },
    web: {
      small: 14,
      body: 16,
      title: 24,
      heading: 32,
    }
  }
};
```

## Testing Across Platforms

### Responsive Testing

```typescript
// Test utilities for different screen sizes
export const TestUtils = {
  // Mock different screen sizes
  mockScreenSize: (width: number, height: number) => {
    jest.spyOn(Dimensions, 'get').mockReturnValue({
      window: { width, height },
      screen: { width, height },
    });
  },

  // Test responsive behavior
  testResponsive: (component: React.ComponentType, sizes: Array<{width: number, height: number}>) => {
    sizes.forEach(size => {
      TestUtils.mockScreenSize(size.width, size.height);
      // Render and test component
    });
  }
};
```

## Best Practices Summary

### ✅ Do's - Vendor-Agnostic Approach
- **Design mobile-first** then enhance for larger screens
- **Use React Native core APIs** whenever possible
- **Choose community-maintained packages** over vendor-specific ones
- **Create abstraction layers** for platform-specific features
- **Externalize configuration** to avoid vendor lock-in
- **Test on real devices** across platforms
- **Optimize images** for different screen densities
- **Consider touch targets** (44px minimum on mobile)
- **Use platform-specific navigation patterns**
- **Implement progressive enhancement** for web features
- **Maintain ejection readiness** at all times
- **Document migration strategies** for each vendor dependency

### ❌ Don'ts - Avoid Vendor Lock-in
- **Don't use vendor-specific APIs** in core business logic
- **Don't assume mouse hover** is available
- **Don't use fixed pixel values** for layouts
- **Don't ignore platform conventions**
- **Don't forget about landscape orientation**
- **Don't use tiny touch targets** on mobile
- **Don't implement web-only features** without fallbacks
- **Don't tie your app** to a single cloud provider
- **Don't use proprietary build tools** without ejection paths
- **Don't hardcode vendor-specific configurations**

### 🎯 Hybrid App Success Principles
1. **Platform Parity** - Same features across web and mobile
2. **Vendor Independence** - Easy to migrate between services
3. **Progressive Enhancement** - Web features that enhance mobile experience
4. **Community First** - Prefer open-source, community-maintained solutions
5. **Abstraction Layers** - Isolate vendor-specific code
6. **Configuration Externalization** - Environment-based settings
7. **Migration Planning** - Always have an exit strategy

This guide provides a foundation for creating consistent, platform-appropriate experiences across web and mobile platforms while maintaining complete vendor independence and the ability to eject or migrate at any time.

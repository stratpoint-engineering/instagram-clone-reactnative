# Platform-Specific Code

Guide to handling iOS and Android differences in React Native applications.

## Platform Detection

### Basic Platform Checks

```typescript
import { Platform } from 'react-native';

// Simple platform check
if (Platform.OS === 'ios') {
  // iOS-specific code
} else if (Platform.OS === 'android') {
  // Android-specific code
}

// Platform-specific values
const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
});
```

### Platform-Specific Components

```typescript
// components/PlatformButton.tsx
const PlatformButton = Platform.select({
  ios: () => require('./IOSButton').default,
  android: () => require('./AndroidButton').default,
})();

export default PlatformButton;
```

## File-Based Platform Separation

### Platform-Specific Files

```
components/
Button.ios.tsx
Button.android.tsx
Button.tsx (fallback)
```

```typescript
// Button.ios.tsx
export default function Button({ title, onPress }) {
  return (
    <Pressable style={iosStyles.button} onPress={onPress}>
      <Text style={iosStyles.text}>{title}</Text>
    </Pressable>
  );
}

// Button.android.tsx
export default function Button({ title, onPress }) {
  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={androidStyles.button}>
        <Text style={androidStyles.text}>{title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}
```

## Platform-Specific Styling

### Conditional Styles

```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        backgroundColor: '#f8f9fa',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        backgroundColor: '#ffffff',
        elevation: 4,
      },
    }),
  },
});
```

### Safe Area Handling

```typescript
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Header() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
        paddingTop: Platform.OS === 'ios' ? insets.top : 0,
        height: Platform.OS === 'ios' ? 44 + insets.top : 56,
      }}>
      <Text>Header</Text>
    </View>
  );
}
```

## Navigation Differences

### Platform-Specific Navigation

```typescript
// navigation/PlatformNavigator.tsx
const Stack = createNativeStackNavigator();

function PlatformNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        ...Platform.select({
          ios: {
            headerStyle: { backgroundColor: '#f8f9fa' },
            headerTitleStyle: { fontSize: 17, fontWeight: '600' },
          },
          android: {
            headerStyle: { backgroundColor: '#2196f3' },
            headerTitleStyle: { fontSize: 20, fontWeight: '500' },
            headerTintColor: '#fff',
          },
        }),
      }}
      >
      <Stack.Screen name="Home" component={HomeScreen} />
    </Stack.Navigator>
  );
}
```

## Best Practices

### 1. Minimize Platform-Specific Code

Keep platform differences to a minimum and use shared components when possible.

### 2. Use Platform.select Sparingly

Prefer file-based separation for complex platform differences.

### 3. Test on Both Platforms

Always test platform-specific code on actual devices.

### 4. Follow Platform Guidelines

Respect iOS Human Interface Guidelines and Android Material Design principles.

---

**Pro Tip**: Start with shared components and only add platform-specific code when necessary for user experience or platform compliance.

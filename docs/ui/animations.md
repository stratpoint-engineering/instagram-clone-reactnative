# Animations

Guide to implementing smooth and performant animations in React Native applications.

## Animation Libraries

### React Native Reanimated (Recommended)

```bash
npm install react-native-reanimated
```

### Basic Setup

```typescript
// App.tsx
import 'react-native-reanimated/plugin';

// For Expo
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app content */}
    </GestureHandlerRootView>
  );
}
```

## Basic Animations

### Fade Animation

```typescript
// components/FadeInView.tsx
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring
} from 'react-native-reanimated';

interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
}

export function FadeInView({ children, duration = 300 }: FadeInViewProps) {
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      {children}
    </Animated.View>
  );
}
```

### Scale Animation

```typescript
// components/ScaleButton.tsx
export function ScaleButton({ children, onPress }: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        >
        {children}
      </Pressable>
    </Animated.View>
  );
}
```

## Gesture-Based Animations

### Swipe to Delete

```typescript
// components/SwipeToDelete.tsx
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeToDelete({ children, onDelete }: SwipeToDeleteProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
    },
    onEnd: (event) => {
      if (event.translationX < -100) {
        translateX.value = withSpring(-300);
        opacity.value = withSpring(0, undefined, () => {
          runOnJS(onDelete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </PanGestureHandler>
  );
}
```

## Layout Animations

### Animated List

```typescript
// components/AnimatedList.tsx
import { Layout, FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface AnimatedListProps {
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
}

export function AnimatedList({ data, renderItem }: AnimatedListProps) {
  return (
    <ScrollView>
      {data.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInDown.delay(index * 100)}
          exiting={FadeOutUp}
          layout={Layout.springify()}
          >
          {renderItem(item, index)}
        </Animated.View>
      ))}
    </ScrollView>
  );
}
```

## Complex Animations

### Shared Element Transitions

```typescript
// components/SharedElementTransition.tsx
import { SharedElement } from 'react-navigation-shared-element';

// Screen A
function ListScreen({ navigation }) {
  return (
    <ScrollView>
      {items.map(item => (
        <Pressable
          key={item.id}
          onPress={() => navigation.navigate('Detail', { item })}
          >
          <SharedElement id={`item.${item.id}.image`}>
            <Image source={{ uri: item.image }} />
          </SharedElement>
        </Pressable>
      ))}
    </ScrollView>
  );
}

// Screen B
function DetailScreen({ route }) {
  const { item } = route.params;

  return (
    <View>
      <SharedElement id={`item.${item.id}.image`}>
        <Image source={{ uri: item.image }} />
      </SharedElement>
    </View>
  );
}

// Navigation configuration
const Stack = createSharedElementStackNavigator();

function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="List" component={ListScreen} />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        sharedElements={(route) => {
          const { item } = route.params;
          return [`item.${item.id}.image`];
        }}
        />
      </Stack.Navigator>
    );
  }
```

## Performance Optimization

### Use Native Driver

```typescript
// Always use native driver when possible
const animatedValue = useSharedValue(0);

// Good - runs on UI thread
animatedValue.value = withTiming(1, { duration: 300 });

// Avoid - runs on JS thread
Animated.timing(animatedValue, {
  toValue: 1,
  duration: 300,
  useNativeDriver: false, // Avoid this
}).start();
```

### Optimize Re-renders

```typescript
// Use worklets for better performance
const animatedStyle = useAnimatedStyle(() => {
  'worklet';
  return {
    transform: [{ translateX: translateX.value }],
  };
});
```

## Animation Patterns

### Stagger Animations

```typescript
// components/StaggeredList.tsx
export function StaggeredList({ items }: { items: any[] }) {
  return (
    <View>
      {items.map((item, index) => (
        <Animated.View
          key={item.id}
          entering={FadeInRight.delay(index * 100)}
          >
          <ItemComponent item={item} />
        </Animated.View>
      ))}
    </View>
  );
}
```

### Loading Animations

```typescript
// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
    </Animated.View>
  );
}
```

## Best Practices

### 1. Keep Animations Smooth

- Target 60fps for smooth animations
- Use native driver when possible
- Avoid animating layout properties

### 2. Provide Meaningful Feedback

- Use animations to guide user attention
- Provide visual feedback for interactions
- Maintain consistency across the app

### 3. Respect User Preferences

```typescript
// Respect reduced motion preferences
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// Conditionally apply animations
const duration = reduceMotion ? 0 : 300;
```

### 4. Test on Real Devices

- Animations may perform differently on real devices
- Test on lower-end devices for performance
- Monitor frame rates during development

---

**Pro Tip**: Start with simple animations and gradually add complexity. Focus on meaningful animations that enhance user experience rather than decorative ones that might impact performance.

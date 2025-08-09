# Instagram Fork - Expo to React Native Community Conversion

This project has been converted from Expo modules to React Native community alternatives to avoid vendor lock-in while maintaining cross-platform compatibility.

## Conversion Summary

### Navigation
- **From**: `expo-router`
- **To**: `@react-navigation/native` + `@react-navigation/bottom-tabs` + `@react-navigation/stack`
- **Changes**:
  - Replaced file-based routing with programmatic navigation
  - Created `TabNavigator.tsx` for bottom tab navigation
  - Updated `_layout.tsx` to use React Navigation

### Image Handling
- **From**: `expo-image`
- **To**: React Native's built-in `Image` component
- **Changes**:
  - Replaced `contentFit` prop with `resizeMode`
  - Updated all image components across the app

### Image Picker
- **From**: `expo-image-picker`
- **To**: Custom web-compatible `ImagePicker` component
- **Changes**:
  - Created `components/ImagePicker.tsx` with web support using HTML5 File API
  - Maintains same API interface for easy migration
  - Web version uses file input and camera access

### Linear Gradients
- **From**: `expo-linear-gradient`
- **To**: Custom `LinearGradient` component
- **Changes**:
  - Created `components/LinearGradient.tsx`
  - Web version uses CSS `linear-gradient`
  - Native fallback uses solid background color

### Removed Expo Dependencies
The following Expo modules were removed:
- `expo-blur` - Would need `@react-native-blur/blur` (not compatible with Expo Go)
- `expo-constants` - Not needed for this app
- `expo-font` - Using system fonts
- `expo-haptics` - Would need `react-native-haptic-feedback` (not compatible with Expo Go)
- `expo-image` - Replaced with React Native Image
- `expo-image-picker` - Replaced with custom component
- `expo-linear-gradient` - Replaced with custom component
- `expo-linking` - Not used in current implementation
- `expo-location` - Would need `@react-native-community/geolocation` (not compatible with Expo Go)
- `expo-router` - Replaced with React Navigation
- `expo-splash-screen` - Removed splash screen logic
- `expo-status-bar` - Not needed
- `expo-symbols` - Not used
- `expo-system-ui` - Not needed
- `expo-web-browser` - Not used

## Web Compatibility

All components are now web-compatible:
- **Images**: Use standard React Native Image component
- **Linear Gradients**: CSS gradients on web, solid colors on native
- **Image Picker**: HTML5 File API on web, placeholder on native
- **Navigation**: React Navigation works across all platforms

## Native Module Limitations

Since this project uses Expo Go, we cannot install native modules that require custom native code. For a production app, you would need to:

1. Use Expo Dev Client or eject from Expo
2. Install the actual native modules:
   - `react-native-fast-image`
   - `react-native-image-picker`
   - `react-native-linear-gradient`
   - `@react-native-community/geolocation`
   - `react-native-haptic-feedback`
   - `@react-native-blur/blur`

## File Structure Changes

```
app/
├── _layout.tsx (Updated to use React Navigation)
├── TabNavigator.tsx (New - Bottom tab navigator)
├── (tabs)/
│   ├── index.tsx (Updated imports)
│   ├── search.tsx (Updated imports)
│   ├── camera.tsx (Updated to use custom ImagePicker)
│   ├── activity.tsx (Updated imports)
│   └── profile.tsx (Updated imports)

components/
├── LinearGradient.tsx (New - Custom gradient component)
├── ImagePicker.tsx (New - Web-compatible image picker)
├── PostCard.tsx (Updated to use React Native Image)
└── StoriesSection.tsx (Updated to use custom LinearGradient)
```

## Benefits of This Approach

1. **No Vendor Lock-in**: Can migrate to any React Native setup
2. **Web Compatibility**: All components work on web
3. **Maintainable**: Standard React Native patterns
4. **Flexible**: Easy to swap implementations
5. **Future-proof**: Not dependent on Expo's roadmap

## Next Steps for Production

1. Set up Expo Dev Client or eject from Expo
2. Install native modules for better performance
3. Add proper error handling and loading states
4. Implement proper image caching
5. Add haptic feedback for native platforms
6. Implement proper camera functionality

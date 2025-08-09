# Permissions

Guide to handling device permissions in React Native applications.

## Permission Types

### Common Permissions

- Camera access
- Photo library access
- Location services
- Microphone access
- Push notifications
- Contacts access
- Calendar access

## Implementation

### Using expo-permissions

```bash
npx expo install expo-permissions expo-camera expo-location
```

```typescript
import * as Permissions from 'expo-permissions';
import { Camera } from 'expo-camera';

export async function requestCameraPermission() {
  const { status } = await Camera.requestCameraPermissionsAsync();
  return status === 'granted';
}
```

### Manual Permission Handling

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

export async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );
    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return true; // iOS handles permissions automatically
}
```

## Best Practices

### 1. Request Permissions When Needed

Only request permissions when the user is about to use the feature.

### 2. Explain Why

Always explain why your app needs specific permissions.

### 3. Handle Denials Gracefully

Provide fallback functionality when permissions are denied.

### 4. Check Permission Status

Always check current permission status before requesting.

---

**Pro Tip**: Be transparent about permission usage and provide clear value to users for granting permissions.

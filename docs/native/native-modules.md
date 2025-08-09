# Native Modules

Guide to creating and integrating custom native modules in React Native applications.

## When to Use Native Modules

- Access platform-specific APIs not available in React Native
- Integrate existing native libraries
- Optimize performance-critical operations
- Implement custom native UI components

## Creating iOS Native Modules

### Swift Implementation

```swift
// ios/MyApp/CustomModule.swift
import Foundation
import React

@objc(CustomModule)
class CustomModule: NSObject {

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func getDeviceInfo(_ resolve: @escaping RCTPromiseResolveBlock,
  rejecter reject: @escaping RCTPromiseRejectBlock) {
    let deviceInfo = [
      "model": UIDevice.current.model,
      "systemName": UIDevice.current.systemName,
      "systemVersion": UIDevice.current.systemVersion,
      "name": UIDevice.current.name
    ]
    resolve(deviceInfo)
  }

  @objc
  func showAlert(_ title: String,
         message: String,
  resolver resolve: @escaping RCTPromiseResolveBlock,
  rejecter reject: @escaping RCTPromiseRejectBlock) {
    DispatchQueue.main.async {
      let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
      alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
      resolve("OK")
    })

    if let rootViewController = UIApplication.shared.windows.first?.rootViewController {
      rootViewController.present(alert, animated: true)
    }
  }
}
}
```

### Objective-C Bridge

```objc
// ios/MyApp/CustomModule.m
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CustomModule, NSObject)

RCT_EXTERN_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showAlert:(NSString *)title
       message:(NSString *)message
        resolver:(RCTPromiseResolveBlock)resolve
        rejecter:(RCTPromiseRejectBlock)reject)

@end
```

## Creating Android Native Modules

### Java Implementation

```java
// android/app/src/main/java/com/myapp/CustomModule.java
package com.myapp;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Build;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;

public class CustomModule extends ReactContextBaseJavaModule {

  private ReactApplicationContext reactContext;

  public CustomModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "CustomModule";
  }

  @ReactMethod
  public void getDeviceInfo(Promise promise) {
    try {
      WritableMap deviceInfo = Arguments.createMap();
      deviceInfo.putString("model", Build.MODEL);
      deviceInfo.putString("manufacturer", Build.MANUFACTURER);
      deviceInfo.putString("version", Build.VERSION.RELEASE);
      deviceInfo.putInt("sdkVersion", Build.VERSION.SDK_INT);

      promise.resolve(deviceInfo);
    } catch (Exception e) {
      promise.reject("ERROR", e.getMessage());
    }
  }

  @ReactMethod
  public void showAlert(String title, String message, Promise promise) {
    getCurrentActivity().runOnUiThread(new Runnable() {
      @Override
      public void run() {
        AlertDialog.Builder builder = new AlertDialog.Builder(getCurrentActivity());
        builder.setTitle(title)
            .setMessage(message)
            .setPositiveButton("OK", new DialogInterface.OnClickListener() {
          @Override
          public void onClick(DialogInterface dialog, int which) {
            promise.resolve("OK");
          }
        })
            .show();
      }
    });
  }
}
```

### Package Registration

```java
// android/app/src/main/java/com/myapp/CustomModulePackage.java
package com.myapp;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class CustomModulePackage implements ReactPackage {

  @Override
  public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
    return Collections.emptyList();
  }

  @Override
  public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
    List<NativeModule> modules = new ArrayList<>();
    modules.add(new CustomModule(reactContext));
    return modules;
  }
}
```

## TypeScript Definitions

### Type Definitions

```typescript
// types/native-modules.d.ts
interface CustomModuleInterface {
  getDeviceInfo(): Promise<{
    model: string;
    systemName?: string; // iOS only
    systemVersion?: string; // iOS only
    name?: string; // iOS only
    manufacturer?: string; // Android only
    version?: string; // Android only
    sdkVersion?: number; // Android only
  }>;

  showAlert(title: string, message: string): Promise<string>;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    CustomModule: CustomModuleInterface;
  }
}
```

### Usage in React Native

```typescript
// hooks/useCustomModule.ts
import { NativeModules } from 'react-native';

const { CustomModule } = NativeModules;

export function useCustomModule() {
  const getDeviceInfo = async () => {
    try {
      const deviceInfo = await CustomModule.getDeviceInfo();
      return deviceInfo;
    } catch (error) {
      console.error('Failed to get device info:', error);
      throw error;
    }
  };

  const showAlert = async (title: string, message: string) => {
    try {
      const result = await CustomModule.showAlert(title, message);
      return result;
    } catch (error) {
      console.error('Failed to show alert:', error);
      throw error;
    }
  };

  return {
    getDeviceInfo,
    showAlert,
  };
}

// Usage in component
function MyComponent() {
  const { getDeviceInfo, showAlert } = useCustomModule();

  const handleGetDeviceInfo = async () => {
    const info = await getDeviceInfo();
    console.log('Device info:', info);
  };

  const handleShowAlert = async () => {
    await showAlert('Hello', 'This is a native alert!');
  };

  return (
    <View>
      <Button onPress={handleGetDeviceInfo} title="Get Device Info" />
      <Button onPress={handleShowAlert} title="Show Alert" />
    </View>
  );
}
```

## Event Emitters

### iOS Event Emitter

```swift
// ios/MyApp/EventEmitterModule.swift
import Foundation
import React

@objc(EventEmitterModule)
class EventEmitterModule: RCTEventEmitter {

  override func supportedEvents() -> [String]! {
    return ["onCustomEvent"]
  }

  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc
  func startListening() {
    // Start listening to system events
    NotificationCenter.default.addObserver(
      self,
              selector: #selector(handleNotification),
          name: UIApplication.didBecomeActiveNotification,
            object: nil
    )
  }

  @objc
  func stopListening() {
    NotificationCenter.default.removeObserver(self)
  }

  @objc
  private func handleNotification() {
    sendEvent(withName: "onCustomEvent", body: ["status": "active"])
  }
}
```

### Android Event Emitter

```java
// android/app/src/main/java/com/myapp/EventEmitterModule.java
package com.myapp;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class EventEmitterModule extends ReactContextBaseJavaModule {

  public EventEmitterModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return "EventEmitterModule";
  }

  private void sendEvent(String eventName, WritableMap params) {
    getReactApplicationContext()
        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
        .emit(eventName, params);
  }

  @ReactMethod
  public void startListening() {
    // Start listening to system events
    // Send events using sendEvent method
    WritableMap params = Arguments.createMap();
    params.putString("status", "listening");
    sendEvent("onCustomEvent", params);
  }

  @ReactMethod
  public void stopListening() {
    // Stop listening to events
  }
}
```

### React Native Event Listener

```typescript
// hooks/useEventEmitter.ts
import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';

const { EventEmitterModule } = NativeModules;
const eventEmitter = new NativeEventEmitter(EventEmitterModule);

export function useEventEmitter() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const subscription = eventEmitter.addListener('onCustomEvent', event => {
      setEvents(prev => [...prev, event]);
    });

    EventEmitterModule.startListening();

    return () => {
      subscription.remove();
      EventEmitterModule.stopListening();
    };
  }, []);

  return events;
}
```

## Best Practices

### 1. Error Handling

```typescript
// Always handle errors properly
try {
  const result = await CustomModule.someMethod();
  return result;
} catch (error) {
  console.error('Native module error:', error);
  // Provide fallback behavior
  return null;
}
```

### 2. Threading

```swift
// iOS - Use appropriate queues
@objc
func heavyOperation(_ resolve: @escaping RCTPromiseResolveBlock,
rejecter reject: @escaping RCTPromiseRejectBlock) {
  DispatchQueue.global(qos: .background).async {
    // Heavy work here
    let result = performHeavyWork()

    DispatchQueue.main.async {
      resolve(result)
    }
  }
}
```

### 3. Memory Management

```java
// Android - Clean up resources
@Override
public void onCatalystInstanceDestroy() {
  super.onCatalystInstanceDestroy();
  // Clean up resources
}
```

### 4. Testing

```typescript
// Mock native modules for testing
jest.mock('react-native', () => ({
  NativeModules: {
    CustomModule: {
      getDeviceInfo: jest.fn(() =>
        Promise.resolve({
          model: 'iPhone',
          systemName: 'iOS',
        })
      ),
      showAlert: jest.fn(() => Promise.resolve('OK')),
    },
  },
}));
```

---

**Pro Tip**: Start with simple native modules and gradually add complexity. Always provide TypeScript definitions and proper error handling. Test thoroughly on both platforms.

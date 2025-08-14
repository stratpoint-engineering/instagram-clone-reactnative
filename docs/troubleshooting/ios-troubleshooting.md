# iOS Development Troubleshooting Guide

This guide covers common iOS development issues and their solutions for the rork-app project.

## Table of Contents

- [CocoaPods Issues](#cocoapods-issues)
- [Ruby Environment Problems](#ruby-environment-problems)
- [Xcode Build Errors](#xcode-build-errors)
- [Simulator Issues](#simulator-issues)
- [Development Build Problems](#development-build-problems)

## CocoaPods Issues

### Problem: `pod install` fails with Ruby/Node.js PATH errors

**Symptoms:**
- `sh: node: command not found`
- `Invalid Podfile file: cannot load such file`
- Ruby syntax errors in autolinking scripts

**Solution:**
Use the correct Ruby environment with proper PATH setup:

```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/3.4.0"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"
cd ios && pod install
```

**Alternative (from project root):**
```bash
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/3.4.0"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"
cd "$(pwd)/ios" && pod install
```

**Why this works:**
- Sets up Homebrew Ruby instead of system Ruby
- Configures proper gem paths for user installation
- Ensures Node.js is available in PATH for Expo autolinking

### Problem: CocoaPods version conflicts

**Symptoms:**
- `pod install` hangs or fails
- Version mismatch errors
- Dependency resolution failures

**Solution:**
```bash
# Update CocoaPods
gem update cocoapods

# Clean and reinstall
cd ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

## Ruby Environment Problems

### Problem: Ruby version incompatibility

**Symptoms:**
- Syntax errors with `&.` operator
- Heredoc syntax errors (`<<~`)
- `unexpected '.'` errors

**Solution:**
Install and use a newer Ruby version:

```bash
# Install rbenv (if not already installed)
brew install rbenv

# Install Ruby 3.0+
rbenv install 3.0.0
rbenv global 3.0.0

# Restart terminal and verify
ruby --version
```

### Problem: Gem permissions

**Symptoms:**
- Permission denied when installing gems
- `sudo` required for gem installation

**Solution:**
Use user-level gem installation:

```bash
export GEM_HOME="$HOME/.gem/ruby/3.4.0"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"

# Add to your shell profile (.zshrc, .bash_profile)
echo 'export GEM_HOME="$HOME/.gem/ruby/3.4.0"' >> ~/.zshrc
echo 'export GEM_PATH="$GEM_HOME"' >> ~/.zshrc
echo 'export PATH="$GEM_HOME/bin:$PATH"' >> ~/.zshrc
```

## Xcode Build Errors

### Problem: Swift compilation errors in expo-image

**Symptoms:**
- `extra trailing closure passed in call`
- `cannot convert value of type 'Bool'`
- Generic parameter inference errors

**Solution:**
Update expo-image to compatible version:

```bash
bun add expo-image@~2.1.6
cd ios && rm -rf Pods Podfile.lock && pod install
```

### Problem: Missing development team or signing issues

**Symptoms:**
- Code signing errors
- "No development team selected"
- Provisioning profile errors

**Solution:**
1. Open `ios/InstagramHybridApp.xcworkspace` in Xcode
2. Select the project in navigator
3. Go to "Signing & Capabilities"
4. Select your development team
5. Enable "Automatically manage signing"

## Simulator Issues

### Problem: App doesn't open in simulator

**Symptoms:**
- Build succeeds but app doesn't launch
- URL scheme errors
- `LSApplicationWorkspaceErrorDomain error 115`

**Solution:**
1. **Reset simulator:**
   ```bash
   xcrun simctl erase all
   ```

2. **Manually open app:**
   - Find the app in simulator
   - Tap to open manually

3. **Check URL scheme:**
   - Verify `exp+instagram-hybrid-app://` is registered
   - Try opening with development build instead of Expo Go

### Problem: Metro bundler connection issues

**Symptoms:**
- "Unable to connect to Metro"
- Network connection errors
- Bundle loading failures

**Solution:**
1. **Check network connectivity:**
   ```bash
   # Verify Metro is running on correct port
   lsof -i :8083
   ```

2. **Reset Metro cache:**
   ```bash
   bunx expo start --clear
   ```

3. **Check firewall settings:**
   - Allow Metro/Expo through macOS firewall
   - Ensure simulator and Mac are on same network

## Development Build Problems

### Problem: Development build vs Expo Go confusion

**Symptoms:**
- QR code opens wrong app
- Features not working in Expo Go
- "expo-platform" header errors

**Solution:**
1. **Use development build (recommended):**
   ```bash
   bunx expo run:ios --device
   ```

2. **Or use Expo Go with compatible setup:**
   - Remove incompatible dependencies
   - Use managed workflow only

### Problem: Build artifacts and cache issues

**Symptoms:**
- Stale builds
- Changes not reflected
- Inconsistent behavior

**Solution:**
```bash
# Clean all caches
bunx expo start --clear
cd ios && xcodebuild clean
rm -rf ios/build ios/DerivedData

# Rebuild
bunx expo run:ios --device
```

## Quick Reference Commands

### Essential iOS Development Commands

```bash
# Full clean and rebuild (run from project root)
rm -rf node_modules ios/Pods ios/Podfile.lock
bun install
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/3.4.0"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"
cd ios && pod install && cd ..
bunx expo run:ios --device

# Quick pod reinstall
cd ios && rm -rf Pods Podfile.lock && pod install

# Reset simulator
xcrun simctl erase all

# Check running processes
lsof -i :8083  # Metro bundler
ps aux | grep "Simulator"  # iOS Simulator
```

### Environment Setup Script

Create a script to set up the environment automatically:

```bash
#!/bin/bash
# scripts/ios-setup.sh

# Set up Ruby environment for iOS development
export PATH="/opt/homebrew/opt/ruby/bin:$PATH"
export GEM_HOME="$HOME/.gem/ruby/3.4.0"
export GEM_PATH="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"

echo "Ruby version: $(ruby --version)"
echo "CocoaPods version: $(pod --version)"
echo "Environment ready for iOS development"

# Usage: source scripts/ios-setup.sh && cd ios && pod install
```

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [Expo documentation](https://docs.expo.dev/)
2. Review [React Native iOS setup](https://reactnative.dev/docs/environment-setup)
3. Search [Expo forums](https://forums.expo.dev/)
4. Check [CocoaPods troubleshooting](https://guides.cocoapods.org/using/troubleshooting)

## Common File Locations

- **Xcode project:** `ios/InstagramHybridApp.xcworkspace`
- **Podfile:** `ios/Podfile`
- **Build logs:** `.expo/xcodebuild.log`
- **Simulator apps:** `~/Library/Developer/CoreSimulator/`
- **Xcode derived data:** `~/Library/Developer/Xcode/DerivedData/`

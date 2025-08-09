# Environment Setup

Complete guide to setting up your React Native development environment for production-grade applications.

## Prerequisites

### System Requirements

- **macOS** (for iOS development) or **Windows/Linux** (for Android only)
- **8GB+ RAM** (16GB recommended)
- **50GB+ free disk space**
- **Stable internet connection**

## Core Tools Installation

### 1. Node.js & Package Manager

#### Option A: Using nvm (Recommended)

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or reload shell
source ~/.bashrc # or ~/.zshrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node

# Verify installation
node --version # Should be v18+
npm --version
```

#### Option B: Direct Installation

Download from [nodejs.org](https://nodejs.org/) and install Node.js v18+

#### Package Managers

Choose one based on your preference:

```bash
# Bun (Fastest)
curl -fsSL https://bun.sh/install | bash
bun --version

# Yarn
npm install -g yarn
yarn --version

# Pnpm
npm install -g pnpm
pnpm --version
```

### 2. Git Configuration

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Useful aliases
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
```

### 3. Code Editor Setup

#### VS Code (Recommended)

Download from [code.visualstudio.com](https://code.visualstudio.com/)

**Essential Extensions:**

```bash
# Install via command palette (Cmd+Shift+P)
ext install ms-vscode.vscode-typescript-next
ext install bradlc.vscode-tailwindcss
ext install esbenp.prettier-vscode
ext install ms-vscode.vscode-eslint
ext install formulahendry.auto-rename-tag
ext install christian-kohler.path-intellisense
ext install ms-vscode.vscode-json
```

**VS Code Settings:**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

## Mobile Development Setup

### iOS Development (macOS only)

#### 1. Xcode

```bash
# Install from Mac App Store or Apple Developer
# Xcode 14+ required

# Install Command Line Tools
xcode-select --install

# Verify installation
xcodebuild -version
```

#### 2. iOS Simulator

```bash
# Open Xcode > Preferences > Components
# Download iOS simulators for testing

# List available simulators
xcrun simctl list devices
```

#### 3. CocoaPods

```bash
# Install CocoaPods
sudo gem install cocoapods

# Verify installation
pod --version
```

### Android Development

#### 1. Java Development Kit (JDK)

```bash
# Install JDK 11 (recommended)
# Macos with Homebrew
brew install openjdk@11

# Add to shell profile
echo 'export PATH="/opt/homebrew/opt/openjdk@11/bin:$PATH"' >> ~/.zshrc
```

#### 2. Android Studio

1. Download from [developer.android.com/studio](https://developer.android.com/studio)
2. Install Android Studio
3. Open Android Studio > Configure > SDK Manager
4. Install:
   - Android SDK Platform 33+
   - Android SDK Build-Tools 33+
   - Android Emulator
   - Android SDK Platform-Tools

#### 3. Environment Variables

Add to your shell profile (`~/.zshrc` or `~/.bash_profile`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

#### 4. Android Virtual Device (AVD)

```bash
# Create AVD via Android Studio
# Tools > AVD Manager > Create Virtual Device

# Or via command line
avdmanager create avd -n "Pixel_6_API_33" -k "system-images;android-33;google_apis;x86_64"
```

## React Native Tools

### 1. Expo CLI

```bash
# Install Expo CLI
npm install -g @expo/cli

# Verify installation
expo --version
```

### 2. React Native CLI

```bash
# Install React Native CLI
npm install -g @react-native-community/cli

# Verify installation
npx react-native --version
```

### 3. EAS CLI (for Expo builds)

```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Verify installation
eas --version
```

## Verification & Testing

### Environment Check

```bash
# Check Node.js
node --version

# Check package manager
npm --version
yarn --version # if using Yarn
bun --version # if using Bun

# Check React Native environment
npx react-native doctor

# Check Expo environment
expo doctor
```

### iOS Verification

```bash
# Check Xcode
xcodebuild -version

# Check iOS Simulator
xcrun simctl list devices

# Check CocoaPods
pod --version
```

### Android Verification

```bash
# Check Java
java -version

# Check Android SDK
adb --version

# List Android devices/emulators
adb devices
```

## Common Issues & Solutions

### Node.js Issues

```bash
# Permission errors with npm
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Clear npm cache
npm cache clean --force
```

### iOS Issues

```bash
# Xcode Command Line Tools issues
sudo xcode-select --reset
xcode-select --install

# CocoaPods issues
sudo gem install cocoapods
pod repo update
```

### Android Issues

```bash
# SDK not found
echo $ANDROID_HOME # Should show SDK path

# Emulator issues
emulator -list-avds
emulator @Pixel_6_API_33
```

### Metro/React Native Issues

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Clear React Native cache
rm -rf node_modules
npm install
```

## Next Steps

Once your environment is set up:

1. **Create your first project**: Follow [Project Structure](./project-structure.md)
2. **Configure package management**: See [Package Management](./package-management.md)
3. **Set up development tools**: Check [Development Tools](../tools/debugging.md)

## Additional Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Installation](https://docs.expo.dev/get-started/installation/)
- [Android Studio Setup](https://developer.android.com/studio/install)
- [Xcode Setup](https://developer.apple.com/xcode/)

---

**Pro Tip**: Keep your development environment updated regularly. New versions often include performance improvements and bug fixes that can significantly improve your development experience.

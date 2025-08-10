# Instagram Clone - Phase 1 Flat Structure Showcase

A React Native Instagram clone demonstrating **Phase 1 flat structure architecture** with hybrid implementation (no vendor lock-in).

## 🎯 Project Goals
- **Showcase Phase 1 Architecture**: Demonstrate flat, organized project structure
- **Hybrid Implementation**: Minimal Expo dependency while maintaining development efficiency
- **Educational Resource**: Real-world example of scalable React Native patterns
- **Progressive Architecture**: Foundation that can evolve to Phase 2 and Phase 3

## 🚀 Quick Start

```bash
# Clone and install
git checkout phase-1-flat-structure
npm install

# Start development server
npm start

# Open in browser
# Main app: http://localhost:8084
# Phase 1 demo: http://localhost:8084/phase1-demo
```

## 📋 Prerequisites & Setup Tools

### Required Tools
Before running this app, ensure you have the following tools installed:

#### 1. Node.js & Package Manager

**Option A: Using nvm (Recommended for easy version management)**
```bash
# Install nvm (Node Version Manager)
# For macOS/Linux:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
# Or with wget:
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or reload shell
source ~/.bashrc  # or ~/.zshrc

# Install and use Node.js v18 (recommended)
nvm install 18
nvm use 18
nvm alias default 18

# Verify installation
node --version  # Should be v18+
```

**Option B: Direct Node.js installation**
```bash
# Download from: https://nodejs.org/
# Install Node.js v18 or higher
node --version  # Should be v18+
```

**Choose one package manager:**

# Option A: Bun (fastest, used in this project)
curl -fsSL https://bun.sh/install | bash
# Or via npm: npm install -g bun
bun --version

# Option B: npm (comes with Node.js)
npm --version

# Option C: Yarn
npm install -g yarn
yarn --version

# Option D: pnpm
npm install -g pnpm
pnpm --version
```

#### 2. React Native Development Environment

**For iOS Development (macOS only):**
```bash
# Xcode (from Mac App Store)
# Xcode Command Line Tools
xcode-select --install

# CocoaPods
sudo gem install cocoapods
pod --version

# iOS Simulator (included with Xcode)
```

**For Android Development:**
```bash
# Android Studio
# Download from: https://developer.android.com/studio

# Android SDK & Build Tools (via Android Studio)
# Android Virtual Device (AVD) Manager

# Set environment variables in ~/.zshrc or ~/.bash_profile:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

#### 3. Expo CLI & EAS CLI
```bash
# Expo CLI (local - already in project)
bunx expo --version

# EAS CLI (for custom builds)
npm install -g @expo/eas-cli
eas --version

# Expo account (free)
# Sign up at: https://expo.dev/
```

#### 4. React Native CLI (Optional - for maximum independence)
```bash
npm install -g @react-native-community/cli
npx react-native --version
```

### Verification Commands
Run these to verify your setup:
```bash
# Check nvm (if using nvm)
nvm --version
nvm current

# Check Node.js
node --version

# Check your chosen package manager
bun --version     # If using Bun
npm --version     # If using npm
yarn --version    # If using Yarn
pnpm --version    # If using pnpm

# Check Expo (adjust command based on package manager)
bunx expo doctor  # Bun
npx expo doctor   # npm
yarn expo doctor  # Yarn
pnpm expo doctor  # pnpm

# Check iOS setup (macOS only)
xcodebuild -version
pod --version

# Check Android setup
adb --version
```

### nvm Usage Tips (If using nvm)
```bash
# List installed Node.js versions
nvm list

# List available Node.js versions
nvm list-remote

# Install latest LTS version
nvm install --lts

# Switch between Node.js versions
nvm use 18
nvm use 20

# Set default Node.js version
nvm alias default 18

# Use project-specific Node.js version
# Create .nvmrc file in project root with version number
echo "18" > .nvmrc
nvm use  # Will use version from .nvmrc

# Install packages globally for current Node.js version
nvm use 18
npm install -g @expo/eas-cli
```

### Environment Setup
```bash
# Clone and setup project
git clone <your-repo>
cd rork-app

# Install dependencies (choose your package manager)
bun install      # Bun (fastest)
# OR
npm install      # npm
# OR
yarn install     # Yarn
# OR
pnpm install     # pnpm

# Verify Expo setup (adjust based on package manager)
bunx expo doctor  # Bun
npx expo doctor   # npm
yarn expo doctor  # Yarn
pnpm expo doctor  # pnpm
```

### Common Setup Issues & Solutions

#### Issue 1: nvm Not Found After Installation
```bash
# If nvm command is not found after installation
# Add to your shell profile (~/.zshrc or ~/.bash_profile)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Reload shell
source ~/.zshrc  # or ~/.bashrc
```

#### Issue 2: Node.js Path Problems
```bash
# If you get "node: command not found" in CocoaPods
# With nvm, ensure Node.js is active
nvm use 18

# Find your Node.js path
which node

# Update your shell profile (~/.zshrc or ~/.bash_profile)
export PATH="/usr/local/bin:$PATH"
# Or if using nvm, the path will be something like:
# export PATH="$HOME/.nvm/versions/node/v18.x.x/bin:$PATH"
```

#### Issue 2: CocoaPods Installation Issues
```bash
# If gem install fails, try with sudo
sudo gem install cocoapods

# If you have permission issues
sudo gem install -n /usr/local/bin cocoapods
```

#### Issue 3: Android SDK Not Found
```bash
# Make sure Android Studio is installed and SDK is configured
# Add to ~/.zshrc or ~/.bash_profile:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

#### Issue 4: Xcode Command Line Tools
```bash
# If xcode-select fails
sudo xcode-select --reset
xcode-select --install
```

## �📋 What We Accomplished

### ✅ Current Working Setup
- **Web Version**: Running successfully at `http://localhost:8083`
- **Development Build Ready**: Configured with `expo-dev-client` for custom native modules
- **Native Code Generation**: iOS project structure created via `expo prebuild`
- **Package Management**: Using Bun for faster dependency management

## 🛠️ Steps Taken

### 1. Initial Setup Analysis
```bash
# Analyzed current project structure
- Expo SDK 53.0.4
- React Native 0.79.1
- Expo Router for navigation
- Multiple Expo modules (image, location, haptics, etc.)
```

### 2. Installed Development Build Support
```bash
# Added expo-dev-client for custom native modules
bunx expo install expo-dev-client
```

### 3. Fixed Android Package Name
Updated `app.json` to use valid Android package naming:
```json
{
  "android": {
    "package": "app.rork.instagramhybridapp"  // Fixed from "instagram-hybrid-app"
  }
}
```

### 4. Generated Native iOS Code
```bash
# Created native iOS project structure
bunx expo prebuild --platform ios
```

### 5. Resolved CocoaPods Issues
Fixed Node.js path issues in `ios/Podfile`:
```ruby
# Updated from relative 'node' to absolute path
require File.join(File.dirname(`/usr/local/bin/node --print "require.resolve('expo/package.json')"`), "scripts/autolinking")
```

### 6. Started Development Server
```bash
# Successfully launched Expo development server
bunx expo start
# Server running on port 8083 (8081 was occupied by Docker)
```

## 🚀 How to Run the App

### Option 1: Web Development (Currently Working)
```bash
# Start the development server (choose your package manager)
bunx expo start   # Bun
npx expo start    # npm
yarn expo start   # Yarn
pnpm expo start   # pnpm

# Open in browser
# Navigate to http://localhost:8083
```

### Option 2: Development Build (Recommended for Native Features)
```bash
# Install EAS CLI (one-time setup)
npm install -g @expo/eas-cli

# Login to Expo
eas login

# Build custom development client
eas build --profile development --platform ios
eas build --profile development --platform android

# Install the built app on your device, then:
bunx expo start --dev-client  # Bun
npx expo start --dev-client   # npm
yarn expo start --dev-client  # Yarn
pnpm expo start --dev-client  # pnpm
```

### Option 3: React Native CLI (Maximum Independence)
```bash
# Generate native code (choose your package manager)
bunx expo prebuild --clean  # Bun
npx expo prebuild --clean   # npm
yarn expo prebuild --clean  # Yarn
pnpm expo prebuild --clean  # pnpm

# Run with React Native CLI
npx react-native run-ios
npx react-native run-android
```

## 🏗️ Phase 1 Architecture Showcase

### Project Structure
```
📁 Phase 1 Flat Structure:
├── app/                    # Screens (Expo Router)
│   ├── (tabs)/            # Tab navigation
│   ├── phase1-demo.tsx    # Architecture showcase
│   └── _layout.tsx        # Root layout
├── components/            # Organized component library
│   ├── ui/               # Reusable UI (Button, Input, Card)
│   ├── forms/            # Form components (LoginForm)
│   ├── social/           # Instagram components (PostCard, StoriesSection)
│   ├── LinearGradient.tsx # Custom hybrid component
│   ├── ImagePicker.tsx   # Custom hybrid component
│   └── index.ts          # Unified exports
├── hooks/                # Custom React hooks
│   ├── useApi.ts         # Generic API hook
│   ├── useLocalStorage.ts # Storage abstraction
│   ├── useFeed.ts        # Instagram feed logic
│   └── index.ts          # Hook exports
├── lib/                  # Utilities & configuration
│   ├── api/              # API client
│   ├── constants/        # Design tokens (colors)
│   └── utils/            # Helper functions
└── assets/               # Static assets
```

### ✅ Working Features

**Instagram Clone:**
- ✅ **Feed Screen**: Posts with likes, comments, sharing
- ✅ **Stories**: Horizontal scrolling stories with gradients
- ✅ **Search**: Grid layout with image search
- ✅ **Camera**: Image picker with web compatibility
- ✅ **Activity**: Notifications and interactions
- ✅ **Profile**: User profile with posts grid

**Phase 1 Components:**
- ✅ **UI Library**: Button, Input, Card with variants
- ✅ **Form Components**: LoginForm with validation
- ✅ **Custom Hooks**: API requests, local storage
- ✅ **Design System**: Consistent colors and styling

**Hybrid Implementation:**
- ✅ **No Vendor Lock-in**: Custom components replace Expo modules
- ✅ **Web Compatible**: All components work on web platform
- ✅ **Path Aliases**: Clean imports with `@/components`, `@/hooks`
- ✅ **TypeScript**: Full type safety throughout

## 🎯 Architecture Demonstration

### Live Examples

1. **Instagram Clone** (`http://localhost:8084`)
   - Real Instagram-like interface
   - All features working with hybrid components
   - Demonstrates Phase 1 structure in practice

2. **Phase 1 Demo** (`http://localhost:8084/phase1-demo`)
   - Interactive showcase of architecture patterns
   - Live component examples
   - Code organization demonstration

### 🔄 Hybrid Implementation Completed

**Replaced Expo Modules:**
| Original | Custom Implementation | Status |
|----------|----------------------|---------|
| `expo-image` | React Native `Image` | ✅ Complete |
| `expo-linear-gradient` | Custom `LinearGradient` (web-compatible) | ✅ Complete |
| `expo-image-picker` | Custom `ImagePicker` (web-compatible) | ✅ Complete |
| `expo-router` | Kept (file-based routing) | ✅ Hybrid approach |

## 📚 Phase 1 Architecture Guide

### ✅ When to Use Phase 1 (Current Implementation)

**Perfect for:**
- 📱 Small to medium projects (1-10 screens)
- 👥 Small teams (1-2 developers)
- 🚀 MVPs and prototypes
- 📚 Learning React Native patterns
- 🎯 Projects that need to start simple and scale later

### 🎯 Phase 1 Benefits

- **Simple to understand**: Flat structure is intuitive
- **Fast development**: No complex folder navigation
- **Easy refactoring**: Components are easy to find and move
- **Minimal overhead**: No complex architectural patterns
- **Perfect for Expo Router**: Works seamlessly with file-based routing
- **Clean imports**: Path aliases make imports readable

### 🔄 Evolution Path

**Phase 1 → Phase 2 (Domain Grouping)** when:
- You have 10+ screens
- Multiple developers working on different features
- Components become feature-specific
- Merge conflicts become frequent

**Phase 2 → Phase 3 (Feature-Based)** when:
- You have 30+ screens
- Large development team (5+ developers)
- Complex business logic
- Need clear feature ownership

### 📖 Documentation

- **[Complete Architecture Guide](docs/setup/project-structure.md)**: 3-phase evolution approach
- **[PHASE1_SHOWCASE.md](PHASE1_SHOWCASE.md)**: Detailed implementation guide
- **[App Architecture](docs/architecture/app-architecture.md)**: Architectural patterns

## 🐛 Issues Resolved

### 1. CocoaPods Node.js Path Issue
**Problem**: `pod install` couldn't find Node.js
**Solution**: Updated Podfile with absolute Node.js path

### 2. Android Package Name Validation
**Problem**: Invalid package name with hyphens
**Solution**: Changed to `app.rork.instagramhybridapp`

### 3. Port Conflict
**Problem**: Port 8081 occupied by Docker
**Solution**: Expo automatically used port 8083

## 📊 Dependency Analysis

### Current Expo Dependencies
```json
{
  "expo": "^53.0.4",
  "expo-dev-client": "~5.2.4",
  "expo-router": "~5.0.3",
  // ... other expo modules
}
```

### Pure React Native Alternatives Ready
- Navigation: `@react-navigation/native` ✅ (already installed)
- State: `zustand` ✅ (framework agnostic)
- HTTP: `@tanstack/react-query` ✅ (framework agnostic)
- Styling: `nativewind` ✅ (works with pure RN)

## 🎯 Next Steps

1. **Test Development Build**: Create and test custom development client
2. **Gradual Migration**: Replace Expo modules one by one
3. **Native Code Ownership**: Take control of iOS/Android projects
4. **CI/CD Setup**: Configure builds without EAS (optional)

## 📚 Documentation

This project includes comprehensive documentation built with MkDocs Material.

### View Documentation
```bash
# Serve documentation locally
npm run docs:serve
# or
mkdocs serve

# Open http://127.0.0.1:8000 in your browser
```

### Build Documentation
```bash
# Build static documentation
npm run docs:build
# or
mkdocs build

# Deploy to GitHub Pages
npm run docs:deploy
# or
mkdocs gh-deploy
```

### Format Documentation
```bash
# Format all documentation files
npm run format:docs

# Check formatting
npm run format:check
```

### Documentation Structure
- **Getting Started**: Environment setup, project structure, package management
- **Architecture**: App architecture, state management, navigation, component design
- **UI Development**: Styling systems, design systems, responsive design, animations
- **Native Integration**: Expo vs Pure RN, native modules, platform-specific code
- **Development Tools**: Debugging, testing, code quality, performance
- **Data & Networking**: API integration, state synchronization
- **Security**: Authentication, API security, data security
- **Deployment**: CI/CD, app store deployment
- **Monitoring**: Crash reporting, analytics, performance monitoring

## 🔧 Development Commands

### Package Manager Commands
Choose your preferred package manager and use the corresponding commands:

#### Bun (Fastest - Used in this project)
```bash
# Install dependencies
bun install

# Start development server
bunx expo start

# Web development
bunx expo start --web

# Generate native code
bunx expo prebuild

# Clean and regenerate
bunx expo prebuild --clean

# Run on specific platform
bunx expo run:ios
bunx expo run:android
```

#### npm (Default with Node.js)
```bash
# Install dependencies
npm install

# Start development server
npx expo start

# Web development
npx expo start --web

# Generate native code
npx expo prebuild

# Clean and regenerate
npx expo prebuild --clean

# Run on specific platform
npx expo run:ios
npx expo run:android
```

#### Yarn
```bash
# Install dependencies
yarn install

# Start development server
yarn expo start

# Web development
yarn expo start --web

# Generate native code
yarn expo prebuild

# Clean and regenerate
yarn expo prebuild --clean

# Run on specific platform
yarn expo run:ios
yarn expo run:android
```

#### pnpm
```bash
# Install dependencies
pnpm install

# Start development server
pnpm expo start

# Web development
pnpm expo start --web

# Generate native code
pnpm expo prebuild

# Clean and regenerate
pnpm expo prebuild --clean

# Run on specific platform
pnpm expo run:ios
pnpm expo run:android
```

## 📝 Technical Notes

- **Architecture**: Phase 1 flat structure with organized subdirectories
- **Hybrid Approach**: Custom components replace Expo modules for vendor independence
- **Package Manager**: Bun for faster installs and development
- **TypeScript**: Strict type checking with path aliases configured
- **Path Aliases**: Clean imports using `@/components`, `@/hooks`, `@/lib`
- **Web Compatibility**: All custom components work on web platform
- **ESLint**: Code quality rules for React Native and TypeScript
- **Git**: Comprehensive `.gitignore` with tasks/ folder excluded

## 🎯 Project Status

✅ **Phase 1 Implementation Complete**
- Instagram clone fully functional with hybrid components
- Phase 1 architecture showcase with live examples
- Clean, organized codebase following documented patterns
- Ready for Phase 2 migration when project grows

## 🤝 Contributing

This project demonstrates Phase 1 architecture patterns. When contributing:
1. Follow the established Phase 1 structure
2. Use path aliases for imports (`@/components`, `@/hooks`)
3. Keep components focused and reusable
4. Document component usage with JSDoc comments
5. Test both Instagram clone and Phase 1 demo functionality

---

**Ready to explore Phase 2?** See the [Project Structure Guide](docs/setup/project-structure.md) for migration guidance!

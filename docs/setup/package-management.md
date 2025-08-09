# Package Management

Guide to managing dependencies in React Native projects using npm, yarn, pnpm, and bun.

## Package Manager Comparison

| Feature              | npm               | yarn      | pnpm           | bun       |
| -------------------- | ----------------- | --------- | -------------- | --------- |
| **Speed**            | Moderate          | Fast      | Very Fast      | Fastest   |
| **Disk Usage**       | High              | High      | Low            | Low       |
| **Lock File**        | package-lock.json | yarn.lock | pnpm-lock.yaml | bun.lockb |
| **Workspaces**       | Yes               | Yes       | Yes            | Yes       |
| **Node.js Required** | Yes               | Yes       | Yes            | No        |
| **Stability**        | Very Stable       | Stable    | Stable         | Beta      |

## Installation and Setup

### npm (Default)

```bash
# Comes with Node.js
npm --version

# Initialize project
npm init -y

# Install dependencies
npm install react-native
npm install --save-dev typescript

# Scripts
npm run start
npm run build
```

### yarn

```bash
# Install yarn
npm install -g yarn
yarn --version

# Initialize project
yarn init -y

# Install dependencies
yarn add react-native
yarn add --dev typescript

# Scripts
yarn start
yarn build
```

### pnpm

```bash
# Install pnpm
npm install -g pnpm
pnpm --version

# Initialize project
pnpm init

# Install dependencies
pnpm add react-native
pnpm add --save-dev typescript

# Scripts
pnpm start
pnpm build
```

### bun (Recommended for Speed)

```bash
# Install bun
curl -fsSL https://bun.sh/install | bash
bun --version

# Initialize project
bun init

# Install dependencies
bun add react-native
bun add --dev typescript

# Scripts
bun start
bun run build
```

## React Native Specific Commands

### Project Creation

=== "Expo"

```bash
# Npm
npx create-expo-app MyApp

# Yarn
yarn create expo-app MyApp

# Pnpm
pnpm create expo-app MyApp

# Bun
bunx create-expo-app MyApp
```

=== "React Native CLI"

```bash
# Npm
npx react-native init MyApp

# Yarn
yarn react-native init MyApp

# Pnpm
pnpm dlx react-native init MyApp

# Bun
bunx react-native init MyApp
```

### Common Commands

=== "Development"

```bash
# Start Metro bundler
npm start # npm
yarn start # yarn
pnpm start # pnpm
bun start # bun

# Run on iOS
npm run ios # npm
yarn ios # yarn
pnpm ios # pnpm
bun ios # bun

# Run on Android
npm run android # npm
yarn android # yarn
pnpm android # pnpm
bun android # bun
```

=== "Dependencies"

```bash
# Install package
npm install package-name
yarn add package-name
pnpm add package-name
bun add package-name

# Install dev dependency
npm install --save-dev package-name
yarn add --dev package-name
pnpm add --save-dev package-name
bun add --dev package-name

# Install global package
npm install -g package-name
yarn global add package-name
pnpm add -g package-name
bun add -g package-name
```

## Dependency Management Best Practices

### Lock Files

Always commit lock files to version control:

```gitignore
# Keep these files
package-lock.json # npm
yarn.lock # yarn
pnpm-lock.yaml # pnpm
bun.lockb # bun

# Don't commit node_modules
node_modules/
```

### Version Pinning

```json
{
  "dependencies": {
    "react": "18.2.0", // Exact version
    "react-native": "^0.72.0", // Compatible version
    "lodash": "~4.17.21" // Patch-level changes
  }
}
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-native": ">=0.60.0"
  },
  "peerDependenciesMeta": {
    "react-native": {
      "optional": true
    }
  }
}
```

## Workspace Management

### Monorepo Structure

```
my-app/
packages/
mobile/                                 # React Native app
web/                                    # Web app
shared/                                 # Shared components
api/                                    # Backend API
package.json                            # Root package.json
pnpm-workspace.yaml # Workspace config
```

### pnpm Workspaces

```yaml
# Pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

```json
{
  "name": "my-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --recursive dev",
    "build": "pnpm --recursive build",
    "test": "pnpm --recursive test"
  }
}
```

### yarn Workspaces

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "yarn workspaces run dev",
    "build": "yarn workspaces run build"
  }
}
```

## Performance Optimization

### Package Analysis

```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# Check for duplicate packages
npm ls --depth=0
yarn list --depth=0
pnpm list --depth=0
bun pm ls
```

### Dependency Cleanup

```bash
# Remove unused dependencies
npm uninstall package-name
yarn remove package-name
pnpm remove package-name
bun remove package-name

# Clean install
rm -rf node_modules package-lock.json
npm install

# Or with other package managers
rm -rf node_modules yarn.lock && yarn install
rm -rf node_modules pnpm-lock.yaml && pnpm install
rm -rf node_modules bun.lockb && bun install
```

### Cache Management

```bash
# Clear npm cache
npm cache clean --force

# Clear yarn cache
yarn cache clean

# Clear pnpm cache
pnpm store prune

# Clear bun cache
bun pm cache rm
```

## Security Best Practices

### Audit Dependencies

```bash
# Check for vulnerabilities
npm audit
yarn audit
pnpm audit
bun audit

# Fix vulnerabilities
npm audit fix
yarn audit fix
pnpm audit --fix
# Bun Doesn't Have Auto-fix Yet
```

### Package Verification

```bash
# Verify package integrity
npm ci # Clean install from lock file
yarn install --frozen-lockfile
pnpm install --frozen-lockfile
bun install --frozen-lockfile
```

## Troubleshooting

### Common Issues

#### Metro Cache Issues

```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or with package managers
npm start -- --reset-cache
yarn start --reset-cache
pnpm start --reset-cache
bun start --reset-cache
```

#### iOS Pod Issues

```bash
# Clear CocoaPods cache
cd ios && pod deintegrate && pod install
```

#### Android Gradle Issues

```bash
# Clean Android build
cd android && ./gradlew clean
```

#### Node Modules Issues

```bash
# Complete clean install
rm -rf node_modules
rm package-lock.json # or yarn.lock, pnpm-lock.yaml, bun.lockb
npm install # or yarn, pnpm install, bun install
```

### Version Conflicts

```bash
# Check for version conflicts
npm ls
yarn list
pnpm list
bun pm ls

# Force resolution (yarn)
{
"resolutions": {
"package-name": "1.0.0"
}
}

# Force resolution (pnpm)
{
"pnpm": {
"overrides": {
"package-name": "1.0.0"
}
}
}
```

## Recommended Setup

### For New Projects

1. **Use bun** for fastest installation and execution
2. **Commit lock files** to ensure reproducible builds
3. **Use exact versions** for critical dependencies
4. **Set up workspaces** if building multiple apps

### Package.json Template

```json
{
  "name": "my-react-native-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint . --ext .ts,.tsx,.js,.jsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "expo": "~49.0.0",
    "react": "18.2.0",
    "react-native": "0.72.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Next Steps

1. Choose your preferred package manager based on your needs
2. Set up proper dependency management workflows
3. Configure workspaces if building multiple apps
4. Implement security auditing in your CI/CD pipeline
5. Monitor bundle size and dependency health regularly

---

**Pro Tip**: Use bun for development speed, but ensure your CI/CD pipeline works with your chosen package manager. Always test with the same package manager across all environments.

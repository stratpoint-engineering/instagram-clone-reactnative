import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, Text, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Phase 1 imports - demonstrating flat structure organization
import { Button, Input, Card, LoginForm } from '@/components';
import { useApi, useLocalStorage } from '@/hooks';
import { colors } from '@/lib/constants';
import { cn } from '@/lib/utils';

/**
 * Phase 1 Demo Screen
 *
 * This screen demonstrates the Phase 1 flat structure approach:
 *
 * 📁 Project Structure:
 * ├── components/
 * │   ├── ui/           # Reusable UI components
 * │   └── forms/        # Form-specific components
 * ├── hooks/            # Custom React hooks
 * ├── lib/              # Utilities and configuration
 * │   ├── api/          # API client and configuration
 * │   ├── constants/    # App constants (colors, spacing, etc.)
 * │   └── utils/        # Helper functions
 * └── app/              # Screens (Expo Router)
 *
 * 🎯 Benefits:
 * - Simple to understand and navigate
 * - Fast development for small teams
 * - Easy refactoring when starting out
 * - Minimal cognitive overhead
 * - Perfect for Expo Router file-based routing
 */
export default function Phase1DemoScreen() {
  const [demoText, setDemoText] = useState('');
  const [storedValue, setStoredValue] = useLocalStorage('demo-value', '');
  const { data: apiData, isLoading, execute } = useApi('/api/demo', { immediate: false });

  const handleApiTest = () => {
    execute();
  };

  const handleStorageTest = () => {
    setStoredValue(`Demo value: ${new Date().toLocaleTimeString()}`);
    Alert.alert('Success', 'Value saved to local storage!');
  };

  const handleLogin = (email: string, password: string) => {
    Alert.alert('Login Demo', `Email: ${email}\nPassword: ${password}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Phase 1: Flat Structure</Text>
          <Text style={styles.subtitle}>
            Demonstrating organized, scalable React Native architecture
          </Text>
        </View>

        {/* UI Components Demo */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>UI Components</Text>
          <Text style={styles.sectionDescription}>
            Reusable components from @/components/ui
          </Text>

          <View style={styles.componentDemo}>
            <Button variant="primary" onPress={() => Alert.alert('Primary Button')}>
              Primary Button
            </Button>

            <Button variant="outline" onPress={() => Alert.alert('Outline Button')}>
              Outline Button
            </Button>

            <Input
              label="Demo Input"
              placeholder="Type something..."
              value={demoText}
              onChangeText={setDemoText}
            />
          </View>
        </Card>

        {/* Hooks Demo */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Hooks</Text>
          <Text style={styles.sectionDescription}>
            Business logic from @/hooks
          </Text>

          <View style={styles.hookDemo}>
            <Text style={styles.hookLabel}>Local Storage Hook:</Text>
            <Text style={styles.hookValue}>{storedValue || 'No value stored'}</Text>
            <Button size="sm" onPress={handleStorageTest}>
              Test Storage
            </Button>

            <Text style={styles.hookLabel}>API Hook:</Text>
            <Text style={styles.hookValue}>
              {isLoading ? 'Loading...' : apiData ? JSON.stringify(apiData) : 'No data'}
            </Text>
            <Button size="sm" onPress={handleApiTest} disabled={isLoading}>
              Test API
            </Button>
          </View>
        </Card>

        {/* Form Components Demo */}
        <Card variant="elevated" style={styles.section}>
          <Text style={styles.sectionTitle}>Form Components</Text>
          <Text style={styles.sectionDescription}>
            Complex components from @/components/forms
          </Text>

          <LoginForm onLogin={handleLogin} />
        </Card>

        {/* Architecture Info */}
        <Card variant="outlined" style={styles.section}>
          <Text style={styles.sectionTitle}>Phase 1 Architecture</Text>
          <Text style={styles.architectureText}>
            This flat structure is perfect for:
            {'\n'}• Small to medium projects (1-10 screens)
            {'\n'}• Teams of 1-2 developers
            {'\n'}• MVPs and prototypes
            {'\n'}• Learning React Native patterns
            {'\n'}
            {'\n'}When to migrate to Phase 2:
            {'\n'}• 10+ screens
            {'\n'}• Multiple developers
            {'\n'}• Feature-specific components
            {'\n'}• Frequent merge conflicts
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  componentDemo: {
    gap: 12,
  },
  hookDemo: {
    gap: 12,
  },
  hookLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  hookValue: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    backgroundColor: colors.background.tertiary,
    padding: 8,
    borderRadius: 4,
  },
  architectureText: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 20,
  },
});

import { Tabs } from "expo-router";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react-native";
import React from "react";

/**
 * Tab Layout Component
 *
 * Provides the main navigation structure for authenticated users.
 *
 * Features:
 * - Instagram-style tab bar design
 * - Icon-based navigation without labels
 *
 * Tabs:
 * - index: Home feed
 * - search: Search and discover
 * - camera: Create new post
 * - activity: Notifications and activity
 * - profile: User profile
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e1e1e1',
          height: 90,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#000000',
        tabBarInactiveTintColor: '#8e8e8e',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size }) => <PlusSquare color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

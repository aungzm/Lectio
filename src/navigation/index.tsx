import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/authStore';
import type { RootStackParamList, MainTabParamList, LibraryStackParamList } from './types';

import LoginScreen from '@/screens/LoginScreen';
import LibrariesScreen from '@/screens/LibrariesScreen';
import SeriesListScreen from '@/screens/SeriesListScreen';
import SeriesDetailScreen from '@/screens/SeriesDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen name="Libraries" component={LibrariesScreen} options={{ title: 'Libraries' }} />
      <LibraryStack.Screen name="SeriesList" component={SeriesListScreen} options={({ route }) => ({ title: route.params.libraryName })} />
      <LibraryStack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <LibraryStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </LibraryStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Library" component={LibraryNavigator} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

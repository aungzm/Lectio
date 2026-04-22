import './global.css';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from '@/navigation';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useThemeColors } from '@/theme/useThemeColors';

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  const restoreTheme = useThemeStore((s) => s.restoreTheme);
  const isThemeReady = useThemeStore((s) => s.isReady);
  const { background, statusBarStyle } = useThemeColors();

  useEffect(() => {
    restoreSession();
    restoreTheme();
  }, [restoreSession, restoreTheme]);

  if (!isThemeReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: background }}>
        <SafeAreaProvider>
          <StatusBar style={statusBarStyle} />
          <View style={{ flex: 1, backgroundColor: background }} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={statusBarStyle} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

import './global.css';
import React, { useEffect } from 'react';
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
  const statusBarStyle = useThemeColors().statusBarStyle;

  useEffect(() => {
    restoreSession();
    restoreTheme();
  }, [restoreSession, restoreTheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={statusBarStyle} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

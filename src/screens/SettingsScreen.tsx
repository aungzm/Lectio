import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Check, LogOut, MoonStar, Palette, RefreshCw, Server } from 'lucide-react-native';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import NavIconButton from '@/components/NavIconButton';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { APP_THEME_NAMES, APP_THEMES } from '@/theme/themes';
import { useThemeColors } from '@/theme/useThemeColors';
import type { SettingsScreenProps } from '@/navigation/types';

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { serverConfig, auth, logout } = useAuthStore();
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const { accent, accentContrast, accentDark, danger } = useThemeColors();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Settings" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => <View className="w-10" />,
      headerLeftContainerStyle: { paddingLeft: 16 },
      headerRightContainerStyle: { paddingRight: 16 },
      headerTitleContainerStyle: { paddingRight: 32 },
    });
  }, [navigation]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-4">
          <View className="rounded-full bg-accent-soft p-3">
            <Palette size={20} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">Appearance</Text>
            <Text className="mt-1 text-lg font-bold text-secondary">Choose a theme</Text>
          </View>
        </View>
        <View className="gap-3 px-4 py-4">
          {APP_THEME_NAMES.map((themeName) => {
            const theme = APP_THEMES[themeName];
            const isSelected = currentTheme === themeName;

            return (
              <Pressable
                key={themeName}
                onPress={() => setTheme(themeName)}
                className={`rounded-2xl border px-4 py-4 ${isSelected ? 'border-accent bg-accent-soft' : 'border-border bg-background'}`}
              >
                <View className="flex-row items-center justify-between">
                  <View className="mr-4 flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-base font-semibold text-secondary">{theme.label}</Text>
                      {themeName === 'dark' ? <MoonStar size={14} color={accentDark} /> : null}
                    </View>
                    <Text className="mt-1 text-sm leading-5 text-tertiary">{theme.description}</Text>
                  </View>

                  <View className="flex-row items-center gap-2">
                    <View className={`h-4 w-4 rounded-full ${theme.preview.background}`} />
                    <View className={`h-4 w-4 rounded-full ${theme.preview.surface}`} />
                    <View className={`h-4 w-4 rounded-full ${theme.preview.accent}`} />
                    <View className={`h-4 w-4 rounded-full ${theme.preview.text}`} />
                  </View>
                </View>

                {isSelected ? (
                  <View className="mt-3 self-start rounded-full bg-accent px-3 py-1">
                    <View className="flex-row items-center gap-1.5">
                      <Check size={12} color={accentContrast} />
                      <Text className="text-xs font-semibold uppercase tracking-wide text-accent-contrast">
                        Active
                      </Text>
                    </View>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-4">
          <View className="rounded-full bg-accent-soft p-3">
            <Server size={20} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">Server</Text>
            <Text className="mt-1 text-lg font-bold text-secondary">{serverConfig?.name ?? 'Unavailable'}</Text>
          </View>
        </View>
        <View className="gap-4 px-4 py-4">
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">Address</Text>
            <Text className="mt-1 text-sm leading-6 text-secondary">{serverConfig?.serverUrl ?? 'Not configured'}</Text>
          </View>
          <View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">Account</Text>
            <Text className="mt-1 text-sm leading-6 text-secondary">{auth?.username ?? 'Not signed in'}</Text>
          </View>
        </View>
      </View>

      <View className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-4">
          <View className="rounded-full bg-accent-soft p-3">
            <RefreshCw size={20} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">KOReader Sync</Text>
            <Text className="mt-1 text-lg font-bold text-secondary">Coming soon</Text>
          </View>
        </View>
        <View className="px-4 py-4">
          <Text className="text-sm leading-6 text-secondary">
            Connect a KOReader sync service here to keep reading progress aligned across your KOReader devices.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={logout}
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-danger-border bg-danger-soft px-4 py-4"
      >
        <LogOut size={18} color={danger} />
        <Text className="text-sm font-semibold uppercase tracking-wide text-danger">Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

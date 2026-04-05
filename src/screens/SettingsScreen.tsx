import React, { useLayoutEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { LogOut, Server, RefreshCw } from 'lucide-react-native';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import NavIconButton from '@/components/NavIconButton';
import { useAuthStore } from '@/store/authStore';
import type { SettingsScreenProps } from '@/navigation/types';

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { serverConfig, auth, logout } = useAuthStore();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Settings" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [navigation]);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View className="mb-4 flex-row flex-wrap gap-2">
        <View className="rounded-full border border-border bg-surface px-3 py-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
            {serverConfig?.providerType ?? 'Unknown provider'}
          </Text>
        </View>
        <View className="rounded-full border border-border bg-surface px-3 py-2">
          <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
            {auth?.username ?? 'No user'}
          </Text>
        </View>
      </View>

      <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-4">
          <View className="rounded-full bg-primary-50 p-3">
            <Server size={20} color="#0284c7" />
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
          <View className="rounded-full bg-primary-50 p-3">
            <RefreshCw size={20} color="#0284c7" />
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
        className="flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-4"
      >
        <LogOut size={18} color="#dc2626" />
        <Text className="text-sm font-semibold uppercase tracking-wide text-red-600">Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

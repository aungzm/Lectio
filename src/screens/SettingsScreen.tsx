import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';

export default function SettingsScreen() {
  const { serverConfig, auth, logout } = useAuthStore();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerStyle={{ paddingTop: insets.top + 16 }}>
      <Text className="text-2xl font-bold text-gray-900 px-4 mb-6">Settings</Text>

      {/* Server info */}
      <View className="bg-white mx-4 rounded-xl mb-4 overflow-hidden">
        <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-2">Server</Text>
        <View className="px-4 pb-4">
          <Text className="text-base text-gray-900">{serverConfig?.name ?? '—'}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">{serverConfig?.serverUrl ?? '—'}</Text>
          <Text className="text-sm text-gray-500 mt-0.5">
            {auth?.username ?? '—'} · {serverConfig?.providerType ?? '—'}
          </Text>
        </View>
      </View>

      {/* KOReader sync — placeholder */}
      <View className="bg-white mx-4 rounded-xl mb-4 overflow-hidden">
        <Text className="text-xs font-semibold text-gray-400 uppercase px-4 pt-4 pb-2">KOReader Sync</Text>
        <View className="px-4 pb-4">
          <Text className="text-sm text-gray-400">
            KOReader sync settings coming soon. You will be able to connect a kosync server to keep your position
            synced across KOReader devices.
          </Text>
        </View>
      </View>

      {/* Sign out */}
      <View className="mx-4">
        <TouchableOpacity
          className="bg-red-50 border border-red-200 rounded-xl py-4 items-center"
          onPress={logout}
        >
          <Text className="text-red-600 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

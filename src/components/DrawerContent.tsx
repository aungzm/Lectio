import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuthStore } from '@/store/authStore';
import {
  Home,
  Library,
  BookOpen,
  BookOpenText,
  Users,
  FolderOpen,
  List,
  Settings,
  LogOut,
} from 'lucide-react-native';

const DRAWER_ITEMS = [
  { name: 'Home', label: 'Home', icon: Home },
  { name: 'Library', label: 'Libraries', icon: Library },
  { name: 'Series', label: 'Series', icon: BookOpen },
  { name: 'Books', label: 'Books', icon: BookOpenText },
  { name: 'Authors', label: 'Authors', icon: Users },
  { name: 'Collections', label: 'Collections', icon: FolderOpen },
  { name: 'ReadList', label: 'Reading Lists', icon: List },
] as const;

export default function DrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const serverConfig = useAuthStore((s) => s.serverConfig);
  const auth = useAuthStore((s) => s.auth);
  const logout = useAuthStore((s) => s.logout);

  const activeRoute = state.routeNames[state.index];

  return (
    <View className="flex-1 bg-primary" style={{ paddingTop: insets.top }}>
      {/* Header / branding */}
      <View className="px-5 pt-6 pb-8">
        <Text className="text-3xl font-bold text-secondary tracking-tight">Lektio</Text>
        <Text className="text-sm text-tertiary mt-1">
          {serverConfig?.name ?? 'Not connected'}
        </Text>
      </View>

      {/* Nav items */}
      <View className="flex-1 px-3">
        {DRAWER_ITEMS.map((item) => {
          const isActive = activeRoute === item.name;
          const Icon = item.icon;

          return (
            <Pressable
              key={item.name}
              onPress={() => navigation.navigate(item.name)}
              className={`flex-row items-center gap-3 px-3 py-3 rounded-xl mb-0.5 ${
                isActive ? 'bg-secondary' : ''
              }`}
            >
              <Icon
                size={20}
                color={isActive ? '#ffffff' : '#6b7280'}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
              <Text
                className={`text-base ${
                  isActive ? 'text-primary font-semibold' : 'text-tertiary font-medium'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Settings — separated */}
        <View className="border-t border-border mt-4 pt-4">
          <Pressable
            onPress={() => navigation.navigate('Settings')}
            className={`flex-row items-center gap-3 px-3 py-3 rounded-xl ${
              activeRoute === 'Settings' ? 'bg-secondary' : ''
            }`}
          >
            <Settings
              size={20}
              color={activeRoute === 'Settings' ? '#ffffff' : '#6b7280'}
              strokeWidth={activeRoute === 'Settings' ? 2.2 : 1.8}
            />
            <Text
              className={`text-base ${
                activeRoute === 'Settings' ? 'text-primary font-semibold' : 'text-tertiary font-medium'
              }`}
            >
              Settings
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Footer — user info + logout */}
      <View
        className="border-t border-border px-5 py-4"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1 mr-3">
            <Text className="text-sm font-medium text-secondary" numberOfLines={1}>
              {auth?.username ?? '—'}
            </Text>
            <Text className="text-xs text-tertiary mt-0.5" numberOfLines={1}>
              {serverConfig?.providerType?.toUpperCase() ?? '—'}
            </Text>
          </View>
          <Pressable
            onPress={logout}
            className="p-2 rounded-lg active:bg-gray-100"
          >
            <LogOut size={18} color="#6b7280" strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

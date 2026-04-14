import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useAuthStore } from '@/store/authStore';
import { InfoPill } from '@/components/InfoPill';
import {
  BookOpen,
  BookOpenText,
  FolderOpen,
  Home,
  Library,
  List,
  LogOut,
  Settings,
  Users,
} from 'lucide-react-native';

const DRAWER_ITEMS = [
  { name: 'Home', label: 'Home', icon: Home },
  { name: 'Library', label: 'Libraries', icon: Library },
  { name: 'Series', label: 'Series', icon: BookOpen },
  { name: 'Books', label: 'Books', icon: BookOpenText },
  { name: 'Authors', label: 'Authors', icon: Users },
  { name: 'Collections', label: 'Collections', icon: FolderOpen },
  { name: 'ReadList', label: 'Reading Lists', icon: List },
  { name: 'Settings', label: 'Settings', icon: Settings },
] as const;

function DrawerItem({
  label,
  isActive,
  onPress,
  icon,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  icon: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`mb-2 rounded-[20px] border px-4 py-3 ${
        isActive ? 'border-secondary bg-secondary' : 'border-border bg-surface'
      }`}
    >
      <View className="flex-row items-center">
        <View
          className={`mr-3 rounded-full p-2.5 ${
            isActive ? 'bg-primary/15' : 'bg-primary-50'
          }`}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text className={`text-[15px] font-semibold ${isActive ? 'text-primary' : 'text-secondary'}`}>
            {label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function DrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const insets = useSafeAreaInsets();
  const serverConfig = useAuthStore((store) => store.serverConfig);
  const auth = useAuthStore((store) => store.auth);
  const logout = useAuthStore((store) => store.logout);

  const activeRoute = state.routeNames[state.index];

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-4 pt-4 pb-2">
        <View className="relative overflow-hidden rounded-[26px] border border-border bg-surface px-5 py-4">
          <View className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary-100" />
          <View className="absolute -left-6 top-16 h-16 w-16 rounded-full bg-primary-50" />

          <View className="mb-3 self-start rounded-full bg-primary-50 px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
              Lektio
            </Text>
          </View>
          <Text className="text-2xl font-bold text-secondary">Library Space</Text>
          {serverConfig?.name ? (
            <View className="mt-4 self-start">
              <InfoPill
                icon={<Library size={14} color="#6b7280" strokeWidth={1.9} />}
                label={serverConfig.name}
              />
            </View>
          ) : null}
        </View>
      </View>

      <View className="flex-1 px-4 py-2">
        {DRAWER_ITEMS.map((item) => {
          const isActive = activeRoute === item.name;
          const Icon = item.icon;

          return (
            <DrawerItem
              key={item.name}
              label={item.label}
              isActive={isActive}
              onPress={() => navigation.navigate(item.name)}
              icon={
                <Icon
                  size={18}
                  color={isActive ? '#ffffff' : '#0ea5e9'}
                  strokeWidth={2}
                />
              }
            />
          );
        })}
      </View>

      <View className="px-4 pt-1" style={{ paddingBottom: insets.bottom + 10 }}>
        <View className="rounded-[22px] border border-border bg-surface px-4 py-3.5">
          <View className="flex-row items-center justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-sm font-semibold text-secondary" numberOfLines={1}>
                {auth?.username ?? 'Guest'}
              </Text>
              <Text className="mt-0.5 text-xs text-tertiary" numberOfLines={1}>
                Connected to {serverConfig?.name ?? 'no server'}
              </Text>
            </View>
            <Pressable
              onPress={logout}
              className="rounded-full border border-border bg-background p-2.5"
            >
              <LogOut size={18} color="#6b7280" strokeWidth={1.9} />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

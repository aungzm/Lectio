import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useThemeColors } from '@/theme/useThemeColors';

interface SectionShellProps {
  title: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onPress?: () => void;
  children: React.ReactNode;
}

export function SectionShell({ title, icon, actionLabel = 'View all', onPress, children }: SectionShellProps) {
  const { secondary } = useThemeColors();

  return (
    <View className="mb-6 rounded-[28px] border border-border bg-surface py-5">
      <View className="mb-4 flex-row items-center justify-between px-4">
        <View className="flex-row items-center">
          <View className="mr-2 rounded-full bg-primary-50 p-2">{icon}</View>
          <Text className="text-lg font-bold text-secondary">{title}</Text>
        </View>
        {onPress ? (
          <Pressable onPress={onPress} className="flex-row items-center rounded-full bg-background px-3 py-2">
            <Text className="text-sm font-medium text-secondary">{actionLabel}</Text>
            <ChevronRight size={16} color={secondary} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

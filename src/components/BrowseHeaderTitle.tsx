import React from 'react';
import { View, Text } from 'react-native';

interface BrowseHeaderTitleProps {
  label: string;
}

export function BrowseHeaderTitle({ label }: BrowseHeaderTitleProps) {
  return (
    <View className="items-center justify-center">
      <View className="relative overflow-hidden rounded-full border border-accent-soft-strong bg-accent-soft px-6 py-2">
        <View className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-accent-soft-strong" />
        <View className="absolute right-3 top-0.5 h-3 w-3 rounded-full bg-surface/80" />
        <View className="absolute -right-1 bottom-0.5 h-5 w-5 rounded-full bg-accent-soft-strong/80" />
        <Text className="text-xl font-bold tracking-[0.2px] text-secondary">{label}</Text>
      </View>
    </View>
  );
}

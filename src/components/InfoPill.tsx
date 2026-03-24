import React from 'react';
import { View, Text } from 'react-native';

interface InfoPillProps {
  icon: React.ReactNode;
  label: string;
}

export function InfoPill({ icon, label }: InfoPillProps) {
  return (
    <View className="flex-row items-center rounded-full border border-border bg-background px-3 py-2">
      <View className="mr-2">{icon}</View>
      <Text className="text-xs font-medium text-secondary">{label}</Text>
    </View>
  );
}

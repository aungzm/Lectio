import React from 'react';
import { View, Text } from 'react-native';

interface InfoPillProps {
  icon?: React.ReactNode;
  label: string;
}

export function InfoPill({ icon, label }: InfoPillProps) {
  return (
    <View className="flex-row items-center rounded-full border border-primary-100 bg-primary-50 px-4 py-2">
      {icon ? <View className="mr-2">{icon}</View> : null}
      <Text className="text-base font-semibold text-secondary">{label}</Text>
    </View>
  );
}

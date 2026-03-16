import React from 'react';
import { View, Text } from 'react-native';

export function Chip({ label }: { label: string }) {
  return (
    <View className="bg-background rounded-full px-3 py-1 mr-2 mb-2 border border-border">
      <Text className="text-xs text-tertiary font-medium">{label}</Text>
    </View>
  );
}

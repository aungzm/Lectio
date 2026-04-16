import React from 'react';
import { View, Text } from 'react-native';

export function Chip({ label }: { label: string }) {
  return (
    <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
      <Text className="text-xs text-gray-700">{label}</Text>
    </View>
  );
}

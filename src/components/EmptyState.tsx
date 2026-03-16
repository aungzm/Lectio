import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  message: string;
  subtitle?: string;
}

export function EmptyState({ message, subtitle }: EmptyStateProps) {
  return (
    <View className="items-center mt-20 px-8">
      <Text className="text-gray-400 text-center">{message}</Text>
      {subtitle && (
        <Text className="text-gray-300 text-sm text-center mt-2">{subtitle}</Text>
      )}
    </View>
  );
}

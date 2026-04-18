import React from 'react';
import { View, Text } from 'react-native';

interface MetadataSectionProps {
  label: string;
  children: React.ReactNode;
}

export function MetadataSection({ label, children }: MetadataSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-xs font-bold text-tertiary uppercase tracking-wide mb-2">{label}</Text>
      {children}
    </View>
  );
}

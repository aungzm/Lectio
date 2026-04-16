import React from 'react';
import { View, Text } from 'react-native';

interface MetadataSectionProps {
  label: string;
  children: React.ReactNode;
}

/**
 * A labeled section used in detail screens for metadata groups (genres, tags, etc.).
 */
export function MetadataSection({ label, children }: MetadataSectionProps) {
  return (
    <View className="mb-5">
      <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">{label}</Text>
      {children}
    </View>
  );
}

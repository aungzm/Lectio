import React from 'react';
import { View, Text } from 'react-native';

interface KeyFactProps {
  label: string;
  value: string;
}

export function KeyFact({ label, value }: KeyFactProps) {
  return (
    <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
      <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">{label}</Text>
      <Text className="mt-1 text-sm font-semibold text-secondary">{value}</Text>
    </View>
  );
}

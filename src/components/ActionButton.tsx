import React from 'react';
import { Pressable, Text } from 'react-native';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({ label, onPress, variant = 'primary' }: ActionButtonProps) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      className={`flex-1 rounded-xl py-3.5 items-center active:opacity-80 ${
        isPrimary ? 'bg-secondary' : 'bg-border'
      }`}
      onPress={onPress}
    >
      <Text className={`font-semibold text-base ${
        isPrimary ? 'text-primary' : 'text-secondary'
      }`}>{label}</Text>
    </Pressable>
  );
}

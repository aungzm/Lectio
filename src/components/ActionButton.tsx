import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ActionButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function ActionButton({ label, onPress, variant = 'primary' }: ActionButtonProps) {
  const bg = variant === 'primary' ? 'bg-blue-600' : 'bg-gray-200';
  const textColor = variant === 'primary' ? 'text-white' : 'text-gray-800';

  return (
    <TouchableOpacity
      className={`flex-1 ${bg} rounded-xl py-3 items-center`}
      onPress={onPress}
    >
      <Text className={`${textColor} font-semibold text-base`}>{label}</Text>
    </TouchableOpacity>
  );
}

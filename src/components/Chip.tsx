import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  onDismiss?: () => void;
}

export function Chip({ label, onPress, selected, onDismiss }: ChipProps) {
  const content = (
    <View
      className={`self-start rounded-full px-3 py-1 mr-2 mb-2 border flex-row items-center ${
        selected
          ? 'bg-secondary border-secondary'
          : 'bg-background border-border'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          selected ? 'text-primary' : 'text-tertiary'
        }`}
      >
        {label}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8} className="ml-1">
          <X size={12} color={selected ? '#ffffff' : '#6b7280'} />
        </Pressable>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return content;
}

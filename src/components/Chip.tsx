import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { X } from 'lucide-react-native';
import { useThemeColors } from '@/theme/useThemeColors';

interface ChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
  onDismiss?: () => void;
}

export function Chip({ label, onPress, selected, onDismiss }: ChipProps) {
  const { accentDark, primary } = useThemeColors();

  const content = (
    <View
      className={`self-start rounded-full px-3 py-1 mr-2 mb-2 border flex-row items-center ${
        selected
          ? 'bg-secondary border-secondary'
          : 'bg-accent-soft border-accent-soft-strong'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          selected ? 'text-primary' : 'text-accent-dark'
        } shrink`}
      >
        {label}
      </Text>
      {onDismiss && (
        <Pressable onPress={onDismiss} hitSlop={8} className="ml-1">
          <X size={12} color={selected ? primary : accentDark} />
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

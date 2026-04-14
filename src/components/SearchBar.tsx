import React from 'react';
import { View, TextInput } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <View className="px-4 py-3">
      <TextInput
        className="rounded-[22px] border border-primary-100 bg-background px-4 py-3.5 text-base text-secondary"
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

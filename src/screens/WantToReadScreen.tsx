import React from 'react';
import { View, Text } from 'react-native';

export default function WantToReadScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-8">
      <Text className="text-2xl font-semibold text-gray-800 mb-3">Want to Read</Text>
      <Text className="text-base text-gray-400 text-center">
        Your Want to Read list will appear here.
      </Text>
    </View>
  );
}

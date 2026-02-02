import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReaderScreenProps } from '@/navigation/types';

/**
 * ReaderScreen — epub reading surface.
 *
 * Epub rendering requires a native epub library. Recommended options:
 *   - @epubjs-react-native/core  (+ @epubjs-react-native/file-system)
 *   - react-native-epub-view
 *
 * Install your chosen library and replace the placeholder below.
 * Progress should be saved via useProgressStore.saveProgress on location change.
 */
export default function ReaderScreen({ route, navigation }: ReaderScreenProps) {
  const { title, epubUrl } = route.params;
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-gray-900" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 bg-gray-900">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-white text-base">‹ Back</Text>
        </TouchableOpacity>
        <Text className="text-white font-medium flex-1" numberOfLines={1}>
          {title}
        </Text>
      </View>

      {/* Epub renderer placeholder */}
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-400 text-sm px-8 text-center">
          Epub renderer not yet installed.{'\n\n'}
          Install @epubjs-react-native/core and replace this placeholder.
        </Text>
        <Text className="text-xs text-gray-300 mt-4 px-8 text-center" selectable>
          {epubUrl}
        </Text>
      </View>
    </View>
  );
}

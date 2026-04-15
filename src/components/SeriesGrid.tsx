import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { CoverImage } from './CoverImage';
import type { Book } from '@/providers';

interface SeriesGridProps {
  series: Book[];
  getCoverUri: (book: Book) => string | null;
  onPress: (book: Book) => void;
  emptyText?: string;
  ListHeaderComponent?: React.ReactElement;
}

export function SeriesGrid({
  series,
  getCoverUri,
  onPress,
  emptyText = 'No series found.',
  ListHeaderComponent,
}: SeriesGridProps) {
  return (
    <FlatList
      data={series}
      keyExtractor={(item) => item.id}
      numColumns={3}
      contentContainerClassName="px-3 py-3"
      columnWrapperClassName="mb-3"
      ListHeaderComponent={ListHeaderComponent}
      renderItem={({ item }) => (
        <TouchableOpacity className="w-1/3 items-center px-1" onPress={() => onPress(item)}>
          <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
            <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="cover" />
          </View>
          <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
            {item.title}
          </Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={
        <Text className="text-center text-gray-400 mt-20">{emptyText}</Text>
      }
    />
  );
}

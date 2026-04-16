import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { CoverImage } from './CoverImage';
import { EmptyState } from './EmptyState';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';

interface BookGridProps<T extends { id: string }> {
  items: T[];
  getCoverUri: (item: T) => string | null;
  getTitle: (item: T) => string;
  onPress: (item: T) => void;
  emptyText?: string;
  ListHeaderComponent?: React.ReactElement;
}

export function BookGrid<T extends { id: string }>({
  items,
  getCoverUri,
  getTitle,
  onPress,
  emptyText = 'No items found.',
  ListHeaderComponent,
}: BookGridProps<T>) {
  const { itemWidth } = useResponsiveGrid();

  return (
    <ScrollView contentContainerStyle={{ padding: 12 }}>
      {ListHeaderComponent}
      {items.length === 0 ? (
        <EmptyState message={emptyText} />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {items.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={{ width: itemWidth }}
              className="items-center px-1 mb-3"
              onPress={() => onPress(item)}
            >
              <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
                <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="cover" />
              </View>
              <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
                {getTitle(item)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

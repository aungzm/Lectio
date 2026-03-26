import React, { useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
  onEndReached?: () => void;
  loadingMore?: boolean;
}

export function BookGrid<T extends { id: string }>({
  items,
  getCoverUri,
  getTitle,
  onPress,
  emptyText = 'No items found.',
  ListHeaderComponent,
  onEndReached,
  loadingMore,
}: BookGridProps<T>) {
  const { numCols, itemWidth } = useResponsiveGrid();

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <TouchableOpacity
        style={{ width: itemWidth }}
        className="items-center px-1 mb-3"
        onPress={() => onPress(item)}
      >
        <View className="w-full overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="aspect-[2/3] bg-background p-2">
            <View className="h-full w-full overflow-hidden rounded-xl bg-border">
              <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="contain" />
            </View>
          </View>
          <View className="min-h-[74px] justify-between px-3 py-3">
            <Text className="text-center text-sm font-semibold leading-5 text-secondary" numberOfLines={2}>
              {getTitle(item)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [itemWidth, getCoverUri, getTitle, onPress],
  );

  const keyExtractor = useCallback((item: T) => item.id, []);

  const footer = loadingMore ? (
    <View className="py-4 items-center">
      <ActivityIndicator size="small" />
    </View>
  ) : null;

  if (items.length === 0 && !ListHeaderComponent) {
    return (
      <View style={{ padding: 12 }}>
        <EmptyState message={emptyText} />
      </View>
    );
  }

  return (
    <FlatList
      key={`book-grid-${numCols}`}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numCols}
      contentContainerStyle={{ padding: 12 }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyState message={emptyText} />}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

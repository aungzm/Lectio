import React, { useCallback, useMemo } from 'react';
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
  scrollEnabled?: boolean;
  contentPadding?: number;
  titleAlign?: 'center' | 'left';
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
  scrollEnabled = true,
  contentPadding = 12,
  titleAlign = 'center',
}: BookGridProps<T>) {
  const { numCols, itemWidth } = useResponsiveGrid();
  const rows = useMemo(() => {
    if (scrollEnabled) return [];

    const nextRows: T[][] = [];
    for (let index = 0; index < items.length; index += numCols) {
      nextRows.push(items.slice(index, index + numCols));
    }
    return nextRows;
  }, [items, numCols, scrollEnabled]);

  const renderItem = useCallback(
    ({ item }: { item: T }) => (
      <TouchableOpacity
        style={{ width: itemWidth }}
        className="mb-3 items-center px-1"
        onPress={() => onPress(item)}
      >
        <View className="w-full overflow-hidden rounded-2xl border border-border bg-surface">
          <View className="aspect-[2/3] bg-background p-2">
            <View className="h-full w-full overflow-hidden rounded-xl bg-border">
              <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="contain" />
            </View>
          </View>
          <View className="min-h-[52px] px-3 pb-2 pt-1.5">
            <Text
              className={`text-sm font-semibold leading-5 text-secondary ${titleAlign === 'center' ? 'text-center' : ''}`}
              numberOfLines={2}
            >
              {getTitle(item)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    ),
    [getCoverUri, getTitle, itemWidth, onPress, titleAlign],
  );

  const keyExtractor = useCallback((item: T) => item.id, []);

  const footer = loadingMore ? (
    <View className="py-4 items-center">
      <ActivityIndicator size="small" />
    </View>
  ) : null;

  if (items.length === 0 && !ListHeaderComponent) {
    return (
      <View style={{ padding: contentPadding }}>
        <EmptyState message={emptyText} />
      </View>
    );
  }

  if (!scrollEnabled) {
    return (
      <View style={{ padding: contentPadding }}>
        {ListHeaderComponent}
        {items.length === 0 ? (
          <EmptyState message={emptyText} />
        ) : (
          rows.map((row, rowIndex) => (
            <View key={`book-grid-row-${rowIndex}`} className="mb-3 flex-row">
              {row.map((item) => (
                <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>
              ))}
              {row.length < numCols
                ? Array.from({ length: numCols - row.length }).map((_, index) => (
                    <View
                      key={`book-grid-spacer-${rowIndex}-${index}`}
                      style={{ width: itemWidth }}
                    />
                  ))
                : null}
            </View>
          ))
        )}
        {footer}
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
      contentContainerStyle={{ padding: contentPadding }}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<EmptyState message={emptyText} />}
      ListFooterComponent={footer}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

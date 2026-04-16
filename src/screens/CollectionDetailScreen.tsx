import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import type { CollectionDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByCollection, loadingCollectionSeries, fetchCollectionSeries } = useBrowseStore();

  const series = seriesByCollection[collectionId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchCollectionSeries(provider, collectionId);
    }
  }, [collectionId, provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(book.id);
  }

  if (loadingCollectionSeries && series.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={series}
        getCoverUri={getCoverUri}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

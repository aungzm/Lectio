import React from 'react';
import { View } from 'react-native';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { CollectionDetailScreenProps } from '@/navigation/types';

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId } = route.params;
  const { seriesByCollection, loadingCollectionSeries, fetchCollectionSeries } = useBrowseStore();
  const getCoverUri = useCoverUri();

  const series = seriesByCollection[collectionId] ?? [];

  useProviderFetch((p) => fetchCollectionSeries(p, collectionId), [collectionId]);

  if (loadingCollectionSeries && series.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={series}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { CollectionDetailScreenProps } from '@/navigation/types';

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByCollection, loadingCollectionSeries, fetchCollectionSeries } = useBrowseStore();
  const getCoverUri = useCoverUri();

  const series = seriesByCollection[collectionId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchCollectionSeries(provider, collectionId);
    }
  }, [collectionId, provider]);

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

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { SeriesGrid } from '@/components/SeriesGrid';
import type { CollectionDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { seriesByCollection, isLoading, fetchCollectionSeries } = useBrowseStore();

  const series = seriesByCollection[collectionId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchCollectionSeries(serverConfig, auth.token, collectionId);
    }
  }, [collectionId, serverConfig, auth]);

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    return createProvider(serverConfig.providerType).getCoverUrl(
      serverConfig.serverUrl,
      book.id,
      auth.apiKey,
    );
  }

  if (isLoading && series.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SeriesGrid
        series={series}
        getCoverUri={getCoverUri}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

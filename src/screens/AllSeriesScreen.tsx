import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { SeriesGrid } from '@/components/SeriesGrid';
import type { AllSeriesScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function AllSeriesScreen({ navigation }: AllSeriesScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { allSeries, isLoading, fetchAllSeries } = useLibraryStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchAllSeries(serverConfig, auth.token, 0);
    }
  }, [serverConfig, auth]);

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    return createProvider(serverConfig.providerType).getCoverUrl(
      serverConfig.serverUrl,
      book.id,
      auth.apiKey,
    );
  }

  if (isLoading && allSeries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <SeriesGrid
        series={allSeries}
        getCoverUri={getCoverUri}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

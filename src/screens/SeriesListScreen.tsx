import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
import type { SeriesListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function SeriesListScreen({ route, navigation }: SeriesListScreenProps) {
  const { libraryId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { seriesByLibrary, isLoading, fetchSeries } = useLibraryStore();

  const series = seriesByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchSeries(serverConfig, auth.token, libraryId, 0);
    }
  }, [libraryId, serverConfig, auth]);

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
      <BookGrid
        books={series}
        getCoverUri={getCoverUri}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No books found."
      />
    </View>
  );
}

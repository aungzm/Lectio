import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import type { SeriesListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function SeriesListScreen({ route, navigation }: SeriesListScreenProps) {
  const { libraryId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByLibrary, loadingSeries, fetchSeries } = useLibraryStore();

  const series = seriesByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchSeries(provider, libraryId, 0);
    }
  }, [libraryId, provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(book.id);
  }

  if (loadingSeries && series.length === 0) {
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
        emptyText="No books found."
      />
    </View>
  );
}

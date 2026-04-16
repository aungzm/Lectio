import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { SeriesListScreenProps } from '@/navigation/types';

export default function SeriesListScreen({ route, navigation }: SeriesListScreenProps) {
  const { libraryId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByLibrary, loadingSeries, fetchSeries } = useLibraryStore();
  const getCoverUri = useCoverUri();

  const series = seriesByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchSeries(provider, libraryId, 0);
    }
  }, [libraryId, provider]);

  if (loadingSeries && series.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={series}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No books found."
      />
    </View>
  );
}

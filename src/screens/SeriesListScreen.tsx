import React from 'react';
import { View } from 'react-native';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { SeriesListScreenProps } from '@/navigation/types';

export default function SeriesListScreen({ route, navigation }: SeriesListScreenProps) {
  const { libraryId } = route.params;
  const { seriesByLibrary, loadingSeries, fetchSeries } = useLibraryStore();
  const getCoverUri = useCoverUri();

  const series = seriesByLibrary[libraryId] ?? [];

  useProviderFetch((p) => fetchSeries(p, libraryId, 0), [libraryId]);

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

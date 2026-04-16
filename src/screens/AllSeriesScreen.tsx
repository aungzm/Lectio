import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import type { AllSeriesScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function AllSeriesScreen({ navigation }: AllSeriesScreenProps) {
  const { provider } = useAuthStore();
  const { allSeries, loadingSeries, fetchAllSeries } = useLibraryStore();

  useEffect(() => {
    if (provider) {
      fetchAllSeries(provider, 0);
    }
  }, [provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(book.id);
  }

  if (loadingSeries && allSeries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={allSeries}
        getCoverUri={getCoverUri}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

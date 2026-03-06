import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { AllSeriesScreenProps } from '@/navigation/types';

export default function AllSeriesScreen({ navigation }: AllSeriesScreenProps) {
  const { provider } = useAuthStore();
  const { allSeries, loadingSeries, fetchAllSeries } = useLibraryStore();
  const getCoverUri = useCoverUri();

  useEffect(() => {
    if (provider) {
      fetchAllSeries(provider, 0);
    }
  }, [provider]);

  if (loadingSeries && allSeries.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={allSeries}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

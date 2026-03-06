import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { AuthorDetailScreenProps } from '@/navigation/types';

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByAuthor, loadingSeriesByAuthor, fetchSeriesByAuthor } = useBrowseStore();
  const getCoverUri = useCoverUri();

  const series = seriesByAuthor[authorId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchSeriesByAuthor(provider, authorId);
    }
  }, [authorId, provider]);

  if (loadingSeriesByAuthor && series.length === 0) {
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

import React from 'react';
import { View } from 'react-native';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { AuthorDetailScreenProps } from '@/navigation/types';

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { seriesByAuthor, loadingSeriesByAuthor, fetchSeriesByAuthor } = useBrowseStore();
  const getCoverUri = useCoverUri();

  const series = seriesByAuthor[authorId] ?? [];

  useProviderFetch((p) => fetchSeriesByAuthor(p, authorId), [authorId]);

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

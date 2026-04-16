import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { provider } = useAuthStore();
  const { seriesByAuthor, isLoading, fetchSeriesByAuthor } = useBrowseStore();

  const series = seriesByAuthor[authorId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchSeriesByAuthor(provider, authorId);
    }
  }, [authorId, provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(book.id);
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
        items={series}
        getCoverUri={getCoverUri}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
      />
    </View>
  );
}

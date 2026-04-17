import React from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBookDetailNavigation } from '@/hooks/useBookDetailNavigation';
import type { ReadListDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function ReadListDetailScreen({ route }: ReadListDetailScreenProps) {
  const { readListId } = route.params;
  const provider = useAuthStore((s) => s.provider);
  const { booksByReadList, loadingReadListBooks, fetchReadListBooks } = useBrowseStore();
  const handlePress = useBookDetailNavigation();

  const books = booksByReadList[readListId] ?? [];

  useProviderFetch((p) => fetchReadListBooks(p, readListId), [readListId]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    if (book.volumeId) {
      return provider.getVolumeCoverUrl?.(book.volumeId)
        ?? provider.getCoverUrl(book.seriesId ?? book.id);
    }
    return provider.getCoverUrl(book.seriesId ?? book.id);
  }

  if (loadingReadListBooks && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={books}
        getCoverUri={getCoverUri}
        getTitle={(book) => book.title}
        onPress={handlePress}
        emptyText="No books in this list."
      />
    </View>
  );
}

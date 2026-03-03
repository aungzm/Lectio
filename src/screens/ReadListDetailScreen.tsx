import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import type { ReadListDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function ReadListDetailScreen({ route, navigation }: ReadListDetailScreenProps) {
  const { readListId } = route.params;
  const { provider } = useAuthStore();
  const { booksByReadList, loadingReadListBooks, fetchReadListBooks } = useBrowseStore();

  const books = booksByReadList[readListId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchReadListBooks(provider, readListId);
    }
  }, [readListId, provider]);

  // Use volume cover for distinct images per entry; fall back to series cover
  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    if (book.volumeId) {
      return provider.getVolumeCoverUrl?.(book.volumeId)
        ?? provider.getCoverUrl(book.seriesId ?? book.id);
    }
    return provider.getCoverUrl(book.seriesId ?? book.id);
  }

  function handleRead(book: Book) {
    if (!provider) return;
    const epubUrl = provider.getEpubUrl(book.id);
    navigation.navigate('Reader', { chapterId: book.id, title: book.title, epubUrl });
  }

  if (loadingReadListBooks && books.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={books}
        getCoverUri={getCoverUri}
        getTitle={(book) => book.title}
        onPress={handleRead}
        emptyText="No books in this list."
      />
    </View>
  );
}

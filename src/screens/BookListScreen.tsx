import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import type { BookListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function BookListScreen({ route, navigation }: BookListScreenProps) {
  const { libraryId } = route.params;
  const { provider } = useAuthStore();
  const { booksByLibrary, loadingSeries, fetchLibraryBooks } = useLibraryStore();

  const books = booksByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchLibraryBooks(provider, libraryId, 0);
    }
  }, [libraryId, provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getBookCoverUrl?.(book.id) ?? null;
  }

  function handlePress(book: Book) {
    if (!provider) return;
    navigation.navigate('BookDetail', {
      chapterId: book.id,
      seriesId: book.seriesId ?? book.id,
      title: book.title,
    });
  }

  if (loadingSeries && books.length === 0) {
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
        getTitle={(item) => item.title}
        onPress={handlePress}
        emptyText="No books found."
      />
    </View>
  );
}

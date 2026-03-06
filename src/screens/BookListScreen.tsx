import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { BookListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function BookListScreen({ route, navigation }: BookListScreenProps) {
  const { libraryId } = route.params;
  const { provider } = useAuthStore();
  const { booksByLibrary, loadingSeries, fetchLibraryBooks } = useLibraryStore();
  const getCoverUri = useCoverUri('getBookCoverUrl');

  const books = booksByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (provider) {
      fetchLibraryBooks(provider, libraryId, 0);
    }
  }, [libraryId, provider]);

  function handlePress(book: Book) {
    if (!provider) return;
    navigation.navigate('BookDetail', {
      chapterId: book.id,
      seriesId: book.seriesId ?? book.id,
      title: book.title,
    });
  }

  if (loadingSeries && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={books}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={handlePress}
        emptyText="No books found."
      />
    </View>
  );
}

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
import type { BookListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function BookListScreen({ route, navigation }: BookListScreenProps) {
  const { libraryId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { booksByLibrary, isLoading, fetchLibraryBooks } = useLibraryStore();

  const books = booksByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchLibraryBooks(serverConfig, auth.token, libraryId, 0);
    }
  }, [libraryId, serverConfig, auth]);

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    return provider.getBookCoverUrl?.(serverConfig.serverUrl, book.id) ?? null;
  }

  function handlePress(book: Book) {
    if (!serverConfig || !auth) return;
    const provider = createProvider(serverConfig.providerType);
    const epubUrl = provider.getEpubUrl(serverConfig.serverUrl, auth.token, book.id);
    navigation.navigate('Reader', { chapterId: book.id, title: book.title, epubUrl });
  }

  if (isLoading && books.length === 0) {
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

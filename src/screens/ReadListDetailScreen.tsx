import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
import type { ReadListDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function ReadListDetailScreen({ route, navigation }: ReadListDetailScreenProps) {
  const { readListId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { booksByReadList, isLoading, fetchReadListBooks } = useBrowseStore();

  const books = booksByReadList[readListId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchReadListBooks(serverConfig, auth.token, readListId);
    }
  }, [readListId, serverConfig, auth]);

  // Use volume cover for distinct images per entry; fall back to series cover
  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType);
    if (book.volumeId) {
      return (provider as any).getVolumeCoverUrl?.(serverConfig.serverUrl, book.volumeId, auth.apiKey)
        ?? provider.getCoverUrl(serverConfig.serverUrl, book.seriesId ?? book.id, auth.apiKey);
    }
    return provider.getCoverUrl(serverConfig.serverUrl, book.seriesId ?? book.id, auth.apiKey);
  }

  function handleRead(book: Book) {
    if (!serverConfig || !auth) return;
    const epubUrl = createProvider(serverConfig.providerType).getEpubUrl(
      serverConfig.serverUrl,
      auth.token,
      book.id,
    );
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
        getTitle={(book) => book.title}
        onPress={handleRead}
        emptyText="No books in this list."
      />
    </View>
  );
}

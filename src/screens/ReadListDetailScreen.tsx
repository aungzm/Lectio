import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
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

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    return createProvider(serverConfig.providerType).getCoverUrl(
      serverConfig.serverUrl,
      book.id,
      auth.apiKey,
    );
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
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="flex-row items-center py-3 border-b border-gray-100"
            onPress={() => handleRead(item)}
          >
            <Text className="text-sm text-gray-400 w-7">{index + 1}</Text>
            <View className="w-10 h-14 bg-gray-200 rounded overflow-hidden mr-3">
              <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="cover" />
            </View>
            <View className="flex-1 mr-4">
              <Text className="text-base text-gray-900" numberOfLines={2}>
                {item.title}
              </Text>
              {item.pagesTotal > 0 ? (
                <Text className="text-xs text-gray-400 mt-0.5">
                  {item.pagesRead}/{item.pagesTotal} pages
                </Text>
              ) : null}
            </View>
            <Text className="text-primary-600 text-sm font-medium">Read</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No books in this list.</Text>
        }
      />
    </View>
  );
}

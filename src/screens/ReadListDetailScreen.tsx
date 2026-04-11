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
        numColumns={3}
        contentContainerClassName="px-3 py-3"
        columnWrapperClassName="gap-2 mb-3"
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-1 items-center" onPress={() => handleRead(item)}>
            <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
              <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No books in this list.</Text>
        }
      />
    </View>
  );
}

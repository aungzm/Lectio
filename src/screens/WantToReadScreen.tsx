import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useHomeStore } from '@/store/homeStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { Book } from '@/providers';

export default function WantToReadScreen() {
  const drawerNav = useNavigation<any>();
  const { serverConfig, auth } = useAuthStore();
  const { wantToRead, isLoading, fetchWantToRead } = useHomeStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchWantToRead(serverConfig, auth.token, 0);
    }
  }, [serverConfig, auth]);

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    return createProvider(serverConfig.providerType).getCoverUrl(
      serverConfig.serverUrl,
      book.id,
      auth.apiKey,
    );
  }

  function handlePress(book: Book) {
    drawerNav.navigate('Library', {
      screen: 'SeriesDetail',
      params: { seriesId: book.id, title: book.title },
    });
  }

  if (isLoading && wantToRead.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={wantToRead}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerClassName="px-3 py-3"
        columnWrapperClassName="gap-2 mb-3"
        renderItem={({ item }) => (
          <TouchableOpacity className="flex-1 items-center" onPress={() => handlePress(item)}>
            <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
              <CoverImage uri={getCoverUri(item)} className="w-full h-full" resizeMode="cover" />
            </View>
            <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20 px-8">
            <Text className="text-gray-400 text-center">Your Want to Read list is empty.</Text>
            <Text className="text-gray-300 text-sm text-center mt-2">
              Add series from Kavita to see them here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

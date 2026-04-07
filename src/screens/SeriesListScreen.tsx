import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { KavitaProvider } from '@/providers';
import type { SeriesListScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function SeriesListScreen({ route, navigation }: SeriesListScreenProps) {
  const { libraryId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { seriesByLibrary, isLoading, fetchSeries } = useLibraryStore();

  const series = seriesByLibrary[libraryId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchSeries(serverConfig, auth.token, libraryId, 0);
    }
  }, [libraryId, serverConfig, auth]);

  function getCover(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    const provider = new KavitaProvider();
    return provider.getCoverUrl(serverConfig.serverUrl, book.id, auth.apiKey);
  }

  function handlePress(book: Book) {
    navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
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
      <FlatList
        data={series}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerClassName="px-3 py-3"
        columnWrapperClassName="gap-2 mb-3"
        renderItem={({ item }) => {
          const coverUrl = getCover(item);
          return (
            <TouchableOpacity className="flex-1 items-center" onPress={() => handlePress(item)}>
              <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
                {coverUrl ? (
                  <Image source={{ uri: coverUrl }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-xs text-gray-400">No cover</Text>
                  </View>
                )}
              </View>
              <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No books found.</Text>
        }
      />
    </View>
  );
}

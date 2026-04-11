import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { Book } from '@/providers';
import type { AllSeriesScreenProps } from '@/navigation/types';

export default function AllSeriesScreen({ navigation }: AllSeriesScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { allSeries, isLoading, fetchAllSeries } = useLibraryStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchAllSeries(serverConfig, auth.token, 0);
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
    navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
  }

  if (isLoading && allSeries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={allSeries}
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
          <Text className="text-center text-gray-400 mt-20">No series found.</Text>
        }
      />
    </View>
  );
}

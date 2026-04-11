import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { seriesByAuthor, isLoading, fetchSeriesByAuthor } = useBrowseStore();

  const series = seriesByAuthor[authorId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchSeriesByAuthor(serverConfig, auth.token, authorId);
    }
  }, [authorId, serverConfig, auth]);

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
        renderItem={({ item }) => (
          <TouchableOpacity
            className="flex-1 items-center"
            onPress={() =>
              navigation.getParent()?.navigate('Library', {
                screen: 'SeriesDetail',
                params: { seriesId: item.id, title: item.title },
              })
            }
          >
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

import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { Volume } from '@/providers';
import type { VolumeWithSeries } from '@/store/browseStore';

// Mirrors the same logic in SeriesDetailScreen:
// Kavita uses a sentinel chapter number ≤ 0 for epub/pdf single-file volumes.
function isBookVolume(volume: Volume): boolean {
  return volume.chapters.length === 1 && Number(volume.chapters[0].number) <= 0;
}

function bookLabel(name: string | null | undefined, number: number): string {
  const parsed = name ? Number(name) : NaN;
  if (!isNaN(parsed) && parsed > 0) return `Book ${parsed}`;
  if (number > 0) return `Book ${number}`;
  return name || 'Book';
}

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { volumesByAuthor, isLoading, fetchVolumesByAuthor } = useBrowseStore();

  const volumes: VolumeWithSeries[] = volumesByAuthor[authorId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchVolumesByAuthor(serverConfig, auth.token, authorId);
    }
  }, [authorId, serverConfig, auth]);

  function getVolumeCoverUri(volume: VolumeWithSeries): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType);
    return provider.getVolumeCoverUrl?.(serverConfig.serverUrl, volume.id, auth.apiKey)
      ?? provider.getCoverUrl(serverConfig.serverUrl, volume.seriesId, auth.apiKey);
  }

  function handlePress(volume: VolumeWithSeries) {
    if (!serverConfig || !auth) return;
    const provider = createProvider(serverConfig.providerType);
    if (isBookVolume(volume)) {
      // Single epub/pdf — open reader directly
      const chapter = volume.chapters[0];
      const epubUrl = provider.getEpubUrl(serverConfig.serverUrl, auth.token, chapter.id);
      navigation.navigate('Reader', { chapterId: chapter.id, title: volume.seriesTitle, epubUrl });
    } else {
      // Multi-chapter (manga/comics) — open series detail
      navigation.navigate('SeriesDetail', { seriesId: volume.seriesId, title: volume.seriesTitle });
    }
  }

  if (isLoading && volumes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={volumes}
        keyExtractor={(item) => `${item.seriesId}-${item.id}`}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        columnWrapperStyle={{ marginBottom: 16 }}
        renderItem={({ item }) => {
          const label = isBookVolume(item)
            ? bookLabel(item.name, item.number)
            : item.name || `Vol. ${item.number}`;
          return (
            <TouchableOpacity style={{ width: '33.33%' }} className="items-center px-1" onPress={() => handlePress(item)}>
              <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
                <CoverImage uri={getVolumeCoverUri(item)} className="w-full h-full" resizeMode="cover" />
              </View>
              <Text className="text-xs text-gray-700 text-center" numberOfLines={1}>{label}</Text>
              <Text className="text-xs text-gray-400 text-center" numberOfLines={1}>{item.seriesTitle}</Text>
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

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { Volume } from '@/providers';

// Kavita uses -100000 (stored as the string "-100000") for the sentinel chapter
// that represents an entire epub/pdf book within a volume.
function isBookVolume(volume: Volume): boolean {
  return volume.chapters.length === 1 && Number(volume.chapters[0].number) <= 0;
}

function bookLabel(name: string | null | undefined, number: number): string {
  const parsed = name ? Number(name) : NaN;
  if (!isNaN(parsed) && parsed > 0) return `Book ${parsed}`;
  if (number > 0) return `Book ${number}`;
  return name || 'Book';
}

function volumeLabel(name: string | null | undefined, number: number): string {
  if (name) return name;
  if (number === 0) return 'Chapters';
  if (number < 0) return 'Specials';
  return `Volume ${number}`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

export default function SeriesDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { seriesId } = route.params as { seriesId: string; title: string };
  const { serverConfig, auth } = useAuthStore();
  const { volumes, isLoading, fetchVolumes } = useLibraryStore();

  const bookVolumes = volumes[seriesId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchVolumes(serverConfig, auth.token, seriesId);
    }
  }, [seriesId, serverConfig, auth]);

  const provider = serverConfig ? createProvider(serverConfig.providerType) : null;

  function getSeriesCoverUri(): string | null {
    if (!provider || !serverConfig || !auth) return null;
    return provider.getCoverUrl(serverConfig.serverUrl, seriesId, auth.apiKey);
  }

  function getVolumeCoverUri(volumeId: string): string | null {
    if (!provider || !serverConfig || !auth) return null;
    return provider.getVolumeCoverUrl?.(serverConfig.serverUrl, volumeId, auth.apiKey)
      ?? provider.getCoverUrl(serverConfig.serverUrl, seriesId, auth.apiKey);
  }

  function handleReadChapter(chapterId: string, title: string) {
    if (!serverConfig || !auth || !provider) return;
    const epubUrl = provider.getEpubUrl(serverConfig.serverUrl, auth.token, chapterId);
    navigation.navigate('Reader', { chapterId, title, epubUrl });
  }

  if (isLoading && bookVolumes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const singleBooks = bookVolumes.filter(isBookVolume);
  const multiChapterVolumes = bookVolumes.filter((v) => !isBookVolume(v));

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-10">
      {/* Hero */}
      <View className="items-center px-6 py-6 bg-gray-50 border-b border-gray-200">
        <View className="w-36 h-52 bg-gray-200 rounded-xl overflow-hidden shadow">
          <CoverImage uri={getSeriesCoverUri()} className="w-full h-full" resizeMode="cover" />
        </View>
      </View>

      {/* Book grid (epub/pdf series — each volume is one book) */}
      {singleBooks.length > 0 && (
        <View className="px-3 pt-4">
          {chunkArray(singleBooks, 3).map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-2 mb-4">
              {row.map((volume) => {
                const chapter = volume.chapters[0];
                const label = bookLabel(volume.name, volume.number);
                return (
                  <TouchableOpacity
                    key={volume.id}
                    className="flex-1 items-center"
                    onPress={() => handleReadChapter(chapter.id, label)}
                  >
                    <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
                      <CoverImage
                        uri={getVolumeCoverUri(volume.id)}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text className="text-xs text-gray-700 text-center" numberOfLines={1}>
                      {label}
                    </Text>
                    {chapter.pagesTotal > 0 && (
                      <Text className="text-xs text-gray-400 text-center">
                        {chapter.pagesRead}/{chapter.pagesTotal}p
                      </Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {/* Fill empty slots in last row */}
              {row.length < 3 &&
                Array(3 - row.length)
                  .fill(null)
                  .map((_, i) => <View key={`empty-${i}`} className="flex-1" />)}
            </View>
          ))}
        </View>
      )}

      {/* Multi-chapter volumes (manga/comics) */}
      {multiChapterVolumes.length > 0 && (
        <View className="px-4 pt-4">
          {multiChapterVolumes.map((volume) => (
            <View key={volume.id} className="mb-6">
              <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                {volumeLabel(volume.name, volume.number)}
              </Text>
              {volume.chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  onPress={() => handleReadChapter(chapter.id, chapter.title)}
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base text-gray-900" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    {chapter.pagesTotal > 0 && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {chapter.pagesRead}/{chapter.pagesTotal} pages
                      </Text>
                    )}
                  </View>
                  <Text className="text-primary-600 text-sm font-medium">Read</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {bookVolumes.length === 0 && (
        <Text className="text-center text-gray-400 mt-10">No chapters found.</Text>
      )}
    </ScrollView>
  );
}

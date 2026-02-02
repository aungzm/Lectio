import React, { useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { KavitaProvider } from '@/providers';
import type { SeriesDetailScreenProps } from '@/navigation/types';

export default function SeriesDetailScreen({ route, navigation }: SeriesDetailScreenProps) {
  const { seriesId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { volumes, isLoading, fetchVolumes } = useLibraryStore();

  const bookVolumes = volumes[seriesId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchVolumes(serverConfig, auth.token, seriesId);
    }
  }, [seriesId, serverConfig, auth]);

  function getCoverUrl(): string | null {
    if (!serverConfig || !auth) return null;
    const provider = new KavitaProvider();
    return provider.getCoverUrl(serverConfig.serverUrl, seriesId, auth.apiKey);
  }

  function handleReadChapter(chapterId: string, title: string) {
    if (!serverConfig || !auth) return;
    const provider = new KavitaProvider();
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

  const coverUrl = getCoverUrl();

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-10">
      <View className="items-center px-6 py-6 bg-gray-50 border-b border-gray-200">
        <View className="w-36 h-52 bg-gray-200 rounded-xl overflow-hidden mb-4 shadow">
          {coverUrl ? (
            <Image source={{ uri: coverUrl }} className="w-full h-full" resizeMode="cover" />
          ) : null}
        </View>
      </View>

      <View className="px-4 pt-5">
        {bookVolumes.map((volume) => (
          <View key={volume.id} className="mb-6">
            <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
              {volume.name || `Volume ${volume.number}`}
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
                  {chapter.pagesTotal > 0 ? (
                    <Text className="text-xs text-gray-400 mt-0.5">
                      {chapter.pagesRead}/{chapter.pagesTotal} pages
                    </Text>
                  ) : null}
                </View>
                <Text className="text-primary-600 text-sm font-medium">Read</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        {bookVolumes.length === 0 && (
          <Text className="text-center text-gray-400 mt-10">No chapters found.</Text>
        )}
      </View>
    </ScrollView>
  );
}

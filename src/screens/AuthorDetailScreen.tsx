import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { AuthorChapter } from '@/providers';

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId } = route.params;
  const { serverConfig, auth } = useAuthStore();
  const { chaptersByAuthor, isLoading, fetchChaptersByAuthor } = useBrowseStore();

  const chapters: AuthorChapter[] = chaptersByAuthor[authorId] ?? [];

  useEffect(() => {
    if (serverConfig && auth) {
      fetchChaptersByAuthor(serverConfig, auth.token, authorId, auth.apiKey);
    }
  }, [authorId, serverConfig, auth]);

  function handlePress(chapter: AuthorChapter) {
    if (!serverConfig || !auth) return;
    const provider = createProvider(serverConfig.providerType);
    const epubUrl = provider.getEpubUrl(serverConfig.serverUrl, auth.token, chapter.id);
    navigation.navigate('Reader', { chapterId: chapter.id, title: chapter.title, epubUrl });
  }

  if (isLoading && chapters.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={chapters}
        keyExtractor={(item) => item.id}
        numColumns={3}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12 }}
        columnWrapperStyle={{ marginBottom: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: '33.33%' }}
            className="items-center px-1"
            onPress={() => handlePress(item)}
          >
            <View className="w-full aspect-[2/3] bg-gray-200 rounded-lg overflow-hidden mb-1">
              {item.coverUrl ? (
                <Image
                  source={{ uri: item.coverUrl }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : null}
            </View>
            <Text className="text-xs text-gray-700 text-center" numberOfLines={2}>
              {item.title}
            </Text>
            {item.pagesTotal > 0 && (
              <Text className="text-xs text-gray-400 text-center">
                {item.pagesRead}/{item.pagesTotal}p
              </Text>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No books found.</Text>
        }
      />
    </View>
  );
}

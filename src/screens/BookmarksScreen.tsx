import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBookmarkStore } from '@/store/bookmarkStore';
import { useLibraryStore } from '@/store/libraryStore';
import type { BookmarksListScreenProps } from '@/navigation/types';
import type { Bookmark } from '@/providers';

export default function BookmarksScreen({ navigation }: BookmarksListScreenProps) {
  const { provider } = useAuthStore();
  const { bookmarksBySeriesId, isLoading, fetchBookmarks, removeBookmark } = useBookmarkStore();
  const { seriesByLibrary } = useLibraryStore();

  // Collect all series IDs we know about to fetch their bookmarks
  const knownSeriesIds = Object.values(seriesByLibrary)
    .flat()
    .map((b) => b.id);

  useEffect(() => {
    if (!provider || knownSeriesIds.length === 0) return;
    for (const seriesId of knownSeriesIds) {
      fetchBookmarks(provider, seriesId);
    }
  }, [provider, knownSeriesIds.join(',')]);

  // Flatten all bookmarks into one list
  const allBookmarks: Bookmark[] = Object.values(bookmarksBySeriesId).flat();

  function handleRead(bookmark: Bookmark) {
    if (!provider) return;
    navigation.navigate('BookDetail', {
      chapterId: bookmark.bookId,
      seriesId: bookmark.seriesId,
      title: bookmark.chapterTitle ?? 'Bookmarked chapter',
    });
  }

  function handleDelete(bookmark: Bookmark) {
    if (!provider) return;
    Alert.alert('Remove bookmark', 'Remove this bookmark?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeBookmark(provider, bookmark),
      },
    ]);
  }

  if (isLoading && allBookmarks.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={allBookmarks}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="py-3 border-b border-gray-100"
            onPress={() => handleRead(item)}
            onLongPress={() => handleDelete(item)}
          >
            <Text className="text-base text-gray-900" numberOfLines={1}>
              {item.chapterTitle ?? 'Unnamed chapter'}
            </Text>
            <Text className="text-sm text-gray-400 mt-0.5">Page {item.page + 1}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20 px-8">
            <Text className="text-gray-400 text-center">No bookmarks yet.</Text>
            <Text className="text-gray-300 text-sm text-center mt-2">
              Long-press a page in the reader to add a bookmark.
            </Text>
          </View>
        }
      />
    </View>
  );
}

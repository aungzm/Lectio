import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { LoadingScreen } from '@/components/LoadingScreen';
import { EmptyState } from '@/components/EmptyState';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { provider } = useAuthStore();
  const { libraries, loadingLibraries, fetchLibraries } = useLibraryStore();
  const { itemWidth } = useResponsiveGrid();

  useProviderFetch((p) => fetchLibraries(p));

  function getCoverUri(library: Library): string | null {
    if (!provider) return null;
    return provider.getLibraryCoverUrl?.(library.id) ?? null;
  }

  if (loadingLibraries && libraries.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {libraries.length === 0 ? (
          <EmptyState message="No libraries found." />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {libraries.map((library) => (
              <TouchableOpacity
                key={library.id}
                style={{ width: itemWidth }}
                className="items-center px-1 mb-3"
                onPress={() => {
                  navigation.navigate('SeriesScreen', {
                    libraryId: library.id,
                    libraryName: library.name,
                  });
                }}
              >
                <View className="w-full aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-1">
                  <ImageWithFallback
                    uri={getCoverUri(library)}
                    fallback={
                      <View className="flex-1 items-center justify-center">
                        <BookOpen size={40} color="#9ca3af" />
                      </View>
                    }
                  />
                </View>
                <Text className="text-xs text-gray-700 text-center font-medium" numberOfLines={2}>
                  {library.name}
                </Text>
                {library.bookCount != null && library.bookCount > 0 && (
                  <Text className="text-xs text-gray-400 text-center">
                    {library.bookCount} books
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

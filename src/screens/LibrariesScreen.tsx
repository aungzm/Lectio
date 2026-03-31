import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { LoadingScreen } from '@/components/LoadingScreen';
import { BookGrid } from '@/components/BookGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { provider } = useAuthStore();
  const { libraries, loadingLibraries, fetchLibraries } = useLibraryStore();

  useProviderFetch((p) => fetchLibraries(p));

  const totalBooks = useMemo(
    () => libraries.reduce((sum, library) => sum + (library.bookCount ?? 0), 0),
    [libraries],
  );

  function getCoverUri(library: Library): string | null {
    if (!provider) return null;
    return provider.getLibraryCoverUrl?.(library.id) ?? null;
  }

  if (loadingLibraries && libraries.length === 0) {
    return <LoadingScreen />;
  }

  const header = (
    <View className="px-4 pt-4 pb-3">
      <View className="relative overflow-hidden rounded-[30px] border border-border bg-surface px-5 py-5">
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-100" />
        <View className="absolute -left-8 top-16 h-20 w-20 rounded-full bg-primary-50" />

        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-3xl font-bold text-secondary">Libraries</Text>
            <Text className="mt-2 text-sm leading-6 text-tertiary">
              Pick a collection to jump into its series and keep browsing from a calmer, cleaner
              home base.
            </Text>
          </View>

          <View className="rounded-full border border-border bg-background px-3 py-3">
            <BookOpen size={18} color="#000000" />
          </View>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <View className="rounded-full border border-border bg-background px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'}
            </Text>
          </View>
          <View className="rounded-full border border-border bg-background px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
              {totalBooks} {totalBooks === 1 ? 'book' : 'books'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={libraries}
        getCoverUri={getCoverUri}
        getTitle={(library) => library.name}
        renderEmptyCover={() => (
          <View className="h-full w-full items-center justify-center bg-primary-50">
            <View className="mb-3 rounded-full bg-surface p-3">
              <BookOpen size={28} color="#0284c7" />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              No Cover
            </Text>
          </View>
        )}
        onPress={(library) => {
          navigation.navigate('SeriesScreen', {
            libraryId: library.id,
            libraryName: library.name,
          });
        }}
        emptyText="No libraries found."
        ListHeaderComponent={header}
        titleAlign="left"
      />
    </View>
  );
}

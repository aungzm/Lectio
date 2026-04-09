import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { BookGrid } from '@/components/BookGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { provider } = useAuthStore();
  const { libraries, loadingLibraries, fetchLibraries } = useLibraryStore();

  useProviderFetch((p) => fetchLibraries(p));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Libraries" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [navigation]);

  function getCoverUri(library: Library): string | null {
    if (!provider) return null;
    return provider.getLibraryCoverUrl?.(library.id) ?? null;
  }

  if (loadingLibraries && libraries.length === 0) {
    return <LoadingScreen />;
  }

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
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-3">
            <Chip label={`${libraries.length} ${libraries.length === 1 ? 'library' : 'libraries'}`} />
          </View>
        }
        titleAlign="left"
      />
    </View>
  );
}

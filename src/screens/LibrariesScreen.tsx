import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BookOpen, Search, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { AnimatedBrowseTopBar } from '@/components/AnimatedBrowseTopBar';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { BookGrid } from '@/components/BookGrid';
import { SearchBar } from '@/components/SearchBar';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useScrollAwareHeader } from '@/hooks/useScrollAwareHeader';
import { useThemeColors } from '@/theme/useThemeColors';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { provider } = useAuthStore();
  const { libraries, loadingLibraries, fetchLibraries } = useLibraryStore();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { accent, primary, secondary } = useThemeColors();
  const { headerVisible, handleScroll } = useScrollAwareHeader({
    lockedVisible: searchOpen,
  });

  useProviderFetch((p) => fetchLibraries(p));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearchText(searchText.trim().toLowerCase());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  const searchButtonActive = searchOpen || Boolean(searchText);

  function getCoverUri(library: Library): string | null {
    if (!provider) return null;
    return provider.getLibraryCoverUrl?.(library.id) ?? null;
  }

  const filteredLibraries = debouncedSearchText
    ? libraries.filter((library) => library.name.toLowerCase().includes(debouncedSearchText))
    : libraries;

  if (loadingLibraries && libraries.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <AnimatedBrowseTopBar
        title="Libraries"
        visible={headerVisible}
        leftSlot={<NavIconButton type="drawer" />}
        rightSlot={
          <Pressable
            onPress={() => setSearchOpen((value) => !value)}
            className={`rounded-full border px-3 py-3 ${
              searchButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
            }`}
          >
            {searchButtonActive ? <X size={18} color={primary} /> : <Search size={18} color={secondary} />}
          </Pressable>
        }
      />

      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-accent-soft">
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search libraries..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={filteredLibraries}
        getCoverUri={getCoverUri}
        getTitle={(library) => library.name}
        renderEmptyCover={() => (
          <View className="h-full w-full items-center justify-center bg-accent-soft">
            <View className="mb-3 rounded-full bg-surface p-3">
              <BookOpen size={28} color={accent} />
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
            <Chip
              label={`${filteredLibraries.length} ${filteredLibraries.length === 1 ? 'library' : 'libraries'}`}
            />
          </View>
        }
        titleAlign="left"
        onScroll={handleScroll}
      />
    </View>
  );
}

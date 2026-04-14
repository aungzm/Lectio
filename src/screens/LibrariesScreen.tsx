import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { BookOpen, Search, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { BookGrid } from '@/components/BookGrid';
import { SearchBar } from '@/components/SearchBar';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { provider } = useAuthStore();
  const { libraries, loadingLibraries, fetchLibraries } = useLibraryStore();
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const searchButtonActive = searchOpen || Boolean(searchText);

    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Libraries" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => (
        <Pressable
          onPress={() => setSearchOpen((value) => !value)}
          className={`rounded-full border px-3 py-3 ${
            searchButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
          }`}
        >
          {searchButtonActive ? <X size={18} color="#ffffff" /> : <Search size={18} color="#000000" />}
        </Pressable>
      ),
    });
  }, [navigation, searchOpen, searchText]);

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
      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-primary-50/80">
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search libraries..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={filteredLibraries}
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
            <Chip
              label={`${filteredLibraries.length} ${filteredLibraries.length === 1 ? 'library' : 'libraries'}`}
            />
          </View>
        }
        titleAlign="left"
      />
    </View>
  );
}

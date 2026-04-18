import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { ListChecks, Search, X } from 'lucide-react-native';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { BookGrid } from '@/components/BookGrid';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBrowseStore } from '@/store/browseStore';
import type { ReadListsScreenProps } from '@/navigation/types';

export default function ReadListsScreen({ navigation }: ReadListsScreenProps) {
  const { readLists, loadingReadLists, fetchReadLists } = useBrowseStore();
  const getCoverUri = useCoverUri('getReadListCoverUrl');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useProviderFetch((p) => fetchReadLists(p));

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
      headerTitle: () => <BrowseHeaderTitle label="Read Lists" />,
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

  const filteredReadLists = debouncedSearchText
    ? readLists.filter((list) => {
        const haystack = `${list.name} ${list.summary ?? ''}`.toLowerCase();
        return haystack.includes(debouncedSearchText);
      })
    : readLists;

  if (loadingReadLists && readLists.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-primary-50/80">
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search read lists..."
            />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={filteredReadLists}
        getCoverUri={(list) => getCoverUri(list.id)}
        getTitle={(list) => list.name}
        renderEmptyCover={() => (
          <View className="h-full w-full items-center justify-center bg-primary-50">
            <View className="mb-3 rounded-full bg-surface p-3">
              <ListChecks size={28} color="#0284c7" />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">No Cover</Text>
          </View>
        )}
        onPress={(list) =>
          navigation.navigate('ReadListDetail', { readListId: list.id, readListName: list.name })
        }
        emptyText="No reading lists found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Chip label={`${filteredReadLists.length} ${filteredReadLists.length === 1 ? 'list' : 'lists'}`} />
          </View>
        }
        titleAlign="left"
      />
    </View>
  );
}

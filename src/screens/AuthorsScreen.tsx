import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Search, User, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { BookGrid } from '@/components/BookGrid';
import { Chip } from '@/components/Chip';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useThemeColors } from '@/theme/useThemeColors';
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { provider } = useAuthStore();
  const { authors, loadingAuthors, fetchAuthors } = useBrowseStore();
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { muted, primary, secondary } = useThemeColors();

  useProviderFetch((p) => fetchAuthors(p, 0, searchText || undefined));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (provider) fetchAuthors(provider, 0, searchText || undefined);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText, provider, fetchAuthors]);

  function getAuthorCoverUri(author: Author): string | null {
    if (!provider) return null;
    return provider.getAuthorCoverUrl?.(author.id) ?? null;
  }

  useLayoutEffect(() => {
    const searchButtonActive = searchOpen || Boolean(searchText);

    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Authors" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => (
        <Pressable
          onPress={() => setSearchOpen((value) => !value)}
          className={`rounded-full border px-3 py-3 ${
            searchButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
          }`}
        >
          {searchButtonActive ? <X size={18} color={primary} /> : <Search size={18} color={secondary} />}
        </Pressable>
      ),
    });
  }, [navigation, searchOpen, searchText]);

  if (loadingAuthors && authors.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-4 pb-1">
          {searchOpen ? (
            <View className="mt-2 rounded-[26px] bg-accent-soft">
              <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search authors..." />
            </View>
          ) : null}
        </View>

        <FlatList
          data={[]}
          ListHeaderComponent={
            <View className="px-4 pb-3 pt-2">
              <Chip label="0 authors" />
            </View>
          }
          ListEmptyComponent={
            <View className="py-16 items-center">
              <ActivityIndicator size="large" />
            </View>
          }
          renderItem={() => null}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-accent-soft">
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search authors..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={authors}
        getCoverUri={getAuthorCoverUri}
        getTitle={(item) => item.name}
        onPress={(item) => navigation.navigate('AuthorDetail', { authorId: item.id, authorName: item.name })}
        renderEmptyCover={() => <User size={32} color={muted} />}
        emptyText="No authors found."
        cardVariant="author"
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Chip label={`${authors.length} ${authors.length === 1 ? 'author' : 'authors'}`} />
          </View>
        }
      />
    </View>
  );
}

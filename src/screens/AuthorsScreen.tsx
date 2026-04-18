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
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { provider } = useAuthStore();
  const { authors, loadingAuthors, fetchAuthors } = useBrowseStore();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useProviderFetch((p) => fetchAuthors(p, 0, search || undefined));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (provider) fetchAuthors(provider, 0, search || undefined);
    }, 250);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, provider, fetchAuthors]);

  function getAuthorCoverUri(author: Author): string | null {
    if (!provider) return null;
    return provider.getAuthorCoverUrl?.(author.id) ?? null;
  }

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Authors" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => (
        <Pressable
          onPress={() => setSearchOpen((value) => !value)}
          className={`rounded-full border px-3 py-3 ${
            searchOpen || search ? 'border-secondary bg-secondary' : 'border-border bg-primary'
          }`}
        >
          {searchOpen || search ? <X size={18} color="#ffffff" /> : <Search size={18} color="#000000" />}
        </Pressable>
      ),
    });
  }, [navigation, search, searchOpen]);

  if (loadingAuthors && authors.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="px-4 pb-1">
          {searchOpen ? (
            <View className="mt-2 rounded-[26px] bg-primary-50/80">
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search authors..." />
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
          <View className="mt-2 rounded-[26px] bg-primary-50/80">
            <SearchBar value={search} onChangeText={setSearch} placeholder="Search authors..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={authors}
        getCoverUri={getAuthorCoverUri}
        getTitle={(item) => item.name}
        onPress={(item) => navigation.navigate('AuthorDetail', { authorId: item.id, authorName: item.name })}
        renderEmptyCover={() => <User size={32} color="#9ca3af" />}
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

import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { Search, User, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { EmptyState } from '@/components/EmptyState';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { provider } = useAuthStore();
  const { authors, loadingAuthors, fetchAuthors } = useBrowseStore();
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { numCols, itemWidth } = useResponsiveGrid();
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
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View className="px-4 pt-2 pb-3">
              <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">0 authors</Text>
              {searchOpen ? (
                <View className="mt-3 rounded-2xl border border-border bg-surface">
                  <SearchBar value={search} onChangeText={setSearch} placeholder="Search authors..." />
                </View>
              ) : null}
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
      <FlatList
        key={`authors-grid-${numCols}`}
        data={authors}
        keyExtractor={(item) => item.id}
        numColumns={numCols}
        contentContainerStyle={{ padding: 12 }}
        ListHeaderComponent={
          <View className="px-4 pt-2 pb-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              {authors.length} {authors.length === 1 ? 'author' : 'authors'}
            </Text>
            {searchOpen ? (
              <View className="mt-3 rounded-2xl border border-border bg-surface">
                <SearchBar value={search} onChangeText={setSearch} placeholder="Search authors..." />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={<EmptyState message="No authors found." />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={{ width: itemWidth }}
            className="items-center px-1 mb-3"
            onPress={() => navigation.navigate('AuthorDetail', { authorId: item.id, authorName: item.name })}
          >
            <View className="w-full overflow-hidden rounded-[28px] border border-border bg-surface px-3 py-4">
              <View className="items-center">
                <View className="h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-2">
                  <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-border">
                    <ImageWithFallback
                      uri={getAuthorCoverUri(item)}
                      fallback={<User size={32} color="#9ca3af" />}
                    />
                  </View>
                </View>
                <Text className="mt-4 text-center text-sm font-semibold text-secondary" numberOfLines={2}>
                  {item.name}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { PenTool, User } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { BrowseTopBar } from '@/components/BrowseTopBar';
import { EmptyState } from '@/components/EmptyState';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { provider } = useAuthStore();
  const { authors, loadingAuthors, fetchAuthors } = useBrowseStore();
  const [search, setSearch] = useState('');
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

  const header = (
    <BrowseTopBar
      title="Authors"
      subtitle="Explore creators behind your library with search tucked neatly into the top bar."
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search authors..."
      resultCount={authors.length}
      resultLabel={authors.length === 1 ? 'author' : 'authors'}
    />
  );

  if (loadingAuthors && authors.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <FlatList
          data={[]}
          ListHeaderComponent={header}
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
        ListHeaderComponent={header}
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
                <View className="mt-2 self-center rounded-full bg-primary-50 px-3 py-1.5">
                  <Text className="text-xs font-medium capitalize text-accent" numberOfLines={1}>
                    {item.role || 'Author'}
                  </Text>
                </View>
                <View className="mt-4 flex-row items-center">
                  <PenTool size={14} color="#6b7280" />
                  <Text className="ml-2 text-xs text-tertiary">Open profile</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

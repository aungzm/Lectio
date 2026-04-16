import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { User } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { SearchBar } from '@/components/SearchBar';
import { EmptyState } from '@/components/EmptyState';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { provider } = useAuthStore();
  const { authors, loadingAuthors, fetchAuthors } = useBrowseStore();
  const [search, setSearch] = useState('');
  const { itemWidth } = useResponsiveGrid();

  useProviderFetch((p) => fetchAuthors(p, 0, search || undefined));

  function handleSearch(text: string) {
    setSearch(text);
    if (provider) {
      fetchAuthors(provider, 0, text || undefined);
    }
  }

  function getAuthorCoverUri(author: Author): string | null {
    if (!provider) return null;
    return provider.getAuthorCoverUrl?.(author.id) ?? null;
  }

  return (
    <View className="flex-1 bg-white">
      <SearchBar
        value={search}
        onChangeText={handleSearch}
        placeholder="Search authors…"
      />

      {loadingAuthors && authors.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
          {authors.length === 0 ? (
            <EmptyState message="No authors found." />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {authors.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={{ width: itemWidth }}
                  className="items-center px-2 mb-5"
                  onPress={() => navigation.navigate('AuthorDetail', { authorId: item.id, authorName: item.name })}
                >
                  <View className="w-full aspect-square rounded-full bg-gray-100 overflow-hidden items-center justify-center mb-2">
                    <ImageWithFallback
                      uri={getAuthorCoverUri(item)}
                      fallback={<User size={36} color="#9ca3af" />}
                    />
                  </View>
                  <Text className="text-sm text-gray-900 font-medium text-center" numberOfLines={2}>
                    {item.name}
                  </Text>
                  {item.role ? (
                    <Text className="text-xs text-gray-400 capitalize text-center" numberOfLines={1}>
                      {item.role}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

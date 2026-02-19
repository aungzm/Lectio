import React, { useEffect, useState } from 'react';
import { View, TextInput, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
import type { AuthorsScreenProps } from '@/navigation/types';
import type { Author } from '@/providers';

export default function AuthorsScreen({ navigation }: AuthorsScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { authors, isLoading, fetchAuthors } = useBrowseStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (serverConfig && auth) {
      fetchAuthors(serverConfig, auth.token, 0, search || undefined);
    }
  }, [serverConfig, auth]);

  function handleSearch(text: string) {
    setSearch(text);
    if (serverConfig && auth) {
      fetchAuthors(serverConfig, auth.token, 0, text || undefined);
    }
  }

  function getCoverUri(author: Author): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    return provider.getAuthorCoverUrl?.(serverConfig.serverUrl, author.id, auth.apiKey) ?? null;
  }

  if (isLoading && authors.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={authors}
        getCoverUri={getCoverUri}
        getTitle={(author) => author.name}
        onPress={(author) => navigation.navigate('AuthorDetail', { authorId: author.id, authorName: author.name })}
        emptyText="No authors found."
        ListHeaderComponent={
          <View className="pb-3">
            <TextInput
              className="bg-gray-100 rounded-lg px-4 py-2.5 text-base text-gray-900"
              placeholder="Search authors…"
              value={search}
              onChangeText={handleSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
          </View>
        }
      />
    </View>
  );
}

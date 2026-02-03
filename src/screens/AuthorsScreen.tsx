import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { CoverImage } from '@/components/CoverImage';
import { createProvider } from '@/store/authStore';
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

  function getAuthorCoverUri(author: Author): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    if (provider.getAuthorCoverUrl) {
      return provider.getAuthorCoverUrl(serverConfig.serverUrl, author.id, auth.apiKey);
    }
    return null;
  }

  function handlePress(author: Author) {
    navigation.navigate('AuthorDetail', { authorId: author.id, authorName: author.name });
  }

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 py-3 border-b border-gray-100">
        <TextInput
          className="bg-gray-100 rounded-lg px-4 py-2.5 text-base text-gray-900"
          placeholder="Search authors…"
          value={search}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {isLoading && authors.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={authors}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4"
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center py-3 border-b border-gray-100"
              onPress={() => handlePress(item)}
            >
              <View className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3">
                <CoverImage
                  uri={getAuthorCoverUri(item)}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
              <View className="flex-1">
                <Text className="text-base text-gray-900 font-medium">{item.name}</Text>
                <Text className="text-sm text-gray-400 capitalize">
                  {item.role}{item.seriesCount > 0 ? ` · ${item.seriesCount} series` : ''}
                </Text>
              </View>
              <Text className="text-gray-400 text-lg">›</Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-20">No authors found.</Text>
          }
        />
      )}
    </View>
  );
}

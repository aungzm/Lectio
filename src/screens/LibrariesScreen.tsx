import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

function LibraryCover({ uri }: { uri: string | null }) {
  const [errored, setErrored] = useState(false);
  if (!uri || errored) {
    return (
      <View className="flex-1 items-center justify-center">
        <BookOpen size={40} color="#9ca3af" />
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
}

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { libraries, isLoading, fetchLibraries } = useLibraryStore();
  const { width } = useWindowDimensions();
  const numCols = width >= 600 ? 4 : 3;
  const itemWidth = `${100 / numCols}%` as `${number}%`;

  useEffect(() => {
    if (serverConfig && auth) {
      fetchLibraries(serverConfig, auth.token);
    }
  }, [serverConfig, auth]);

  function getCoverUri(library: Library): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    return provider.getLibraryCoverUrl?.(serverConfig.serverUrl, library.id, auth.apiKey) ?? null;
  }

  if (isLoading && libraries.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {libraries.length === 0 ? (
          <Text className="text-center text-gray-400 mt-20">No libraries found.</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {libraries.map((library) => (
              <TouchableOpacity
                key={library.id}
                style={{ width: itemWidth }}
                className="items-center px-1 mb-3"
                onPress={() => {
                  const screen = serverConfig?.providerType === 'komga' ? 'BookList' : 'SeriesList';
                  navigation.navigate(screen, {
                    libraryId: library.id,
                    libraryName: library.name,
                  });
                }}
              >
                <View className="w-full aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-1">
                  <LibraryCover uri={getCoverUri(library)} />
                </View>
                <Text className="text-xs text-gray-700 text-center font-medium" numberOfLines={2}>
                  {library.name}
                </Text>
                {library.bookCount != null && library.bookCount > 0 && (
                  <Text className="text-xs text-gray-400 text-center">
                    {library.bookCount} books
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

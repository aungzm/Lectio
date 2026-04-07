import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import type { LibrariesScreenProps } from '@/navigation/types';
import type { Library } from '@/providers';

export default function LibrariesScreen({ navigation }: LibrariesScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { libraries, isLoading, fetchLibraries } = useLibraryStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchLibraries(serverConfig, auth.token);
    }
  }, [serverConfig, auth]);

  function handlePress(library: Library) {
    navigation.navigate('SeriesList', { libraryId: library.id, libraryName: library.name });
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
      <FlatList
        data={libraries}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4 gap-3"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-5 py-4 flex-row items-center justify-between"
            onPress={() => handlePress(item)}
          >
            <View>
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              <Text className="text-sm text-gray-500 mt-0.5">{item.bookCount} books</Text>
            </View>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No libraries found.</Text>
        }
      />
    </View>
  );
}

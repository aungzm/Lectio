import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import type { CollectionsScreenProps } from '@/navigation/types';
import type { Collection } from '@/providers';

export default function CollectionsScreen({ navigation }: CollectionsScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { collections, isLoading, fetchCollections } = useBrowseStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchCollections(serverConfig, auth.token);
    }
  }, [serverConfig, auth]);

  function handlePress(collection: Collection) {
    navigation.navigate('CollectionDetail', {
      collectionId: collection.id,
      collectionName: collection.name,
    });
  }

  if (isLoading && collections.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4 gap-3"
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-gray-100 rounded-xl px-5 py-4 flex-row items-center justify-between"
            onPress={() => handlePress(item)}
          >
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-gray-900">{item.name}</Text>
              {item.summary ? (
                <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
                  {item.summary}
                </Text>
              ) : null}
            </View>
            <Text className="text-gray-400 text-lg">›</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No collections found.</Text>
        }
      />
    </View>
  );
}

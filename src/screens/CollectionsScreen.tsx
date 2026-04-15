import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { CoverImage } from '@/components/CoverImage';
import { createProvider } from '@/store/authStore';
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

  function getCollectionCoverUri(collection: Collection): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    if (provider.getCollectionCoverUrl) {
      return provider.getCollectionCoverUrl(serverConfig.serverUrl, collection.id, auth.apiKey);
    }
    return null;
  }

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
        numColumns={2}
        contentContainerClassName="px-3 py-3"
        columnWrapperClassName="gap-3 mb-4"
        renderItem={({ item }) => (
          <TouchableOpacity className="w-1/2 px-1" onPress={() => handlePress(item)}>
            <View className="w-full aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden mb-2">
              <CoverImage
                uri={getCollectionCoverUri(item)}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <Text className="text-sm font-semibold text-gray-900 text-center" numberOfLines={2}>
              {item.name}
            </Text>
            {item.summary ? (
              <Text className="text-xs text-gray-400 text-center mt-0.5" numberOfLines={1}>
                {item.summary}
              </Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-20">No collections found.</Text>
        }
      />
    </View>
  );
}

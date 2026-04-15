import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
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

  function getCoverUri(collection: Collection): string | null {
    if (!serverConfig || !auth) return null;
    const provider = createProvider(serverConfig.providerType) as any;
    return provider.getCollectionCoverUrl?.(serverConfig.serverUrl, collection.id, auth.apiKey) ?? null;
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
      <BookGrid
        items={collections}
        getCoverUri={getCoverUri}
        getTitle={(collection) => collection.name}
        onPress={(collection) =>
          navigation.navigate('CollectionDetail', {
            collectionId: collection.id,
            collectionName: collection.name,
          })
        }
        emptyText="No collections found."
      />
    </View>
  );
}

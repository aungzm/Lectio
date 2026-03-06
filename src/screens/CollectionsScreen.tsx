import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { CollectionsScreenProps } from '@/navigation/types';

export default function CollectionsScreen({ navigation }: CollectionsScreenProps) {
  const { provider } = useAuthStore();
  const { collections, loadingCollections, fetchCollections } = useBrowseStore();
  const getCoverUri = useCoverUri('getCollectionCoverUrl');

  useEffect(() => {
    if (provider) {
      fetchCollections(provider);
    }
  }, [provider]);

  if (loadingCollections && collections.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={collections}
        getCoverUri={(collection) => getCoverUri(collection.id)}
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

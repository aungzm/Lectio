import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { Layers3 } from 'lucide-react-native';
import { BookGrid } from '@/components/BookGrid';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBrowseStore } from '@/store/browseStore';
import type { CollectionsScreenProps } from '@/navigation/types';

export default function CollectionsScreen({ navigation }: CollectionsScreenProps) {
  const { collections, loadingCollections, fetchCollections } = useBrowseStore();
  const getCoverUri = useCoverUri('getCollectionCoverUrl');

  useProviderFetch((p) => fetchCollections(p));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Collections" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [navigation]);

  if (loadingCollections && collections.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={collections}
        getCoverUri={(collection) => getCoverUri(collection.id)}
        getTitle={(collection) => collection.name}
        renderEmptyCover={() => (
          <View className="h-full w-full items-center justify-center bg-primary-50">
            <View className="mb-3 rounded-full bg-surface p-3">
              <Layers3 size={28} color="#0284c7" />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">No Cover</Text>
          </View>
        )}
        onPress={(collection) =>
          navigation.navigate('CollectionDetail', {
            collectionId: collection.id,
            collectionName: collection.name,
          })
        }
        emptyText="No collections found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <View className="self-start rounded-full border border-border bg-surface px-3 py-2">
              <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
                {collections.length} {collections.length === 1 ? 'collection' : 'collections'}
              </Text>
            </View>
          </View>
        }
        titleAlign="left"
      />
    </View>
  );
}

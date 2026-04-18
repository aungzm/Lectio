import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { BookGrid } from '@/components/BookGrid';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBrowseStore } from '@/store/browseStore';
import type { CollectionDetailScreenProps } from '@/navigation/types';

export default function CollectionDetailScreen({ route, navigation }: CollectionDetailScreenProps) {
  const { collectionId, collectionName } = route.params;
  const { seriesByCollection, loadingCollectionSeries, fetchCollectionSeries } = useBrowseStore();
  const getCoverUri = useCoverUri();

  const series = seriesByCollection[collectionId] ?? [];

  useProviderFetch((p) => fetchCollectionSeries(p, collectionId), [collectionId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label={collectionName} />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="back" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [collectionName, navigation]);

  if (loadingCollectionSeries && series.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={series}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              {series.length} {series.length === 1 ? 'result' : 'results'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

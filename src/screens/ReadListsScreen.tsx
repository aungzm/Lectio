import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { ListChecks } from 'lucide-react-native';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { BookGrid } from '@/components/BookGrid';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBrowseStore } from '@/store/browseStore';
import type { ReadListsScreenProps } from '@/navigation/types';

export default function ReadListsScreen({ navigation }: ReadListsScreenProps) {
  const { readLists, loadingReadLists, fetchReadLists } = useBrowseStore();
  const getCoverUri = useCoverUri('getReadListCoverUrl');

  useProviderFetch((p) => fetchReadLists(p));

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Read Lists" />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [navigation]);

  if (loadingReadLists && readLists.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={readLists}
        getCoverUri={(list) => getCoverUri(list.id)}
        getTitle={(list) => list.name}
        renderEmptyCover={() => (
          <View className="h-full w-full items-center justify-center bg-primary-50">
            <View className="mb-3 rounded-full bg-surface p-3">
              <ListChecks size={28} color="#0284c7" />
            </View>
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">No Cover</Text>
          </View>
        )}
        onPress={(list) =>
          navigation.navigate('ReadListDetail', { readListId: list.id, readListName: list.name })
        }
        emptyText="No reading lists found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Chip label={`${readLists.length} ${readLists.length === 1 ? 'list' : 'lists'}`} />
          </View>
        }
        titleAlign="left"
      />
    </View>
  );
}

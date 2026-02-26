import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import type { ReadListsScreenProps } from '@/navigation/types';
import type { ReadList } from '@/providers';

export default function ReadListsScreen({ navigation }: ReadListsScreenProps) {
  const { provider } = useAuthStore();
  const { readLists, isLoading, fetchReadLists } = useBrowseStore();

  useEffect(() => {
    if (provider) {
      fetchReadLists(provider);
    }
  }, [provider]);

  function getCoverUri(list: ReadList): string | null {
    if (!provider) return null;
    return provider.getReadListCoverUrl?.(list.id) ?? null;
  }

  if (isLoading && readLists.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={readLists}
        getCoverUri={getCoverUri}
        getTitle={(list) => list.name}
        onPress={(list) =>
          navigation.navigate('ReadListDetail', { readListId: list.id, readListName: list.name })
        }
        emptyText="No reading lists found."
      />
    </View>
  );
}

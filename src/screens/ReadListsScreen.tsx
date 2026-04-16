import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { ReadListsScreenProps } from '@/navigation/types';

export default function ReadListsScreen({ navigation }: ReadListsScreenProps) {
  const { provider } = useAuthStore();
  const { readLists, loadingReadLists, fetchReadLists } = useBrowseStore();
  const getCoverUri = useCoverUri('getReadListCoverUrl');

  useEffect(() => {
    if (provider) {
      fetchReadLists(provider);
    }
  }, [provider]);

  if (loadingReadLists && readLists.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={readLists}
        getCoverUri={(list) => getCoverUri(list.id)}
        getTitle={(list) => list.name}
        onPress={(list) =>
          navigation.navigate('ReadListDetail', { readListId: list.id, readListName: list.name })
        }
        emptyText="No reading lists found."
      />
    </View>
  );
}

import React, { useLayoutEffect } from 'react';
import { View, Text } from 'react-native';
import { BookGrid } from '@/components/BookGrid';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { useBookDetailNavigation } from '@/hooks/useBookDetailNavigation';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import type { ReadListDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

export default function ReadListDetailScreen({ route, navigation }: ReadListDetailScreenProps) {
  const { readListId, readListName } = route.params;
  const provider = useAuthStore((s) => s.provider);
  const { booksByReadList, loadingReadListBooks, fetchReadListBooks } = useBrowseStore();
  const handlePress = useBookDetailNavigation();

  const books = booksByReadList[readListId] ?? [];

  useProviderFetch((p) => fetchReadListBooks(p, readListId), [readListId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label={readListName} />,
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="back" />,
      headerRight: () => <View className="w-10" />,
    });
  }, [navigation, readListName]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getBookCoverUrl?.(book.id)
      ?? provider.getVolumeCoverUrl?.(book.volumeId ?? book.id)
      ?? provider.getCoverUrl(book.seriesId ?? book.id);
  }

  if (loadingReadListBooks && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={books}
        getCoverUri={getCoverUri}
        getTitle={(book) => book.title}
        onPress={handlePress}
        emptyText="No books in this list."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

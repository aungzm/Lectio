import React from 'react';
import { View } from 'react-native';
import { useLibraryStore } from '@/store/libraryStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useBookDetailNavigation } from '@/hooks/useBookDetailNavigation';
import type { BookListScreenProps } from '@/navigation/types';

export default function BookListScreen({ route }: BookListScreenProps) {
  const { libraryId } = route.params;
  const { booksByLibrary, loadingSeries, fetchLibraryBooks } = useLibraryStore();
  const getCoverUri = useCoverUri('getBookCoverUrl');
  const handlePress = useBookDetailNavigation();

  const books = booksByLibrary[libraryId] ?? [];

  useProviderFetch((p) => fetchLibraryBooks(p, libraryId, 0), [libraryId]);

  if (loadingSeries && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={books}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={handlePress}
        emptyText="No books found."
      />
    </View>
  );
}

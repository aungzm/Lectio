import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/providers';

/**
 * Returns a handler that navigates to BookDetail for a given book.
 * Used by screens that show a list of individual books (not series).
 */
export function useBookDetailNavigation() {
  const navigation = useNavigation<any>();
  const provider = useAuthStore((s) => s.provider);

  return useCallback(
    (book: Book) => {
      if (!provider) return;
      navigation.navigate('BookDetail', {
        chapterId: book.id,
        seriesId: book.seriesId ?? book.id,
        title: book.title,
      });
    },
    [provider, navigation],
  );
}

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BookOpen, Library, User } from 'lucide-react-native';
import { BookGrid } from '@/components/BookGrid';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SectionCard } from '@/components/SectionCard';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useThemeColors } from '@/theme/useThemeColors';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

function EmptySectionMessage({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-border bg-background px-4 py-6">
      <Text className="text-center text-sm text-tertiary">{message}</Text>
    </View>
  );
}

export default function AuthorDetailScreen({ route, navigation }: AuthorDetailScreenProps) {
  const { authorId, authorName } = route.params;
  const provider = useAuthStore((state) => state.provider);
  const {
    seriesByAuthor,
    booksByAuthor,
    loadingSeriesByAuthor,
    loadingBooksByAuthor,
    fetchSeriesByAuthor,
    fetchBooksByAuthor,
  } = useBrowseStore();

  const series = seriesByAuthor[authorId] ?? [];
  const books = booksByAuthor[authorId] ?? [];
  const { accentSoft, accentSoftStrong, muted, tertiary } = useThemeColors();

  useProviderFetch((currentProvider) => {
    fetchSeriesByAuthor(currentProvider, authorId);
    fetchBooksByAuthor(currentProvider, authorId);
  }, [authorId]);

  function getAuthorCoverUri(): string | null {
    if (!provider) return null;
    return provider.getAuthorCoverUrl?.(authorId) ?? null;
  }

  function getSeriesCoverUri(seriesId: string): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(seriesId);
  }

  function getBookCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getBookCoverUrl?.(book.id)
      ?? provider.getVolumeCoverUrl?.(book.volumeId ?? book.id)
      ?? provider.getCoverUrl(book.seriesId ?? book.id);
  }

  if ((loadingSeriesByAuthor || loadingBooksByAuthor) && series.length === 0 && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <View className="px-4 pt-4">
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
          <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-accent-soft-strong" />
          <View className="absolute -left-12 top-24 h-28 w-28 rounded-full bg-accent-soft" />

          <View className="items-center">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-2">
              <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-border">
                <ImageWithFallback
                  uri={getAuthorCoverUri()}
                  fallback={<User size={40} color={muted} />}
                />
              </View>
            </View>

            <Text className="mt-5 text-center text-3xl font-bold text-secondary" numberOfLines={3}>
              {authorName}
            </Text>

            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-3">
              <View className="min-w-[120px] rounded-2xl bg-background px-4 py-3">
                <View className="flex-row items-center justify-center gap-2">
                  <Library size={16} color={tertiary} />
                  <Text className="text-sm font-medium text-tertiary">Series</Text>
                </View>
                <Text className="mt-2 text-center text-xl font-bold text-secondary">{series.length}</Text>
              </View>
              <View className="min-w-[120px] rounded-2xl bg-background px-4 py-3">
                <View className="flex-row items-center justify-center gap-2">
                  <BookOpen size={16} color={tertiary} />
                  <Text className="text-sm font-medium text-tertiary">Books</Text>
                </View>
                <Text className="mt-2 text-center text-xl font-bold text-secondary">{books.length}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className="px-4 pt-4">
        <SectionCard title="Author's Series">
          {series.length > 0 ? (
            <BookGrid
              items={series}
              getCoverUri={(item) => getSeriesCoverUri(item.id)}
              getTitle={(item) => item.title}
              onPress={(item) =>
                navigation.navigate('SeriesDetail', { seriesId: item.id, title: item.title })
              }
              scrollEnabled={false}
              contentPadding={0}
              titleAlign="left"
            />
          ) : (
            <EmptySectionMessage message="No series found for this author." />
          )}
        </SectionCard>

        <SectionCard title="Author's Books">
          {books.length > 0 ? (
            <BookGrid
              items={books}
              getCoverUri={getBookCoverUri}
              getTitle={(item) => item.title}
              onPress={(item) =>
                navigation.navigate('BookDetail', {
                  chapterId: item.id,
                  seriesId: item.seriesId ?? item.id,
                  title: item.title,
                })
              }
              scrollEnabled={false}
              contentPadding={0}
              titleAlign="left"
            />
          ) : (
            <EmptySectionMessage message="No books found for this author." />
          )}
        </SectionCard>
      </View>
    </ScrollView>
  );
}

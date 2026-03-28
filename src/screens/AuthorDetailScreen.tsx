import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import type { DimensionValue } from 'react-native';
import { BookOpen, Library, User } from 'lucide-react-native';
import { CoverImage } from '@/components/CoverImage';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SectionCard } from '@/components/SectionCard';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import { useAuthStore } from '@/store/authStore';
import { useBrowseStore } from '@/store/browseStore';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { AuthorDetailScreenProps } from '@/navigation/types';
import type { Book } from '@/providers';

function chunkArray<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }
  return rows;
}

function EmptySectionMessage({ message }: { message: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-border bg-background px-4 py-6">
      <Text className="text-center text-sm text-tertiary">{message}</Text>
    </View>
  );
}

function GridCard({
  title,
  subtitle,
  coverUri,
  onPress,
}: {
  title: string;
  subtitle: string;
  coverUri: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="px-1">
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="aspect-[2/3] bg-background p-2">
          <View className="h-full w-full overflow-hidden rounded-xl bg-border">
            <CoverImage uri={coverUri} className="h-full w-full" resizeMode="contain" />
          </View>
        </View>
        <View className="min-h-[88px] justify-between px-3 py-3">
          <Text className="text-sm font-semibold leading-6 text-secondary" numberOfLines={2}>
            {title}
          </Text>
          <Text className="mt-2 text-xs text-tertiary" numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CardGrid<T extends { id: string }>({
  items,
  numCols,
  cardWidth,
  renderCard,
}: {
  items: T[];
  numCols: number;
  cardWidth: DimensionValue;
  renderCard: (item: T) => React.ReactNode;
}) {
  const rows = chunkArray(items, numCols);

  if (items.length === 0) return null;

  return (
    <View>
      {rows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} className="mb-3 flex-row">
          {row.map((item) => (
            <View key={item.id} style={{ width: cardWidth }}>
              {renderCard(item)}
            </View>
          ))}
          {row.length < numCols
            ? Array.from({ length: numCols - row.length }).map((_, index) => (
                <View key={`spacer-${rowIndex}-${index}`} style={{ width: cardWidth }} />
              ))
            : null}
        </View>
      ))}
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
  const { numCols, itemWidth } = useResponsiveGrid();

  const series = seriesByAuthor[authorId] ?? [];
  const books = booksByAuthor[authorId] ?? [];

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

  function formatSeriesSubtitle(item: Book): string {
    const count = item.pagesTotal;
    return `${count} ${count === 1 ? 'book' : 'books'}`;
  }

  function formatBookSubtitle(_item: Book): string {
    return '';
  }

  if ((loadingSeriesByAuthor || loadingBooksByAuthor) && series.length === 0 && books.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <View className="px-4 pt-4">
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
          <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary-100" />
          <View className="absolute -left-12 top-24 h-28 w-28 rounded-full bg-primary-50" />

          <View className="items-center">
            <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-border bg-background p-2">
              <View className="h-full w-full items-center justify-center overflow-hidden rounded-full bg-border">
                <ImageWithFallback
                  uri={getAuthorCoverUri()}
                  fallback={<User size={40} color="#9ca3af" />}
                />
              </View>
            </View>

            <Text className="mt-5 text-center text-3xl font-bold text-secondary" numberOfLines={3}>
              {authorName}
            </Text>

            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-3">
              <View className="min-w-[120px] rounded-2xl bg-background px-4 py-3">
                <View className="flex-row items-center justify-center gap-2">
                  <Library size={16} color="#6b7280" />
                  <Text className="text-sm font-medium text-tertiary">Series</Text>
                </View>
                <Text className="mt-2 text-center text-xl font-bold text-secondary">{series.length}</Text>
              </View>
              <View className="min-w-[120px] rounded-2xl bg-background px-4 py-3">
                <View className="flex-row items-center justify-center gap-2">
                  <BookOpen size={16} color="#6b7280" />
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
            <CardGrid
              items={series}
              numCols={numCols}
              cardWidth={itemWidth}
              renderCard={(item) => (
                <GridCard
                  title={item.title}
                  subtitle={formatSeriesSubtitle(item)}
                  coverUri={getSeriesCoverUri(item.id)}
                  onPress={() => navigation.navigate('SeriesDetail', { seriesId: item.id, title: item.title })}
                />
              )}
            />
          ) : (
            <EmptySectionMessage message="No series found for this author." />
          )}
        </SectionCard>

        <SectionCard title="Author's Books">
          {books.length > 0 ? (
            <CardGrid
              items={books}
              numCols={numCols}
              cardWidth={itemWidth}
              renderCard={(item) => (
                <GridCard
                  title={item.title}
                  subtitle={formatBookSubtitle(item)}
                  coverUri={getBookCoverUri(item)}
                  onPress={() =>
                    navigation.navigate('BookDetail', {
                      chapterId: item.id,
                      seriesId: item.seriesId ?? item.id,
                      title: item.title,
                    })
                  }
                />
              )}
            />
          ) : (
            <EmptySectionMessage message="No books found for this author." />
          )}
        </SectionCard>
      </View>
    </ScrollView>
  );
}

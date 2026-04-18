import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  Compass,
  Library,
  Sparkles,
} from 'lucide-react-native';
import { useHomeStore } from '@/store/homeStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/providers';
import type { HomeStackParamList } from '@/navigation/types';

type HomeNav = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

function SectionShell({
  title,
  subtitle,
  icon,
  actionLabel = 'View all',
  onPress,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onPress?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="mb-6 rounded-[28px] border border-border bg-surface py-5">
      <View className="mb-4 flex-row items-start justify-between px-4">
        <View className="mr-3 flex-1">
          <View className="mb-2 flex-row items-center">
            <View className="mr-2 rounded-full bg-primary-50 p-2">{icon}</View>
            <Text className="text-lg font-bold text-secondary">{title}</Text>
          </View>
          <Text className="text-sm leading-5 text-tertiary">{subtitle}</Text>
        </View>
        {onPress ? (
          <Pressable onPress={onPress} className="flex-row items-center rounded-full bg-background px-3 py-2">
            <Text className="text-sm font-medium text-secondary">{actionLabel}</Text>
            <ChevronRight size={16} color="#000000" strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function HorizontalShelfCard({
  book,
  onPress,
  getCoverUri,
}: {
  book: Book;
  onPress: () => void;
  getCoverUri: (id: string) => string | null;
}) {
  return (
    <TouchableOpacity className="mr-3 w-36" onPress={onPress}>
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="aspect-[2/3] bg-background p-2">
          <View className="h-full w-full overflow-hidden rounded-xl bg-border">
            <CoverImage uri={getCoverUri(book.id)} className="h-full w-full" resizeMode="contain" />
          </View>
        </View>
        <View className="min-h-[52px] px-3 pb-2 pt-1.5">
          <Text className="text-sm font-semibold leading-5 text-secondary" numberOfLines={2}>
            {book.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function FeaturedContinueCard({
  book,
  onPress,
  getCoverUri,
  loading,
}: {
  book: Book;
  onPress: () => void;
  getCoverUri: (id: string) => string | null;
  loading?: boolean;
}) {
  const pagesLeft = Math.max(book.pagesTotal - book.pagesRead, 0);
  const progress = book.pagesTotal > 0 ? Math.min(book.pagesRead / book.pagesTotal, 1) : 0;

  return (
    <TouchableOpacity onPress={onPress} disabled={loading} className="mx-4 overflow-hidden rounded-2xl border border-border bg-background">
      <View className="flex-row p-4">
        <View className="mr-4 h-40 w-28 rounded-xl bg-background p-2">
          <View className="h-full w-full overflow-hidden rounded-lg bg-border">
            <CoverImage uri={getCoverUri(book.id)} className="h-full w-full" resizeMode="contain" />
          </View>
          {loading ? (
            <View className="absolute inset-0 items-center justify-center bg-secondary/20">
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : null}
        </View>
        <View className="flex-1 justify-between">
          <View>
            <View className="mb-2 self-start rounded-full bg-primary-50 px-3 py-2">
              <Text className="text-xs font-semibold text-accent">In Progress</Text>
            </View>
            <Text className="text-xl font-bold text-secondary" numberOfLines={2}>
              {book.title}
            </Text>
            <Text className="mt-2 text-sm leading-5 text-tertiary" numberOfLines={3}>
              {book.metadata.summary?.trim() || 'Pick up exactly where you left off.'}
            </Text>
          </View>

          <View className="mt-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-medium uppercase tracking-wide text-tertiary">
                Progress
              </Text>
              <Text className="text-xs font-medium text-secondary">
                {book.pagesRead}/{book.pagesTotal || '?'} pages
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-border">
              <View
                className="h-full rounded-full bg-accent"
                style={{ width: `${Math.max(progress * 100, 6)}%` }}
              />
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-xs text-tertiary">
                {pagesLeft > 0 ? `${pagesLeft} pages left` : 'Ready to finish'}
              </Text>
              <View className="rounded-full bg-secondary px-4 py-2">
                <Text className="text-xs font-semibold text-primary">Resume reading</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function HorizontalShelf({
  data,
  onPress,
  getCoverUri,
}: {
  data: Book[];
  onPress: (book: Book) => void;
  getCoverUri: (id: string) => string | null;
}) {
  return (
    <FlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerClassName="px-4"
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <HorizontalShelfCard
          book={item}
          onPress={() => onPress(item)}
          getCoverUri={getCoverUri}
        />
      )}
    />
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <View className="mx-4 items-center rounded-[24px] border border-dashed border-border bg-background px-5 py-8">
      <View className="rounded-full bg-primary-50 p-4">{icon}</View>
      <Text className="mt-4 text-base font-semibold text-secondary">{title}</Text>
      <Text className="mt-1 text-center text-sm leading-5 text-tertiary">{description}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<HomeNav>();
  const {
    recentlyAdded,
    recentlyAddedBooks,
    continueReading,
    recentlyUpdatedSeries,
    loadingHome,
    fetchHomeData,
  } = useHomeStore();
  const getCoverUri = useCoverUri();
  const getBookCoverUri = useCoverUri('getBookCoverUrl');
  const provider = useAuthStore((state) => state.provider);
  const [loadingContinueId, setLoadingContinueId] = React.useState<string | null>(null);

  useProviderFetch((p) => fetchHomeData(p));

  const navigateDrawer = useCallback((screen: string) => {
    nav.dispatch(DrawerActions.jumpTo(screen));
  }, [nav]);

  const handleSeriesPress = useCallback((book: Book) => {
    nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
  }, [nav]);

  const handleBookPress = useCallback((book: Book) => {
    nav.navigate('BookDetail', {
      chapterId: book.id,
      seriesId: book.seriesId ?? book.id,
      title: book.title,
    });
  }, [nav]);

  const handleContinueReadingPress = useCallback(async (book: Book) => {
    if (!provider?.getContinuePoint) {
      nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
      return;
    }

    setLoadingContinueId(book.id);
    try {
      const point = await provider.getContinuePoint(book.id);
      if (point) {
        nav.navigate('BookDetail', {
          chapterId: point.chapterId,
          seriesId: book.id,
          title: point.title,
        });
      } else {
        nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
      }
    } catch {
      nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
    } finally {
      setLoadingContinueId(null);
    }
  }, [nav, provider]);

  const featuredContinue = continueReading[0] ?? null;
  const remainingContinue = useMemo(() => continueReading.slice(1), [continueReading]);

  if (loadingHome && recentlyAdded.length === 0 && continueReading.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="px-4 pb-8 pt-4">
      <View className="relative mb-6 overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
        <View className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary-100" />
        <View className="absolute -left-8 top-24 h-24 w-24 rounded-full bg-primary-50" />

        <View className="mb-4">
          <View className="mb-3 self-start rounded-full bg-primary-50 px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-wide text-accent">
              Library hub
            </Text>
          </View>
          <Text className="text-3xl font-bold text-secondary">Find your next session</Text>
          <Text className="mt-2 text-sm leading-6 text-tertiary">
            Jump back into active reads, catch fresh arrivals, and see what changed across your shelves.
          </Text>
        </View>

        <View className="flex-row flex-wrap gap-3">
          <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
              In Progress
            </Text>
            <Text className="mt-1 text-sm font-semibold text-secondary">
              {continueReading.length} active
            </Text>
          </View>
          <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
              New Series
            </Text>
            <Text className="mt-1 text-sm font-semibold text-secondary">
              {recentlyAdded.length} arrivals
            </Text>
          </View>
          <View className="min-w-[30%] flex-1 rounded-2xl border border-border bg-background px-3 py-3">
            <Text className="text-[11px] font-bold uppercase tracking-wide text-tertiary">
              Updated
            </Text>
            <Text className="mt-1 text-sm font-semibold text-secondary">
              {recentlyUpdatedSeries.length} refreshed
            </Text>
          </View>
        </View>
      </View>

      <SectionShell
        title="Continue Reading"
        subtitle="Pick up where momentum already exists."
        icon={<Clock3 size={18} color="#0ea5e9" />}
        onPress={() => navigateDrawer('Library')}
      >
        {featuredContinue ? (
          <>
            <FeaturedContinueCard
              book={featuredContinue}
              onPress={() => handleContinueReadingPress(featuredContinue)}
              getCoverUri={getCoverUri}
              loading={loadingContinueId === featuredContinue.id}
            />
            {remainingContinue.length > 0 ? (
              <View className="mt-4">
                <HorizontalShelf
                  data={remainingContinue}
                  onPress={handleContinueReadingPress}
                  getCoverUri={getCoverUri}
                />
              </View>
            ) : null}
          </>
        ) : (
          <EmptyState
            title="Nothing in progress yet"
            description="Start a book or series and it will appear here for quick access."
            icon={<BookOpen size={22} color="#0ea5e9" />}
          />
        )}
      </SectionShell>

      <SectionShell
        title="Recently Added Series"
        subtitle="New worlds and runs that just landed in your library."
        icon={<Sparkles size={18} color="#0ea5e9" />}
        onPress={() => navigateDrawer('Series')}
      >
        {recentlyAdded.length > 0 ? (
          <HorizontalShelf
            data={recentlyAdded}
            onPress={handleSeriesPress}
            getCoverUri={getCoverUri}
          />
        ) : (
          <EmptyState
            title="No recently added series"
            description="Fresh series will show up here as soon as your provider syncs them."
            icon={<Sparkles size={22} color="#0ea5e9" />}
          />
        )}
      </SectionShell>

      <SectionShell
        title="Recently Added Books"
        subtitle="New individual books ready to open right away."
        icon={<BookOpen size={18} color="#0ea5e9" />}
        onPress={() => navigateDrawer('Books')}
      >
        {recentlyAddedBooks.length > 0 ? (
          <HorizontalShelf
            data={recentlyAddedBooks}
            onPress={handleBookPress}
            getCoverUri={getBookCoverUri}
          />
        ) : (
          <EmptyState
            title="No recently added books"
            description="Once new books are available, they will appear in this shelf."
            icon={<Library size={22} color="#0ea5e9" />}
          />
        )}
      </SectionShell>

      <SectionShell
        title="Recently Updated Series"
        subtitle="Series with new movement since your last check-in."
        icon={<Compass size={18} color="#0ea5e9" />}
        onPress={() => navigateDrawer('Series')}
      >
        {recentlyUpdatedSeries.length > 0 ? (
          <HorizontalShelf
            data={recentlyUpdatedSeries}
            onPress={handleSeriesPress}
            getCoverUri={getCoverUri}
          />
        ) : (
          <EmptyState
            title="No recent updates"
            description="Updated series will appear here when new chapters or files arrive."
            icon={<Compass size={22} color="#0ea5e9" />}
          />
        )}
      </SectionShell>
    </ScrollView>
  );
}

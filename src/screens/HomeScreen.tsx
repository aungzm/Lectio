import React, { useCallback } from 'react';
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
import { ChevronRight } from 'lucide-react-native';
import { useHomeStore } from '@/store/homeStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useAuthStore } from '@/store/authStore';
import type { Book } from '@/providers';
import type { HomeStackParamList } from '@/navigation/types';


type HomeNav = NativeStackNavigationProp<HomeStackParamList, 'HomeScreen'>;

function SeriesCard({ book, onPress, getCoverUri, loading }: {
  book: Book;
  onPress: () => void;
  getCoverUri: (id: string) => string | null;
  loading?: boolean;
}) {
  return (
    <TouchableOpacity className="w-28 mr-3" onPress={onPress} disabled={loading}>
      <View className="w-28 h-40 bg-border rounded-xl overflow-hidden mb-1.5">
        <CoverImage uri={getCoverUri(book.id)} className="w-full h-full" resizeMode="cover" />
        {loading && (
          <View className="absolute inset-0 bg-secondary/20 items-center justify-center">
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>
      <Text className="text-xs text-secondary font-medium" numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, data, onPress, getCoverUri, emptyText, loadingId, onViewMore }: {
  title: string;
  data: Book[];
  onPress: (b: Book) => void;
  getCoverUri: (id: string) => string | null;
  emptyText?: string;
  loadingId?: string | null;
  onViewMore?: () => void;
}) {
  if (data.length === 0 && emptyText) return null;

  return (
    <View className="mb-8">
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-lg font-bold text-secondary">{title}</Text>
        {onViewMore && (
          <Pressable onPress={onViewMore} className="flex-row items-center gap-0.5 active:opacity-60">
            <Text className="text-sm font-medium text-tertiary">View All</Text>
            <ChevronRight size={16} color="#6b7280" strokeWidth={2} />
          </Pressable>
        )}
      </View>
      {data.length === 0 ? (
        <Text className="text-muted px-4 text-sm">{emptyText}</Text>
      ) : (
        <FlatList
          horizontal
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4"
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <SeriesCard
              book={item}
              onPress={() => onPress(item)}
              getCoverUri={getCoverUri}
              loading={loadingId === item.id}
            />
          )}
        />
      )}
    </View>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<HomeNav>();
  const { recentlyAdded, continueReading, recentlyUpdatedSeries, loadingHome, fetchHomeData } = useHomeStore();
  const getCoverUri = useCoverUri();
  const provider = useAuthStore((s) => s.provider);
  const [loadingContinueId, setLoadingContinueId] = React.useState<string | null>(null);

  useProviderFetch((p) => fetchHomeData(p));

  const navigateDrawer = useCallback((screen: string) => {
    nav.dispatch(DrawerActions.jumpTo(screen));
  }, [nav]);

  const handleSeriesPress = useCallback((book: Book) => {
    nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
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

  if (loadingHome && recentlyAdded.length === 0 && continueReading.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-6">
      <Section
        title="Continue Reading"
        data={continueReading}
        onPress={handleContinueReadingPress}
        getCoverUri={getCoverUri}
        emptyText="Nothing in progress yet."
        loadingId={loadingContinueId}
        onViewMore={() => navigateDrawer('Library')}
      />

      <Section
        title="Recently Added Series"
        data={recentlyAdded}
        onPress={handleSeriesPress}
        getCoverUri={getCoverUri}
        emptyText="No recently added series."
        onViewMore={() => navigateDrawer('Series')}
      />
      <Section
        title="Recently Updated Series"
        data={recentlyUpdatedSeries}
        onPress={handleSeriesPress}
        getCoverUri={getCoverUri}
        emptyText="No recently updated series."
        onViewMore={() => navigateDrawer('Series')}
      />
    </ScrollView>
  );
}

import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
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
      <View className="w-28 h-40 bg-gray-200 rounded-lg overflow-hidden mb-1">
        <CoverImage uri={getCoverUri(book.id)} className="w-full h-full" resizeMode="cover" />
        {loading && (
          <View className="absolute inset-0 bg-black/20 items-center justify-center">
            <ActivityIndicator color="#fff" />
          </View>
        )}
      </View>
      <Text className="text-xs text-gray-700" numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, data, onPress, getCoverUri, emptyText, loadingId }: {
  title: string;
  data: Book[];
  onPress: (b: Book) => void;
  getCoverUri: (id: string) => string | null;
  emptyText?: string;
  loadingId?: string | null;
}) {
  if (data.length === 0 && emptyText) return null;

  return (
    <View className="mb-6">
      <Text className="text-lg font-semibold text-gray-900 px-4 mb-3">{title}</Text>
      {data.length === 0 ? (
        <Text className="text-gray-400 px-4 text-sm">{emptyText}</Text>
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
  const isKavita = useAuthStore((s) => s.serverConfig?.providerType === 'kavita');
  const [loadingContinueId, setLoadingContinueId] = React.useState<string | null>(null);

  useProviderFetch((p) => fetchHomeData(p));

  const handleSeriesPress = useCallback((book: Book) => {
    nav.navigate('SeriesDetail', { seriesId: book.id, title: book.title });
  }, [nav]);

  const handleContinueReadingPress = useCallback(async (book: Book) => {
    if (!provider?.getContinuePoint) {
      // Fallback to series page if provider doesn't support continue point
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
        // No continue point found — go to series page
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
    <ScrollView className="flex-1 bg-white" contentContainerClassName="py-4">
      <Section
        title="Continue Reading"
        data={continueReading}
        onPress={handleContinueReadingPress}
        getCoverUri={getCoverUri}
        emptyText="Nothing in progress yet."
        loadingId={loadingContinueId}
      />

      {!isKavita && (
        <Section
          title="Recently Added Books"
          data={[]}
          onPress={handleSeriesPress}
          getCoverUri={getCoverUri}
          emptyText="No recently added books."
        />
      )}
      <Section
        title="Recently Added Series"
        data={recentlyAdded}
        onPress={handleSeriesPress}
        getCoverUri={getCoverUri}
        emptyText="No recently added series."
      />
      <Section
        title="Recently Updated Series"
        data={recentlyUpdatedSeries}
        onPress={handleSeriesPress}
        getCoverUri={getCoverUri}
        emptyText="No recently updated series."
      />
    </ScrollView>
  );
}

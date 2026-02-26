import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useHomeStore } from '@/store/homeStore';
import { CoverImage } from '@/components/CoverImage';
import type { Book } from '@/providers';

function SeriesCard({ book, onPress, getCoverUri }: {
  book: Book;
  onPress: () => void;
  getCoverUri: (b: Book) => string | null;
}) {
  return (
    <TouchableOpacity className="w-28 mr-3" onPress={onPress}>
      <View className="w-28 h-40 bg-gray-200 rounded-lg overflow-hidden mb-1">
        <CoverImage uri={getCoverUri(book)} className="w-full h-full" resizeMode="cover" />
      </View>
      <Text className="text-xs text-gray-700" numberOfLines={2}>{book.title}</Text>
    </TouchableOpacity>
  );
}

function Section({ title, data, onPress, getCoverUri, emptyText }: {
  title: string;
  data: Book[];
  onPress: (b: Book) => void;
  getCoverUri: (b: Book) => string | null;
  emptyText?: string;
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
            <SeriesCard book={item} onPress={() => onPress(item)} getCoverUri={getCoverUri} />
          )}
        />
      )}
    </View>
  );
}

export default function HomeScreen() {
  const drawerNav = useNavigation<any>();
  const { provider } = useAuthStore();
  const { recentlyAdded, continueReading, isLoading, fetchHomeData } = useHomeStore();

  useEffect(() => {
    if (provider) {
      fetchHomeData(provider);
    }
  }, [provider]);

  function getCoverUri(book: Book): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(book.id);
  }

  function handlePress(book: Book) {
    drawerNav.navigate('Library', {
      screen: 'SeriesDetail',
      params: { seriesId: book.id, title: book.title },
    });
  }

  if (isLoading && recentlyAdded.length === 0 && continueReading.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="py-4">
      <Section
        title="Continue Reading"
        data={continueReading}
        onPress={handlePress}
        getCoverUri={getCoverUri}
        emptyText="Nothing in progress yet."
      />
      <Section
        title="Recently Added"
        data={recentlyAdded}
        onPress={handlePress}
        getCoverUri={getCoverUri}
        emptyText="No recently added series."
      />
    </ScrollView>
  );
}

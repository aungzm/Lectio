import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useHomeStore } from '@/store/homeStore';
import { createProvider } from '@/store/authStore';
import { BookGrid } from '@/components/BookGrid';
import type { Book } from '@/providers';
import type { WantToReadScreenProps } from '@/navigation/types';

export default function WantToReadScreen({ navigation }: WantToReadScreenProps) {
  const { serverConfig, auth } = useAuthStore();
  const { wantToRead, isLoading, fetchWantToRead } = useHomeStore();

  useEffect(() => {
    if (serverConfig && auth) {
      fetchWantToRead(serverConfig, auth.token, 0);
    }
  }, [serverConfig, auth]);

  function getCoverUri(book: Book): string | null {
    if (!serverConfig || !auth) return null;
    return createProvider(serverConfig.providerType).getCoverUrl(
      serverConfig.serverUrl,
      book.id,
      auth.apiKey,
    );
  }

  if (isLoading && wantToRead.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={wantToRead}
        getCoverUri={getCoverUri}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="Your Want to Read list is empty."
      />
    </View>
  );
}

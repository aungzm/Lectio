import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useHomeStore } from '@/store/homeStore';
import { BookGrid } from '@/components/BookGrid';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { WantToReadScreenProps } from '@/navigation/types';

export default function WantToReadScreen({ navigation }: WantToReadScreenProps) {
  const { provider } = useAuthStore();
  const { wantToRead, loadingWantToRead, fetchWantToRead } = useHomeStore();
  const getCoverUri = useCoverUri();

  useEffect(() => {
    if (provider) {
      fetchWantToRead(provider, 0);
    }
  }, [provider]);

  if (loadingWantToRead && wantToRead.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={wantToRead}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="Your Want to Read list is empty."
      />
    </View>
  );
}

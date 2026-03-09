import React from 'react';
import SeriesDetailScreen from '@/screens/SeriesDetailScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';

/**
 * Adds the shared detail screens (SeriesDetail, BookDetail, Reader) to any stack navigator.
 * These appear in almost every navigation stack with identical configuration.
 * Parent navigator's screenOptions handle header styling — no per-screen overrides needed.
 */
export function commonScreens(Stack: any) {
  return (
    <>
      <Stack.Screen name="SeriesDetail" component={SeriesDetailScreen} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} />
      <Stack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </>
  );
}

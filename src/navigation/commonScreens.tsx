import React from 'react';
import SeriesDetailScreen from '@/screens/SeriesDetailScreen';
import BookDetailScreen from '@/screens/BookDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';

/**
 * Adds the shared detail screens (SeriesDetail, BookDetail, Reader) to any stack navigator.
 * These appear in almost every navigation stack with identical configuration.
 */
export function commonScreens(Stack: any) {
  return (
    <>
      <Stack.Screen
        name="SeriesDetail"
        component={SeriesDetailScreen}
        options={({ route }: any) => ({ title: route.params.title })}
      />
      <Stack.Screen
        name="BookDetail"
        component={BookDetailScreen}
        options={({ route }: any) => ({ title: route.params.title })}
      />
      <Stack.Screen
        name="Reader"
        component={ReaderScreen}
        options={{ headerShown: false }}
      />
    </>
  );
}

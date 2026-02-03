import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import type {
  RootStackParamList,
  MainTabParamList,
  LibraryStackParamList,
  BrowseStackParamList,
  BookmarksStackParamList,
} from './types';

import LoginScreen from '@/screens/LoginScreen';
import LibrariesScreen from '@/screens/LibrariesScreen';
import SeriesListScreen from '@/screens/SeriesListScreen';
import SeriesDetailScreen from '@/screens/SeriesDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import BrowseScreen from '@/screens/BrowseScreen';
import AuthorsScreen from '@/screens/AuthorsScreen';
import AuthorDetailScreen from '@/screens/AuthorDetailScreen';
import CollectionsScreen from '@/screens/CollectionsScreen';
import CollectionDetailScreen from '@/screens/CollectionDetailScreen';
import ReadListsScreen from '@/screens/ReadListsScreen';
import ReadListDetailScreen from '@/screens/ReadListDetailScreen';
import BookmarksScreen from '@/screens/BookmarksScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const BrowseStack = createNativeStackNavigator<BrowseStackParamList>();
const BookmarksStack = createNativeStackNavigator<BookmarksStackParamList>();

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen name="Libraries" component={LibrariesScreen} options={{ title: 'Libraries' }} />
      <LibraryStack.Screen
        name="SeriesList"
        component={SeriesListScreen}
        options={({ route }) => ({ title: route.params.libraryName })}
      />
      <LibraryStack.Screen
        name="SeriesDetail"
        component={SeriesDetailScreen}
        options={({ route }) => ({ title: route.params.title })}
      />
      <LibraryStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </LibraryStack.Navigator>
  );
}

function BrowseNavigator() {
  return (
    <BrowseStack.Navigator>
      <BrowseStack.Screen name="BrowseHub" component={BrowseScreen} options={{ title: 'Browse' }} />
      <BrowseStack.Screen name="Authors" component={AuthorsScreen} options={{ title: 'Authors' }} />
      <BrowseStack.Screen
        name="AuthorDetail"
        component={AuthorDetailScreen}
        options={({ route }) => ({ title: route.params.authorName })}
      />
      <BrowseStack.Screen name="Collections" component={CollectionsScreen} options={{ title: 'Collections' }} />
      <BrowseStack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={({ route }) => ({ title: route.params.collectionName })}
      />
      <BrowseStack.Screen name="ReadLists" component={ReadListsScreen} options={{ title: 'Reading Lists' }} />
      <BrowseStack.Screen
        name="ReadListDetail"
        component={ReadListDetailScreen}
        options={({ route }) => ({ title: route.params.readListName })}
      />
      <BrowseStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </BrowseStack.Navigator>
  );
}

function BookmarksNavigator() {
  return (
    <BookmarksStack.Navigator>
      <BookmarksStack.Screen name="BookmarksList" component={BookmarksScreen} options={{ title: 'Bookmarks' }} />
      <BookmarksStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </BookmarksStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Library"
        component={LibraryNavigator}
        options={{ tabBarLabel: 'Library' }}
      />
      <Tab.Screen
        name="Browse"
        component={BrowseNavigator}
        options={{ tabBarLabel: 'Browse' }}
      />
      <Tab.Screen
        name="Bookmarks"
        component={BookmarksNavigator}
        options={{ tabBarLabel: 'Bookmarks' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: 'Settings', headerShown: true, headerTitle: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainTabs} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

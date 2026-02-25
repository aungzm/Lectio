import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator, DrawerToggleButton } from '@react-navigation/drawer';
import { useAuthStore } from '@/store/authStore';
import type {
  RootStackParamList,
  MainDrawerParamList,
  HomeStackParamList,
  LibraryStackParamList,
  AllSeriesStackParamList,
  AuthorsStackParamList,
  CollectionsStackParamList,
  ReadListsStackParamList,
  WantToReadStackParamList,
} from './types';

import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import LibrariesScreen from '@/screens/LibrariesScreen';
import SeriesListScreen from '@/screens/SeriesListScreen';
import BookListScreen from '@/screens/BookListScreen';
import SeriesDetailScreen from '@/screens/SeriesDetailScreen';
import ReaderScreen from '@/screens/ReaderScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import AllSeriesScreen from '@/screens/AllSeriesScreen';
import AuthorsScreen from '@/screens/AuthorsScreen';
import AuthorDetailScreen from '@/screens/AuthorDetailScreen';
import CollectionsScreen from '@/screens/CollectionsScreen';
import CollectionDetailScreen from '@/screens/CollectionDetailScreen';
import ReadListsScreen from '@/screens/ReadListsScreen';
import ReadListDetailScreen from '@/screens/ReadListDetailScreen';
import WantToReadScreen from '@/screens/WantToReadScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const AllSeriesStack = createNativeStackNavigator<AllSeriesStackParamList>();
const AuthorsStack = createNativeStackNavigator<AuthorsStackParamList>();
const CollectionsStack = createNativeStackNavigator<CollectionsStackParamList>();
const ReadListsStack = createNativeStackNavigator<ReadListsStackParamList>();
const WantToReadStack = createNativeStackNavigator<WantToReadStackParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'Home', headerLeft: () => <DrawerToggleButton tintColor="black" /> }}
      />
    </HomeStack.Navigator>
  );
}

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator>
      <LibraryStack.Screen name="Libraries" component={LibrariesScreen} options={{ title: 'Libraries', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <LibraryStack.Screen
        name="SeriesList"
        component={SeriesListScreen}
        options={({ route }) => ({ title: route.params.libraryName })}
      />
      <LibraryStack.Screen
        name="BookList"
        component={BookListScreen}
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

function AllSeriesNavigator() {
  return (
    <AllSeriesStack.Navigator>
      <AllSeriesStack.Screen name="AllSeries" component={AllSeriesScreen} options={{ title: 'Series', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <AllSeriesStack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <AllSeriesStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </AllSeriesStack.Navigator>
  );
}

function AuthorsNavigator() {
  return (
    <AuthorsStack.Navigator>
      <AuthorsStack.Screen name="AuthorsList" component={AuthorsScreen} options={{ title: 'Authors', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <AuthorsStack.Screen
        name="AuthorDetail"
        component={AuthorDetailScreen}
        options={({ route }) => ({ title: route.params.authorName })}
      />
      <AuthorsStack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <AuthorsStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </AuthorsStack.Navigator>
  );
}

function CollectionsNavigator() {
  return (
    <CollectionsStack.Navigator>
      <CollectionsStack.Screen name="CollectionsList" component={CollectionsScreen} options={{ title: 'Collections', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <CollectionsStack.Screen
        name="CollectionDetail"
        component={CollectionDetailScreen}
        options={({ route }) => ({ title: route.params.collectionName })}
      />
      <CollectionsStack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <CollectionsStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </CollectionsStack.Navigator>
  );
}

function ReadListsNavigator() {
  return (
    <ReadListsStack.Navigator>
      <ReadListsStack.Screen name="ReadLists" component={ReadListsScreen} options={{ title: 'Reading Lists', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <ReadListsStack.Screen
        name="ReadListDetail"
        component={ReadListDetailScreen}
        options={({ route }) => ({ title: route.params.readListName })}
      />
      <ReadListsStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </ReadListsStack.Navigator>
  );
}

function WantToReadNavigator() {
  return (
    <WantToReadStack.Navigator>
      <WantToReadStack.Screen name="WantToReadList" component={WantToReadScreen} options={{ title: 'Want to Read', headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
      <WantToReadStack.Screen name="SeriesDetail" component={SeriesDetailScreen} options={({ route }) => ({ title: route.params.title })} />
      <WantToReadStack.Screen name="Reader" component={ReaderScreen} options={{ headerShown: false }} />
    </WantToReadStack.Navigator>
  );
}

function MainDrawer() {
  const providerType = useAuthStore((s) => s.serverConfig?.providerType);
  const isKavita = providerType === 'kavita';

  return (
    <Drawer.Navigator screenOptions={{ headerShown: false, drawerType: 'slide' }}>
      <Drawer.Screen name="Home" component={HomeNavigator} options={{ title: 'Home' }} />
      <Drawer.Screen name="Library" component={LibraryNavigator} options={{ title: 'Library' }} />
      <Drawer.Screen name="Series" component={AllSeriesNavigator} options={{ title: 'Series' }} />
      <Drawer.Screen name="Authors" component={AuthorsNavigator} options={{ title: 'Authors' }} />
      <Drawer.Screen name="Collections" component={CollectionsNavigator} options={{ title: 'Collections' }} />
      <Drawer.Screen name="ReadList" component={ReadListsNavigator} options={{ title: 'Read List' }} />
      {isKavita && (
        <Drawer.Screen name="WantToRead" component={WantToReadNavigator} options={{ title: 'Want to Read' }} />
      )}
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings', headerShown: true, headerLeft: () => <DrawerToggleButton tintColor="black" /> }} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Main" component={MainDrawer} />
        ) : (
          <RootStack.Screen name="Login" component={LoginScreen} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

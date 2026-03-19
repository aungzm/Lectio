import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useAuthStore } from '@/store/authStore';
import DrawerContent from '@/components/DrawerContent';
import NavIconButton from '@/components/NavIconButton';
import { commonScreens } from './commonScreens';
import type {
  RootStackParamList,
  MainDrawerParamList,
  HomeStackParamList,
  LibraryStackParamList,
  SeriesStackParamList,
  BooksStackParamList,
  AuthorsStackParamList,
  CollectionsStackParamList,
  ReadListsStackParamList,
} from './types';

import HomeScreen from '@/screens/HomeScreen';
import LoginScreen from '@/screens/LoginScreen';
import LibrariesScreen from '@/screens/LibrariesScreen';
import SeriesScreen from '@/screens/SeriesScreen';
import BookListScreen from '@/screens/BookListScreen';
import BooksScreen from '@/screens/BooksScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import AuthorsScreen from '@/screens/AuthorsScreen';
import AuthorDetailScreen from '@/screens/AuthorDetailScreen';
import CollectionsScreen from '@/screens/CollectionsScreen';
import CollectionDetailScreen from '@/screens/CollectionDetailScreen';
import ReadListsScreen from '@/screens/ReadListsScreen';
import ReadListDetailScreen from '@/screens/ReadListDetailScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const LibraryStack = createNativeStackNavigator<LibraryStackParamList>();
const SeriesStack = createNativeStackNavigator<SeriesStackParamList>();
const BooksStack = createNativeStackNavigator<BooksStackParamList>();
const AuthorsStack = createNativeStackNavigator<AuthorsStackParamList>();
const CollectionsStack = createNativeStackNavigator<CollectionsStackParamList>();
const ReadListsStack = createNativeStackNavigator<ReadListsStackParamList>();

const cleanHeader: NativeStackNavigationOptions = {
  title: '',
  headerShadowVisible: false,
  headerStyle: { backgroundColor: '#f9fafb' },
};

const drawerRootScreen: NativeStackNavigationOptions = {
  ...cleanHeader,
  headerLeft: () => <NavIconButton type="drawer" />,
};

const subScreen: NativeStackNavigationOptions = {
  ...cleanHeader,
  headerLeft: () => <NavIconButton type="back" />,
};

function HomeNavigator() {
  return (
    <HomeStack.Navigator screenOptions={subScreen}>
      <HomeStack.Screen name="HomeScreen" component={HomeScreen} options={drawerRootScreen} />
      {commonScreens(HomeStack)}
    </HomeStack.Navigator>
  );
}

function LibraryNavigator() {
  return (
    <LibraryStack.Navigator screenOptions={subScreen}>
      <LibraryStack.Screen name="Libraries" component={LibrariesScreen} options={drawerRootScreen} />
      <LibraryStack.Screen name="SeriesScreen" component={SeriesScreen} />
      <LibraryStack.Screen name="BookList" component={BookListScreen} />
      {commonScreens(LibraryStack)}
    </LibraryStack.Navigator>
  );
}

function SeriesNavigator() {
  return (
    <SeriesStack.Navigator screenOptions={subScreen}>
      <SeriesStack.Screen name="SeriesScreen" component={SeriesScreen} options={drawerRootScreen} />
      {commonScreens(SeriesStack)}
    </SeriesStack.Navigator>
  );
}

function BooksNavigator() {
  return (
    <BooksStack.Navigator screenOptions={subScreen}>
      <BooksStack.Screen name="BooksScreen" component={BooksScreen} options={drawerRootScreen} />
      {commonScreens(BooksStack)}
    </BooksStack.Navigator>
  );
}

function AuthorsNavigator() {
  return (
    <AuthorsStack.Navigator screenOptions={subScreen}>
      <AuthorsStack.Screen name="AuthorsList" component={AuthorsScreen} options={drawerRootScreen} />
      <AuthorsStack.Screen name="AuthorDetail" component={AuthorDetailScreen} />
      {commonScreens(AuthorsStack)}
    </AuthorsStack.Navigator>
  );
}

function CollectionsNavigator() {
  return (
    <CollectionsStack.Navigator screenOptions={subScreen}>
      <CollectionsStack.Screen name="CollectionsList" component={CollectionsScreen} options={drawerRootScreen} />
      <CollectionsStack.Screen name="CollectionDetail" component={CollectionDetailScreen} />
      {commonScreens(CollectionsStack)}
    </CollectionsStack.Navigator>
  );
}

function ReadListsNavigator() {
  return (
    <ReadListsStack.Navigator screenOptions={subScreen}>
      <ReadListsStack.Screen name="ReadLists" component={ReadListsScreen} options={drawerRootScreen} />
      <ReadListsStack.Screen name="ReadListDetail" component={ReadListDetailScreen} />
      {commonScreens(ReadListsStack)}
    </ReadListsStack.Navigator>
  );
}

function MainDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'slide', drawerStyle: { width: 280 } }}
    >
      <Drawer.Screen name="Home" component={HomeNavigator} />
      <Drawer.Screen name="Library" component={LibraryNavigator} />
      <Drawer.Screen name="Series" component={SeriesNavigator} />
      <Drawer.Screen name="Books" component={BooksNavigator} />
      <Drawer.Screen name="Authors" component={AuthorsNavigator} />
      <Drawer.Screen name="Collections" component={CollectionsNavigator} />
      <Drawer.Screen name="ReadList" component={ReadListsNavigator} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: '', headerShadowVisible: false, headerStyle: { backgroundColor: '#f9fafb' }, headerLeft: () => <NavIconButton type="drawer" /> }} />
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

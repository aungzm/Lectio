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
      <LibraryStack.Screen name="SeriesList" component={SeriesListScreen} />
      <LibraryStack.Screen name="BookList" component={BookListScreen} />
      {commonScreens(LibraryStack)}
    </LibraryStack.Navigator>
  );
}

function AllSeriesNavigator() {
  return (
    <AllSeriesStack.Navigator screenOptions={subScreen}>
      <AllSeriesStack.Screen name="AllSeries" component={AllSeriesScreen} options={drawerRootScreen} />
      {commonScreens(AllSeriesStack)}
    </AllSeriesStack.Navigator>
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

function WantToReadNavigator() {
  return (
    <WantToReadStack.Navigator screenOptions={subScreen}>
      <WantToReadStack.Screen name="WantToReadList" component={WantToReadScreen} options={drawerRootScreen} />
      {commonScreens(WantToReadStack)}
    </WantToReadStack.Navigator>
  );
}

function MainDrawer() {
  const providerType = useAuthStore((s) => s.serverConfig?.providerType);
  const isKavita = providerType === 'kavita';

  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'slide', drawerStyle: { width: 280 } }}
    >
      <Drawer.Screen name="Home" component={HomeNavigator} />
      <Drawer.Screen name="Library" component={LibraryNavigator} />
      <Drawer.Screen name="Series" component={AllSeriesNavigator} />
      <Drawer.Screen name="Authors" component={AuthorsNavigator} />
      <Drawer.Screen name="Collections" component={CollectionsNavigator} />
      <Drawer.Screen name="ReadList" component={ReadListsNavigator} />
      {isKavita && (
        <Drawer.Screen name="WantToRead" component={WantToReadNavigator} />
      )}
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

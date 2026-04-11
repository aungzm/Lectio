import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { DrawerScreenProps } from '@react-navigation/drawer';

// Root stack — unauthenticated screens
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// Drawer navigator — main authenticated screens
export type MainDrawerParamList = {
  Home: undefined;
  Library: undefined;
  Series: undefined;
  Authors: undefined;
  Collections: undefined;
  ReadList: undefined;
  WantToRead: undefined; // Kavita only — hidden for Komga
  Settings: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

// Library stack — Libraries → SeriesList → SeriesDetail → Reader
export type LibraryStackParamList = {
  Libraries: undefined;
  SeriesList: { libraryId: string; libraryName: string };
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// All Series stack
export type AllSeriesStackParamList = {
  AllSeries: undefined;
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Authors stack
export type AuthorsStackParamList = {
  Authors: undefined;
  AuthorDetail: { authorId: string; authorName: string };
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Collections stack
export type CollectionsStackParamList = {
  Collections: undefined;
  CollectionDetail: { collectionId: string; collectionName: string };
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// ReadLists stack
export type ReadListsStackParamList = {
  ReadLists: undefined;
  ReadListDetail: { readListId: string; readListName: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Want to Read stack (Kavita only)
export type WantToReadStackParamList = {
  WantToRead: undefined;
};

// Bookmarks stack
export type BookmarksStackParamList = {
  BookmarksList: undefined;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Screen prop types
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type LibrariesScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Libraries'>;
export type SeriesListScreenProps = NativeStackScreenProps<LibraryStackParamList, 'SeriesList'>;
export type SeriesDetailScreenProps = NativeStackScreenProps<LibraryStackParamList, 'SeriesDetail'>;
export type ReaderScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Reader'>;
export type SettingsScreenProps = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export type AuthorsScreenProps = NativeStackScreenProps<AuthorsStackParamList, 'Authors'>;
export type AuthorDetailScreenProps = NativeStackScreenProps<AuthorsStackParamList, 'AuthorDetail'>;

export type CollectionsScreenProps = NativeStackScreenProps<CollectionsStackParamList, 'Collections'>;
export type CollectionDetailScreenProps = NativeStackScreenProps<CollectionsStackParamList, 'CollectionDetail'>;

export type AllSeriesScreenProps = NativeStackScreenProps<AllSeriesStackParamList, 'AllSeries'>;

export type ReadListsScreenProps = NativeStackScreenProps<ReadListsStackParamList, 'ReadLists'>;
export type ReadListDetailScreenProps = NativeStackScreenProps<ReadListsStackParamList, 'ReadListDetail'>;

export type BookmarksListScreenProps = NativeStackScreenProps<BookmarksStackParamList, 'BookmarksList'>;

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
  Books: undefined;
  Authors: undefined;
  Collections: undefined;
  ReadList: undefined;
  Settings: undefined;
};

export type BookDetailParams = {
  chapterId: string;
  seriesId: string;
  title: string;
};

export type HomeStackParamList = {
  HomeScreen: undefined;
  SeriesDetail: { seriesId: string; title: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Library stack — Libraries → SeriesScreen / BookList → SeriesDetail → BookDetail → Reader
export type LibraryStackParamList = {
  Libraries: undefined;
  SeriesScreen: { libraryId: string; libraryName: string };
  BookList: { libraryId: string; libraryName: string }; // Komga: individual books
  SeriesDetail: { seriesId: string; title: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Series stack (unified — all series or library-scoped)
export type SeriesStackParamList = {
  SeriesScreen: { libraryId?: string; libraryName?: string } | undefined;
  SeriesDetail: { seriesId: string; title: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Books stack
export type BooksStackParamList = {
  BooksScreen: { libraryId?: string; libraryName?: string } | undefined;
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Authors stack
export type AuthorsStackParamList = {
  AuthorsList: undefined;
  AuthorDetail: { authorId: string; authorName: string };
  SeriesDetail: { seriesId: string; title: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Collections stack
export type CollectionsStackParamList = {
  CollectionsList: undefined;
  CollectionDetail: { collectionId: string; collectionName: string };
  SeriesDetail: { seriesId: string; title: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// ReadLists stack
export type ReadListsStackParamList = {
  ReadLists: undefined;
  ReadListDetail: { readListId: string; readListName: string };
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Bookmarks stack
export type BookmarksStackParamList = {
  BookmarksList: undefined;
  BookDetail: BookDetailParams;
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Screen prop types
export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type LibrariesScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Libraries'>;
export type SeriesScreenProps = NativeStackScreenProps<SeriesStackParamList, 'SeriesScreen'>;
export type BookListScreenProps = NativeStackScreenProps<LibraryStackParamList, 'BookList'>;
export type SeriesDetailScreenProps = NativeStackScreenProps<LibraryStackParamList, 'SeriesDetail'>;
export type BookDetailScreenProps = NativeStackScreenProps<LibraryStackParamList, 'BookDetail'>;
export type ReaderScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Reader'>;
export type SettingsScreenProps = DrawerScreenProps<MainDrawerParamList, 'Settings'>;

export type BooksScreenProps = NativeStackScreenProps<BooksStackParamList, 'BooksScreen'>;

export type AuthorsScreenProps = NativeStackScreenProps<AuthorsStackParamList, 'AuthorsList'>;
export type AuthorDetailScreenProps = NativeStackScreenProps<AuthorsStackParamList, 'AuthorDetail'>;

export type CollectionsScreenProps = NativeStackScreenProps<CollectionsStackParamList, 'CollectionsList'>;
export type CollectionDetailScreenProps = NativeStackScreenProps<CollectionsStackParamList, 'CollectionDetail'>;

export type ReadListsScreenProps = NativeStackScreenProps<ReadListsStackParamList, 'ReadLists'>;
export type ReadListDetailScreenProps = NativeStackScreenProps<ReadListsStackParamList, 'ReadListDetail'>;

export type BookmarksListScreenProps = NativeStackScreenProps<BookmarksStackParamList, 'BookmarksList'>;

export type BrowseHubScreenProps = DrawerScreenProps<MainDrawerParamList, 'Home'>;

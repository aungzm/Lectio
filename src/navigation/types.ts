import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// Root stack — unauthenticated screens
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

// Tab navigator — main authenticated screens
export type MainTabParamList = {
  Library: undefined;
  Browse: undefined;
  Bookmarks: undefined;
  Settings: undefined;
};

// Library stack — Libraries → SeriesList → SeriesDetail → Reader
export type LibraryStackParamList = {
  Libraries: undefined;
  SeriesList: { libraryId: string; libraryName: string };
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

// Browse stack — hub + authors / collections / readlists drill-downs
export type BrowseStackParamList = {
  BrowseHub: undefined;
  Authors: undefined;
  AuthorDetail: { authorId: string; authorName: string };
  Collections: undefined;
  CollectionDetail: { collectionId: string; collectionName: string };
  ReadLists: undefined;
  ReadListDetail: { readListId: string; readListName: string };
  // Shared reader for items opened from Browse
  Reader: { chapterId: string; title: string; epubUrl: string };
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
export type SettingsScreenProps = BottomTabScreenProps<MainTabParamList, 'Settings'>;

export type BrowseHubScreenProps = NativeStackScreenProps<BrowseStackParamList, 'BrowseHub'>;
export type AuthorsScreenProps = NativeStackScreenProps<BrowseStackParamList, 'Authors'>;
export type AuthorDetailScreenProps = NativeStackScreenProps<BrowseStackParamList, 'AuthorDetail'>;
export type CollectionsScreenProps = NativeStackScreenProps<BrowseStackParamList, 'Collections'>;
export type CollectionDetailScreenProps = NativeStackScreenProps<BrowseStackParamList, 'CollectionDetail'>;
export type ReadListsScreenProps = NativeStackScreenProps<BrowseStackParamList, 'ReadLists'>;
export type ReadListDetailScreenProps = NativeStackScreenProps<BrowseStackParamList, 'ReadListDetail'>;
export type BookmarksListScreenProps = NativeStackScreenProps<BookmarksStackParamList, 'BookmarksList'>;

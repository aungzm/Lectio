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
  Settings: undefined;
};

// Library stack — drills down from library → series → reader
export type LibraryStackParamList = {
  Libraries: undefined;
  SeriesList: { libraryId: string; libraryName: string };
  SeriesDetail: { seriesId: string; title: string };
  Reader: { chapterId: string; title: string; epubUrl: string };
};

export type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;
export type LibrariesScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Libraries'>;
export type SeriesListScreenProps = NativeStackScreenProps<LibraryStackParamList, 'SeriesList'>;
export type SeriesDetailScreenProps = NativeStackScreenProps<LibraryStackParamList, 'SeriesDetail'>;
export type ReaderScreenProps = NativeStackScreenProps<LibraryStackParamList, 'Reader'>;
export type SettingsScreenProps = BottomTabScreenProps<MainTabParamList, 'Settings'>;

// Slim Kavita types — only what the app uses.
// Generated against Kavita v0.8.9.33

export interface KavitaUserDto {
  username: string;
  email: string;
  token: string;
  refreshToken: string;
  apiKey: string;
  preferences: KavitaUserPreferences;
}

export interface KavitaUserPreferences {
  readingDirection: number;
  scalingOption: number;
  pageSplitOption: number;
  readerMode: number;
  layoutMode: number;
  backgroundColor: string;
  bookReaderMargin: number;
  bookReaderLineSpacing: number;
  bookReaderFontSize: number;
  bookReaderFontFamily: string;
  bookReaderTapToPaginate: boolean;
  bookReaderReadingDirection: number;
  theme: { name: string; selector: string } | null;
}

export interface KavitaLoginDto {
  username: string;
  password: string;
  apiKey?: string;
}

export interface KavitaLibraryDto {
  id: number;
  name: string;
  coverImage: string | null;
  count: number;
  type: LibraryType;
  lastScanned: string;
  folders: string[];
}

export enum LibraryType {
  Manga = 0,
  Comic = 1,
  Book = 2,
  Image = 3,
  LightNovel = 4,
}

export interface KavitaSeriesDto {
  id: number;
  name: string;
  originalName: string | null;
  localizedName: string | null;
  sortName: string;
  coverImage: string | null;
  coverImageLocked: boolean;
  pages: number;
  pagesRead: number;
  userRating: number;
  hasUserRated: boolean;
  format: MangaFormat;
  created: string;
  lastModified: string;
  libraryId: number;
  libraryName: string;
  metadata: KavitaSeriesMetadata | null;
}

export enum MangaFormat {
  Image = 0,
  Archive = 1,
  Unknown = 2,
  Epub = 3,
  Pdf = 4,
}

export interface KavitaSeriesMetadata {
  id: number;
  summary: string | null;
  genres: { id: number; title: string }[];
  tags: { id: number; title: string }[];
  writers: { id: number; name: string }[];
  coverArtists: { id: number; name: string }[];
  totalCount: number;
  maxCount: number;
  status: number;
  publicationStatus: number;
  language: string | null;
  ageRating: number;
  releaseYear: number;
}

export interface KavitaVolumeDto {
  id: number;
  number: number;
  name: string;
  pages: number;
  pagesRead: number;
  lastModified: string;
  created: string;
  seriesId: number;
  chapters: KavitaChapterDto[];
}

export interface KavitaChapterDto {
  id: number;
  number: string;
  range: string;
  title: string;
  pages: number;
  pagesRead: number;
  isSpecial: boolean;
  created: string;
  lastModified: string;
  volumeId: number;
  files: KavitaMangaFileDto[];
}

export interface KavitaMangaFileDto {
  id: number;
  filePath: string;
  pages: number;
  format: MangaFormat;
}

export interface KavitaChapterInfoDto {
  chapterId: number;
  seriesId: number;
  volumeId: number;
  libraryId: number;
  seriesName: string;
  seriesFormat: MangaFormat;
  chapterNumber: string;
  volumeNumber: string;
  libraryType: LibraryType;
  chapterCount: number;
  volumeCount: number;
  fileName: string;
  isSpecial: boolean;
}

export interface KavitaProgressDto {
  chapterId: number;
  volumeId: number;
  seriesId: number;
  libraryId: number;
  pageNum: number;
  bookScrollId: string | null;
  lastModified: string;
}

export interface KavitaUpdateProgressDto {
  chapterId: number;
  volumeId: number;
  seriesId: number;
  libraryId: number;
  pageNum: number;
  bookScrollId?: string;
}

export interface KavitaSeriesFilter {
  libraryId?: number;
  pageNumber?: number;
  pageSize?: number;
}

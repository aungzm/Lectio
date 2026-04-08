// Komga API types — generated against Komga v1.24.3

export interface KomgaUserDto {
  id: string;
  email: string;
  roles: string[];
  sharedAllLibraries: boolean;
  sharedLibrariesIds: string[];
}

export interface KomgaLibraryDto {
  id: string;
  name: string;
}

export interface KomgaAuthorDto {
  name: string;
  role: string;
}

export interface KomgaSeriesMetadataDto {
  title: string;
  titleSort: string;
  summary: string;
  readingDirection: string;
  publisher: string;
  ageRating: number | null;
  language: string;
  genres: string[];
  tags: string[];
  totalBookCount: number | null;
}

export interface KomgaBookMetadataAggregationDto {
  authors: KomgaAuthorDto[];
  summary: string;
  summaryNumber: string;
}

export interface KomgaSeriesDto {
  id: string;
  name: string;
  libraryId: string;
  booksCount: number;
  booksReadCount: number;
  booksUnreadCount: number;
  booksInProgressCount: number;
  metadata: KomgaSeriesMetadataDto;
  booksMetadata: KomgaBookMetadataAggregationDto;
  oneshot: boolean;
  deleted: boolean;
}

export interface KomgaBookMetadataDto {
  title: string;
  summary: string;
  number: string;
  numberSort: number;
  releaseDate: string | null;
  authors: KomgaAuthorDto[];
  tags: string[];
  isbn: string;
}

export interface KomgaReadProgressDto {
  page: number;
  completed: boolean;
  created: string;
  lastModified: string;
  deviceId: string;
  deviceName: string;
  readDate: string;
}

export interface KomgaMediaDto {
  status: string;
  mediaType: string;
  pagesCount: number;
  comment: string;
  epubIsKepub: boolean;
  epubDivinaCompatible: boolean;
}

export interface KomgaBookDto {
  id: string;
  name: string;
  libraryId: string;
  seriesId: string;
  number: number;
  metadata: KomgaBookMetadataDto;
  readProgress: KomgaReadProgressDto | null;
  media: KomgaMediaDto;
  oneshot: boolean;
  deleted: boolean;
}

export interface KomgaPageResultDto<T> {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface KomgaCollectionDto {
  id: string;
  name: string;
  ordered: boolean;
  seriesIds: string[];
  createdDate: string;
  lastModifiedDate: string;
  filtered: boolean;
}

export interface KomgaReadListDto {
  id: string;
  name: string;
  summary: string | null;
  ordered: boolean;
  bookIds: string[];
  createdDate: string;
  lastModifiedDate: string;
  filtered: boolean;
}

export interface KomgaReadProgressUpdateDto {
  page?: number;
  completed?: boolean;
}

/** Stored in Komga's client-settings under "lektio.bookmarks.<seriesId>" */
export interface KomgaStoredBookmark {
  id: string;       // local timestamp id
  seriesId: string;
  bookId: string;
  page: number;
  xPath: string | null;
  chapterTitle: string | null;
}

/** Shape of PATCH /api/v1/client-settings/user body */
export type KomgaClientSettingsPatch = Record<string, { value: string }>;

/** Shape of GET /api/v1/client-settings/user response */
export type KomgaClientSettingsResponse = Record<string, { value: string }>;

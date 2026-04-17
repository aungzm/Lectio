// Base interface all library backends must implement.
// Providers are constructed with serverUrl + credentials already configured.
// Add a new provider by implementing this interface.

export interface Book {
  id: string;
  title: string;
  sortTitle: string;
  coverUrl: string | null;
  pagesTotal: number;
  pagesRead: number;
  format: BookFormat;
  libraryId: string;
  seriesId?: string; // populated for reading list items so cover URLs use the correct series
  volumeId?: string; // populated for reading list items so cover URLs use volume-specific images
  metadata: BookMetadata;
}

export interface BookMetadata {
  summary: string | null;
  authors: string[];
  genres: string[];
  tags: string[];
  language: string | null;
  year: number | null;
}

export interface PersonInfo {
  id: string;
  name: string;
}

export interface DetailedMetadata {
  summary: string | null;
  writers: PersonInfo[];
  pencillers: PersonInfo[];
  inkers: PersonInfo[];
  colorists: PersonInfo[];
  letterers: PersonInfo[];
  coverArtists: PersonInfo[];
  editors: PersonInfo[];
  publishers: PersonInfo[];
  translators: PersonInfo[];
  characters: PersonInfo[];
  genres: string[];
  tags: string[];
  language: string | null;
  releaseYear: number | null;
  ageRating: number;
}

export enum BookFormat {
  Epub = 'epub',
  Pdf = 'pdf',
  Unknown = 'unknown',
}

export interface Library {
  id: string;
  name: string;
  bookCount: number;
  coverUrl: string | null;
}

export interface Volume {
  id: string;
  number: number;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  title: string;
  number: string;
  pagesTotal: number;
  pagesRead: number;
}

export interface ReadingProgress {
  chapterId: string;
  page: number;
  bookScrollId: string | null;
  lastRead: Date;
}

export interface AuthResult {
  token: string;
  username: string;
  apiKey: string;
}

export interface Author {
  id: string;          // Kavita: numeric person id as string; Komga: "name|role" composite
  name: string;
  role: string;        // e.g. 'writer', 'artist'
  coverUrl: string | null;
  seriesCount: number;
}

export interface Collection {
  id: string;
  name: string;
  summary: string | null;
}

export interface ReadList {
  id: string;
  name: string;
  summary: string | null;
}

export interface Bookmark {
  id: string;              // Kavita: server numeric id as string; Komga: local timestamp id
  seriesId: string;
  bookId: string;          // chapterId for Kavita; bookId for Komga
  page: number;
  xPath: string | null;    // epub CFI/xpath position
  chapterTitle: string | null;
}

export interface ILibraryProvider {
  readonly name: string;

  /** List all libraries the user can access. */
  getLibraries(): Promise<Library[]>;

  /** List all series/books in a library (paginated). */
  getSeries(libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]>;

  /** Get full detail for a single series. */
  getSeriesDetail(seriesId: string): Promise<Book>;

  /** Get volumes (and their chapters) for a series. For Komga: each book becomes one volume with one chapter. */
  getVolumes(seriesId: string): Promise<Volume[]>;

  /** Return a URL to stream/download the epub for a chapter/book. */
  getEpubUrl(chapterId: string): string;

  /** Get reading progress for a chapter/book. */
  getProgress(chapterId: string): Promise<ReadingProgress | null>;

  /** Save reading progress for a chapter/book. */
  saveProgress(progress: ReadingProgress): Promise<void>;

  /** Build a cover image URL for a series. */
  getCoverUrl(seriesId: string): string;

  /** Build a cover image URL for an individual book (Komga only). */
  getBookCoverUrl?(bookId: string): string;

  /** Build a cover image URL for a volume (optional — falls back to series cover if not implemented). */
  getVolumeCoverUrl?(volumeId: string): string;

  /** Build a cover image URL for a library (optional). */
  getLibraryCoverUrl?(libraryId: string): string;

  /** Build a cover image URL for an author (optional). */
  getAuthorCoverUrl?(authorId: string): string;

  /** Build a cover image URL for a collection (optional). */
  getCollectionCoverUrl?(collectionId: string): string;

  /** Build a cover image URL for a reading list (optional). */
  getReadListCoverUrl?(readListId: string): string;

  // --- Optional browse features (not all providers support all of these) ---

  /** List authors/persons. */
  getAuthors?(page: number, pageSize: number, search?: string): Promise<Author[]>;

  /** List series by a specific author (authorId is provider-specific). */
  getSeriesByAuthor?(authorId: string, page: number, pageSize: number): Promise<Book[]>;

  /** List server-defined collections. */
  getCollections?(): Promise<Collection[]>;

  /** List series in a collection. */
  getCollectionSeries?(collectionId: string, page: number, pageSize: number): Promise<Book[]>;

  /** List reading lists. */
  getReadLists?(): Promise<ReadList[]>;

  /** List books in a reading list. Returned items have id=chapterId/bookId so they can be passed directly to getEpubUrl. */
  getReadListBooks?(readListId: string, page: number, pageSize: number): Promise<Book[]>;

  /** Get all bookmarks for a series. */
  getBookmarks?(seriesId: string): Promise<Bookmark[]>;

  /** Add a bookmark. Returns the saved bookmark with its server-assigned id. */
  addBookmark?(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark>;

  /** Remove a bookmark. */
  removeBookmark?(bookmark: Bookmark): Promise<void>;

  /** List all books in a library (Komga: individual books, not series). */
  getLibraryBooks?(libraryId: string, page: number, pageSize: number): Promise<Book[]>;

  /** Get the user's Want to Read list (Kavita only). */
  getWantToRead?(page: number, pageSize: number): Promise<Book[]>;

  /** Get detailed metadata for a series (all people, genres, etc.). */
  getDetailedMetadata?(seriesId: string): Promise<DetailedMetadata>;

  /** Build a cover image URL for a chapter (optional). */
  getChapterCoverUrl?(chapterId: string): string;

  /** Build a download URL for a chapter (optional). */
  getDownloadUrl?(chapterId: string): string;

  /** Get recently added series (Kavita only). */
  getRecentlyAdded?(pageSize: number): Promise<Book[]>;

  /** Get series in progress / continue reading (Kavita only). */
  getContinueReading?(pageSize: number): Promise<Book[]>;

  /** Get recently updated series (Kavita only). */
  getRecentlyUpdatedSeries?(pageSize: number): Promise<Book[]>;

  /** Get the chapter to continue reading for a series (Kavita only). */
  getContinuePoint?(seriesId: string): Promise<{ chapterId: string; title: string } | null>;
}

// Base interface all library backends must implement.
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

export interface AuthorChapter {
  id: string;          // chapterId — pass directly to getEpubUrl
  title: string;       // display title (titleName / series name from Kavita)
  seriesId: string;
  coverUrl: string | null;
  pagesTotal: number;
  pagesRead: number;
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

  /** Authenticate with the server and return a token. */
  login(serverUrl: string, username: string, password: string): Promise<AuthResult>;

  /** Validate a stored token is still valid. */
  validateToken(serverUrl: string, token: string): Promise<boolean>;

  /** List all libraries the user can access. */
  getLibraries(serverUrl: string, token: string): Promise<Library[]>;

  /** List all series/books in a library (paginated). */
  getSeries(serverUrl: string, token: string, libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]>;

  /** Get full detail for a single series. */
  getSeriesDetail(serverUrl: string, token: string, seriesId: string): Promise<Book>;

  /** Get volumes (and their chapters) for a series. For Komga: each book becomes one volume with one chapter. */
  getVolumes(serverUrl: string, token: string, seriesId: string): Promise<Volume[]>;

  /** Return a URL to stream/download the epub for a chapter/book. */
  getEpubUrl(serverUrl: string, token: string, chapterId: string): string;

  /** Get reading progress for a chapter/book. */
  getProgress(serverUrl: string, token: string, chapterId: string): Promise<ReadingProgress | null>;

  /** Save reading progress for a chapter/book. */
  saveProgress(serverUrl: string, token: string, progress: ReadingProgress): Promise<void>;

  /** Build a cover image URL for a series. */
  getCoverUrl(serverUrl: string, seriesId: string, token: string): string;

  /** Build a cover image URL for a volume (optional — falls back to series cover if not implemented). */
  getVolumeCoverUrl?(serverUrl: string, volumeId: string, apiKey: string): string;

  // --- Optional browse features (not all providers support all of these) ---

  /** List authors/persons. */
  getAuthors?(serverUrl: string, token: string, page: number, pageSize: number, search?: string): Promise<Author[]>;

  /** List series by a specific author (authorId is provider-specific). */
  getSeriesByAuthor?(serverUrl: string, token: string, authorId: string, page: number, pageSize: number): Promise<Book[]>;

  /** List all individual chapters/books by an author across all their series. */
  getChaptersByAuthor?(serverUrl: string, token: string, authorId: string, apiKey: string): Promise<AuthorChapter[]>;

  /** List server-defined collections. */
  getCollections?(serverUrl: string, token: string): Promise<Collection[]>;

  /** List series in a collection. */
  getCollectionSeries?(serverUrl: string, token: string, collectionId: string, page: number, pageSize: number): Promise<Book[]>;

  /** List reading lists. */
  getReadLists?(serverUrl: string, token: string): Promise<ReadList[]>;

  /** List books in a reading list. Returned items have id=chapterId/bookId so they can be passed directly to getEpubUrl. */
  getReadListBooks?(serverUrl: string, token: string, readListId: string, page: number, pageSize: number): Promise<Book[]>;

  /** Get all bookmarks for a series. */
  getBookmarks?(serverUrl: string, token: string, seriesId: string): Promise<Bookmark[]>;

  /** Add a bookmark. Returns the saved bookmark with its server-assigned id. */
  addBookmark?(serverUrl: string, token: string, bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark>;

  /** Remove a bookmark. */
  removeBookmark?(serverUrl: string, token: string, bookmark: Bookmark): Promise<void>;

  /** Get the user's Want to Read list (Kavita only). */
  getWantToRead?(serverUrl: string, token: string, page: number, pageSize: number): Promise<Book[]>;

  /** Get recently added series (Kavita only). */
  getRecentlyAdded?(serverUrl: string, token: string, pageSize: number): Promise<Book[]>;

  /** Get series in progress / continue reading (Kavita only). */
  getContinueReading?(serverUrl: string, token: string, pageSize: number): Promise<Book[]>;
}

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

export interface ILibraryProvider {
  readonly name: string;

  /** Authenticate with the server and return a token. */
  login(serverUrl: string, username: string, password: string): Promise<AuthResult>;

  /** Validate a stored token is still valid. */
  validateToken(serverUrl: string, token: string): Promise<boolean>;

  /** List all libraries the user can access. */
  getLibraries(serverUrl: string, token: string): Promise<Library[]>;

  /** List all series/books in a library (paginated). */
  getSeries(serverUrl: string, token: string, libraryId: string, page: number, pageSize: number): Promise<Book[]>;

  /** Get full detail for a single series. */
  getSeriesDetail(serverUrl: string, token: string, seriesId: string): Promise<Book>;

  /** Get volumes (and their chapters) for a series. */
  getVolumes(serverUrl: string, token: string, seriesId: string): Promise<Volume[]>;

  /** Return a URL to stream/download the epub for a chapter. */
  getEpubUrl(serverUrl: string, token: string, chapterId: string): string;

  /** Get reading progress for a chapter. */
  getProgress(serverUrl: string, token: string, chapterId: string): Promise<ReadingProgress | null>;

  /** Save reading progress for a chapter. */
  saveProgress(serverUrl: string, token: string, progress: ReadingProgress): Promise<void>;

  /** Build a cover image URL for a series. */
  getCoverUrl(serverUrl: string, seriesId: string, token: string): string;
}

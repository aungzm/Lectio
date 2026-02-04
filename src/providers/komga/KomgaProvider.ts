import type {
  ILibraryProvider,
  AuthResult,
  Library,
  Book,
  Volume,
  Chapter,
  ReadingProgress,
  Author,
  Collection,
  ReadList,
  Bookmark,
} from '../base/ILibraryProvider';
import { BookFormat, BookMetadata } from '../base/ILibraryProvider';
import {
  komgaLogin,
  komgaGetCurrentUser,
  komgaGetLibraries,
  komgaGetSeries,
  komgaGetSeriesDetail,
  komgaGetSeriesBooks,
  komgaGetSeriesByAuthor,
  komgaGetAuthors,
  komgaGetCollections,
  komgaGetCollectionSeries,
  komgaGetReadLists,
  komgaGetReadListBooks,
  komgaGetBookProgress,
  komgaSaveBookProgress,
  komgaGetBookmarks,
  komgaAddBookmark,
  komgaRemoveBookmark,
  komgaSeriesCoverUrl,
  komgaBookFileUrl,
} from './client';
import type { KomgaSeriesDto, KomgaBookDto, KomgaAuthorDto } from './types';

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapMediaTypeToFormat(mediaType: string): BookFormat {
  if (mediaType?.toLowerCase().includes('epub')) return BookFormat.Epub;
  if (mediaType?.toLowerCase().includes('pdf')) return BookFormat.Pdf;
  return BookFormat.Unknown;
}

function mapSeries(s: KomgaSeriesDto): Book {
  const meta = s.metadata;
  const booksMeta = s.booksMetadata;
  const metadata: BookMetadata = {
    summary: meta?.summary ?? null,
    authors: booksMeta?.authors?.filter((a) => a.role === 'writer').map((a) => a.name) ?? [],
    genres: meta?.genres ?? [],
    tags: meta?.tags ?? [],
    language: meta?.language ?? null,
    year: null,
  };
  return {
    id: s.id,
    title: meta?.title || s.name,
    sortTitle: meta?.titleSort || s.name,
    coverUrl: null,
    pagesTotal: s.booksCount,
    pagesRead: s.booksReadCount,
    format: BookFormat.Unknown,
    libraryId: s.libraryId,
    metadata,
  };
}

function mapBook(b: KomgaBookDto): Book {
  const meta = b.metadata;
  const metadata: BookMetadata = {
    summary: meta?.summary ?? null,
    authors: meta?.authors?.filter((a) => a.role === 'writer').map((a) => a.name) ?? [],
    genres: [],
    tags: meta?.tags ?? [],
    language: null,
    year: null,
  };
  return {
    id: b.id,
    title: meta?.title || b.name,
    sortTitle: meta?.title || b.name,
    coverUrl: null,
    pagesTotal: b.media?.pagesCount ?? 0,
    pagesRead: b.readProgress?.page ?? 0,
    format: mapMediaTypeToFormat(b.media?.mediaType ?? ''),
    libraryId: b.libraryId,
    metadata,
  };
}

function mapAuthor(a: KomgaAuthorDto): Author {
  return {
    id: `${a.name}|${a.role}`,
    name: a.name,
    role: a.role,
    coverUrl: null,    // Komga has no author cover images
    seriesCount: 0,    // not returned by /api/v2/authors
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class KomgaProvider implements ILibraryProvider {
  readonly name = 'Komga';

  async login(serverUrl: string, username: string, password: string): Promise<AuthResult> {
    const { user, sessionToken, basicAuth } = await komgaLogin(serverUrl, username, password);
    return {
      token: sessionToken,
      username: user.email,
      apiKey: basicAuth,  // stored for use in image Authorization headers
    };
  }

  async validateToken(serverUrl: string, token: string): Promise<boolean> {
    try {
      await komgaGetCurrentUser(serverUrl, token);
      return true;
    } catch {
      return false;
    }
  }

  async getLibraries(serverUrl: string, token: string): Promise<Library[]> {
    const libs = await komgaGetLibraries(serverUrl, token);
    return libs.map((l) => ({
      id: l.id,
      name: l.name,
      bookCount: 0,    // LibraryDto doesn't include count; filled in lazily
      coverUrl: null,
    }));
  }

  async getSeries(
    serverUrl: string,
    token: string,
    libraryId: string | undefined,
    page: number,
    pageSize: number,
  ): Promise<Book[]> {
    const result = await komgaGetSeries(serverUrl, token, libraryId || undefined, page, pageSize);
    return result.content.map(mapSeries);
  }

  async getSeriesDetail(serverUrl: string, token: string, seriesId: string): Promise<Book> {
    const s = await komgaGetSeriesDetail(serverUrl, token, seriesId);
    return mapSeries(s);
  }

  /** Komga: each book in a series becomes one Volume containing one Chapter. */
  async getVolumes(serverUrl: string, token: string, seriesId: string): Promise<Volume[]> {
    const result = await komgaGetSeriesBooks(serverUrl, token, seriesId, 0, 50);
    return result.content.map((book: KomgaBookDto): Volume => ({
      id: book.id,
      number: book.number,
      name: book.metadata?.title || book.name,
      chapters: [
        {
          id: book.id,   // bookId used as chapterId throughout the app
          title: book.metadata?.title || book.name,
          number: book.metadata?.number || String(book.number),
          pagesTotal: book.media?.pagesCount ?? 0,
          pagesRead: book.readProgress?.page ?? 0,
        } as Chapter,
      ],
    }));
  }

  getEpubUrl(serverUrl: string, _token: string, bookId: string): string {
    // Komga file URL requires auth via header (handled by the reader component).
    return komgaBookFileUrl(serverUrl, bookId);
  }

  async getProgress(serverUrl: string, token: string, chapterId: string): Promise<ReadingProgress | null> {
    const p = await komgaGetBookProgress(serverUrl, token, chapterId);
    if (!p) return null;
    return {
      chapterId,
      page: p.page,
      bookScrollId: null,
      lastRead: new Date(p.lastModified),
    };
  }

  async saveProgress(serverUrl: string, token: string, progress: ReadingProgress): Promise<void> {
    await komgaSaveBookProgress(serverUrl, token, progress.chapterId, {
      page: progress.page,
    });
  }

  /** Returns the series thumbnail URL. Auth header added by CoverImage component. */
  getCoverUrl(serverUrl: string, seriesId: string, _token: string): string {
    return komgaSeriesCoverUrl(serverUrl, seriesId);
  }

  // ── Authors ─────────────────────────────────────────────────────────────────

  async getAuthors(
    serverUrl: string,
    token: string,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<Author[]> {
    const result = await komgaGetAuthors(serverUrl, token, page, pageSize, search);
    return result.content.map(mapAuthor);
  }

  async getSeriesByAuthor(
    serverUrl: string,
    token: string,
    authorId: string,
    page: number,
    pageSize: number,
  ): Promise<Book[]> {
    // authorId is "name|role" composite
    const [name, role = 'writer'] = authorId.split('|');
    const result = await komgaGetSeriesByAuthor(serverUrl, token, name, role, page, pageSize);
    return result.content.map(mapSeries);
  }

  // ── Collections ───────────────────────────────────────────────────────────────

  async getCollections(serverUrl: string, token: string): Promise<Collection[]> {
    const result = await komgaGetCollections(serverUrl, token);
    return result.content.map((c) => ({
      id: c.id,
      name: c.name,
      summary: null,
    }));
  }

  async getCollectionSeries(
    serverUrl: string,
    token: string,
    collectionId: string,
    page: number,
    pageSize: number,
  ): Promise<Book[]> {
    const result = await komgaGetCollectionSeries(serverUrl, token, collectionId, page, pageSize);
    return result.content.map(mapSeries);
  }

  // ── ReadLists ─────────────────────────────────────────────────────────────────

  async getReadLists(serverUrl: string, token: string): Promise<ReadList[]> {
    const result = await komgaGetReadLists(serverUrl, token);
    return result.content.map((l) => ({
      id: l.id,
      name: l.name,
      summary: l.summary ?? null,
    }));
  }

  async getReadListBooks(
    serverUrl: string,
    token: string,
    readListId: string,
    page: number,
    pageSize: number,
  ): Promise<Book[]> {
    const result = await komgaGetReadListBooks(serverUrl, token, readListId, page, pageSize);
    return result.content.map(mapBook);
  }

  // ── Bookmarks (via Komga client-settings) ─────────────────────────────────────

  async getBookmarks(serverUrl: string, token: string, seriesId: string): Promise<Bookmark[]> {
    const stored = await komgaGetBookmarks(serverUrl, token, seriesId);
    return stored.map((b) => ({
      id: b.id,
      seriesId: b.seriesId,
      bookId: b.bookId,
      page: b.page,
      xPath: b.xPath,
      chapterTitle: b.chapterTitle,
    }));
  }

  async addBookmark(
    serverUrl: string,
    token: string,
    bookmark: Omit<Bookmark, 'id'>,
  ): Promise<Bookmark> {
    const id = String(Date.now());
    const stored = { id, ...bookmark };
    await komgaAddBookmark(serverUrl, token, stored);
    return stored;
  }

  async removeBookmark(serverUrl: string, token: string, bookmark: Bookmark): Promise<void> {
    await komgaRemoveBookmark(serverUrl, token, bookmark);
  }
}

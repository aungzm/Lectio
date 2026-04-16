import type {
  ILibraryProvider,
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
import { KomgaClient } from './client';
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
    coverUrl: null,
    seriesCount: 0,
  };
}

// ── Provider ──────────────────────────────────────────────────────────────────

export class KomgaProvider implements ILibraryProvider {
  readonly name = 'Komga';
  private readonly client: KomgaClient;

  constructor(serverUrl: string, token: string) {
    this.client = new KomgaClient(serverUrl, token);
  }

  async getLibraries(): Promise<Library[]> {
    const libs = await this.client.getLibraries();
    return libs.map((l) => ({
      id: l.id,
      name: l.name,
      bookCount: 0,
      coverUrl: null,
    }));
  }

  async getSeries(libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]> {
    const result = await this.client.getSeries(libraryId || undefined, page, pageSize);
    return result.content.map(mapSeries);
  }

  async getSeriesDetail(seriesId: string): Promise<Book> {
    const s = await this.client.getSeriesDetail(seriesId);
    return mapSeries(s);
  }

  async getVolumes(seriesId: string): Promise<Volume[]> {
    const result = await this.client.getSeriesBooks(seriesId, 0, 50);
    return result.content.map((book: KomgaBookDto): Volume => ({
      id: book.id,
      number: book.number,
      name: book.metadata?.title || book.name,
      chapters: [
        {
          id: book.id,
          title: book.metadata?.title || book.name,
          number: book.metadata?.number || String(book.number),
          pagesTotal: book.media?.pagesCount ?? 0,
          pagesRead: book.readProgress?.page ?? 0,
        } as Chapter,
      ],
    }));
  }

  getEpubUrl(bookId: string): string {
    return this.client.bookFileUrl(bookId);
  }

  async getProgress(chapterId: string): Promise<ReadingProgress | null> {
    const p = await this.client.getBookProgress(chapterId);
    if (!p) return null;
    return {
      chapterId,
      page: p.page,
      bookScrollId: null,
      lastRead: new Date(p.lastModified),
    };
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    await this.client.saveBookProgress(progress.chapterId, {
      page: progress.page,
    });
  }

  getCoverUrl(seriesId: string): string {
    return this.client.seriesCoverUrl(seriesId);
  }

  // ── Authors ─────────────────────────────────────────────────────────────────

  async getAuthors(page: number, pageSize: number, search?: string): Promise<Author[]> {
    const result = await this.client.getAuthors(page, pageSize, search);
    return result.content.map(mapAuthor);
  }

  async getSeriesByAuthor(authorId: string, page: number, pageSize: number): Promise<Book[]> {
    const [name, role = 'writer'] = authorId.split('|');
    const result = await this.client.getSeriesByAuthor(name, role, page, pageSize);
    return result.content.map(mapSeries);
  }

  // ── Collections ───────────────────────────────────────────────────────────────

  async getCollections(): Promise<Collection[]> {
    const result = await this.client.getCollections();
    return result.content.map((c) => ({
      id: c.id,
      name: c.name,
      summary: null,
    }));
  }

  async getCollectionSeries(collectionId: string, page: number, pageSize: number): Promise<Book[]> {
    const result = await this.client.getCollectionSeries(collectionId, page, pageSize);
    return result.content.map(mapSeries);
  }

  // ── ReadLists ─────────────────────────────────────────────────────────────────

  async getReadLists(): Promise<ReadList[]> {
    const result = await this.client.getReadLists();
    return result.content.map((l) => ({
      id: l.id,
      name: l.name,
      summary: l.summary ?? null,
    }));
  }

  async getReadListBooks(readListId: string, page: number, pageSize: number): Promise<Book[]> {
    const result = await this.client.getReadListBooks(readListId, page, pageSize);
    return result.content.map(mapBook);
  }

  // ── Bookmarks ─────────────────────────────────────────────────────────────────

  async getBookmarks(seriesId: string): Promise<Bookmark[]> {
    const stored = await this.client.getBookmarks(seriesId);
    return stored.map((b) => ({
      id: b.id,
      seriesId: b.seriesId,
      bookId: b.bookId,
      page: b.page,
      xPath: b.xPath,
      chapterTitle: b.chapterTitle,
    }));
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    const id = String(Date.now());
    const stored = { id, ...bookmark };
    await this.client.addBookmark(stored);
    return stored;
  }

  async removeBookmark(bookmark: Bookmark): Promise<void> {
    await this.client.removeBookmark(bookmark);
  }
}

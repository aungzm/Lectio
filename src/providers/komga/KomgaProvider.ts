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
  SearchFilters,
  FilterCriterion,
  PagedResult,
  FilterOptions,
} from '../base/ILibraryProvider';
import { BookFormat, BookMetadata } from '../base/ILibraryProvider';
import { KomgaClient } from './client';
import type {
  KomgaSeriesDto,
  KomgaBookDto,
  KomgaAuthorDto,
  KomgaSeriesCondition,
  KomgaBookCondition,
  KomgaConditionOperator,
} from './types';

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
    seriesId: b.seriesId,
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

  constructor(serverUrl: string, basicAuth: string) {
    this.client = new KomgaClient(serverUrl, basicAuth);
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

  async getLibraryBooks(libraryId: string, page: number, pageSize: number): Promise<Book[]> {
    const result = await this.client.getBooks(libraryId, page, pageSize);
    return result.content.map(mapBook);
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

  getBookCoverUrl(bookId: string): string {
    return this.client.bookCoverUrl(bookId);
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

  // ── Home screen ──────────────────────────────────────────────────────────────

  async getRecentlyAdded(pageSize: number): Promise<Book[]> {
    const result = await this.client.getNewSeries(0, pageSize);
    return result.content.map(mapSeries);
  }

  async getContinueReading(pageSize: number): Promise<Book[]> {
    const result = await this.client.getInProgressSeries(0, pageSize);
    return result.content.map(mapSeries);
  }

  async getRecentlyAddedBooks(pageSize: number): Promise<Book[]> {
    const result = await this.client.getLatestBooks(0, pageSize);
    return result.content.map(mapBook);
  }

  async getRecentlyUpdatedSeries(pageSize: number): Promise<Book[]> {
    const result = await this.client.getLatestSeries(0, pageSize);
    return result.content.map(mapSeries);
  }

  async getContinuePoint(seriesId: string): Promise<{ chapterId: string; title: string } | null> {
    const result = await this.client.getSeriesBooks(seriesId, 0, 500);
    const books = result.content;
    // Find the first book that is in progress
    const inProgress = books.find(
      (b) => b.readProgress && !b.readProgress.completed && b.readProgress.page > 0,
    );
    if (inProgress) {
      return {
        chapterId: inProgress.id,
        title: inProgress.metadata?.title || inProgress.name,
      };
    }
    // Otherwise find the first unread book (after at least one read book)
    let foundRead = false;
    for (const b of books) {
      if (b.readProgress?.completed) {
        foundRead = true;
        continue;
      }
      if (foundRead) {
        return {
          chapterId: b.id,
          title: b.metadata?.title || b.name,
        };
      }
    }
    return null;
  }

  // ── Search / Filter ──────────────────────────────────────────────────────────

  private criterionToSeriesCondition(c: FilterCriterion): KomgaSeriesCondition {
    const op: KomgaConditionOperator = c.type === 'complete' || c.type === 'oneShot'
      ? (c.value === 'true' ? { operator: 'isTrue' } : { operator: 'isFalse' })
      : { operator: 'is', value: c.value };

    const keyMap: Record<string, string> = {
      readStatus: 'readStatus',
      genre: 'genre',
      tag: 'tag',
      publisher: 'publisher',
      language: 'language',
      ageRating: 'ageRating',
      seriesStatus: 'seriesStatus',
      libraryId: 'libraryId',
      complete: 'complete',
      oneShot: 'oneshot',
    };
    const key = keyMap[c.type] ?? c.type;
    return { [key]: op } as KomgaSeriesCondition;
  }

  private buildSeriesCondition(criteria: FilterCriterion[]): KomgaSeriesCondition | undefined {
    if (criteria.length === 0) return undefined;
    const conditions = criteria.map((c) => this.criterionToSeriesCondition(c));
    if (conditions.length === 1) return conditions[0];
    return { allOf: conditions };
  }

  private criterionToBookCondition(c: FilterCriterion): KomgaBookCondition {
    const op: KomgaConditionOperator = c.type === 'oneShot'
      ? (c.value === 'true' ? { operator: 'isTrue' } : { operator: 'isFalse' })
      : { operator: 'is', value: c.value };

    const keyMap: Record<string, string> = {
      readStatus: 'readStatus',
      tag: 'tag',
      libraryId: 'libraryId',
      oneShot: 'oneshot',
    };
    const key = keyMap[c.type] ?? c.type;
    return { [key]: op } as KomgaBookCondition;
  }

  private buildBookCondition(criteria: FilterCriterion[]): KomgaBookCondition | undefined {
    if (criteria.length === 0) return undefined;
    const conditions = criteria.map((c) => this.criterionToBookCondition(c));
    if (conditions.length === 1) return conditions[0];
    return { allOf: conditions };
  }

  async searchSeries(filters: SearchFilters, page: number, pageSize: number): Promise<PagedResult<Book>> {
    const result = await this.client.searchSeries(
      {
        condition: this.buildSeriesCondition(filters.criteria),
        fullTextSearch: filters.fullTextSearch || undefined,
      },
      page,
      pageSize,
      filters.sort ?? 'metadata.titleSort,asc',
    );
    return {
      items: result.content.map(mapSeries),
      totalItems: result.totalElements,
      totalPages: result.totalPages,
      currentPage: result.number,
    };
  }

  async searchBooks(filters: SearchFilters, page: number, pageSize: number): Promise<PagedResult<Book>> {
    const result = await this.client.searchBooks(
      {
        condition: this.buildBookCondition(filters.criteria),
        fullTextSearch: filters.fullTextSearch || undefined,
      },
      page,
      pageSize,
      filters.sort ?? 'metadata.titleSort,asc',
    );
    return {
      items: result.content.map(mapBook),
      totalItems: result.totalElements,
      totalPages: result.totalPages,
      currentPage: result.number,
    };
  }

  async getFilterOptions(): Promise<FilterOptions> {
    const [genres, tags, publishers, languages, ageRatings, libs] = await Promise.all([
      this.client.getGenres(),
      this.client.getTags(),
      this.client.getPublishers(),
      this.client.getLanguages(),
      this.client.getAgeRatings(),
      this.client.getLibraries(),
    ]);
    return {
      genres,
      tags,
      publishers,
      languages,
      ageRatings,
      libraries: libs.map((l) => ({ id: l.id, name: l.name })),
    };
  }
}

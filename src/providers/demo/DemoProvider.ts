import type {
  Author,
  Bookmark,
  Book,
  Collection,
  DetailedMetadata,
  FilterCriterion,
  FilterOptions,
  ILibraryProvider,
  Library,
  PagedResult,
  ReadList,
  ReadingProgress,
  SearchFilters,
  Volume,
} from '../base/ILibraryProvider';
import { BookFormat } from '../base/ILibraryProvider';
import {
  demoBooks,
  demoCollections,
  demoLibraries,
  demoReadLists,
  demoSeries,
  type DemoBookRecord,
  type DemoSeriesRecord,
} from '@/demo/demoData';
import { getDemoAuthorCoverUri, getDemoBookCoverUri, getDemoSeriesCoverUri } from '@/demo/covers';

type ReadStatus = 'UNREAD' | 'IN_PROGRESS' | 'READ';

const bookmarkStore = new Map<string, Bookmark[]>();
const progressStore = new Map<string, ReadingProgress>();

function compareDatesDesc(a: string, b: string): number {
  return new Date(b).getTime() - new Date(a).getTime();
}

function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = page * pageSize;
  return items.slice(start, start + pageSize);
}

function getCurrentPagesRead(book: DemoBookRecord): number {
  return progressStore.get(book.id)?.page ?? book.pagesRead;
}

function toSeriesBook(record: DemoSeriesRecord): Book {
  const books = demoBooks.filter((book) => book.seriesId === record.id);
  const readCount = books.filter((book) => {
    const pagesRead = getCurrentPagesRead(book);
    return book.pagesTotal > 0 && pagesRead >= book.pagesTotal;
  }).length;

  return {
    id: record.id,
    title: record.title,
    sortTitle: record.sortTitle,
    coverUrl: null,
    pagesTotal: record.booksCount,
    pagesRead: readCount,
    format: BookFormat.Unknown,
    libraryId: record.libraryId,
    metadata: record.metadata,
  };
}

function toBook(record: DemoBookRecord): Book {
  return {
    id: record.id,
    title: record.title,
    sortTitle: record.sortTitle,
    coverUrl: null,
    pagesTotal: record.pagesTotal,
    pagesRead: getCurrentPagesRead(record),
    format: record.format,
    libraryId: record.libraryId,
    seriesId: record.seriesId,
    volumeId: record.id,
    metadata: record.metadata,
  };
}

function getBookReadStatus(book: DemoBookRecord): ReadStatus {
  const pagesRead = getCurrentPagesRead(book);
  if (book.pagesTotal > 0 && pagesRead >= book.pagesTotal) return 'READ';
  if (pagesRead > 0) return 'IN_PROGRESS';
  return 'UNREAD';
}

function getSeriesReadStatus(series: DemoSeriesRecord): ReadStatus {
  const books = demoBooks.filter((book) => book.seriesId === series.id);
  if (books.every((book) => getBookReadStatus(book) === 'READ')) return 'READ';
  if (books.some((book) => getBookReadStatus(book) !== 'UNREAD')) return 'IN_PROGRESS';
  return 'UNREAD';
}

function includesText(haystack: string | null | undefined, needle: string | undefined): boolean {
  if (!needle) return true;
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function matchesFullTextSeries(series: DemoSeriesRecord, search?: string): boolean {
  if (!search) return true;
  const text = [
    series.title,
    series.metadata.summary,
    ...series.metadata.authors,
    ...series.metadata.genres,
    ...series.metadata.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(search.toLowerCase());
}

function matchesFullTextBook(book: DemoBookRecord, search?: string): boolean {
  if (!search) return true;
  const text = [
    book.title,
    book.metadata.summary,
    ...book.metadata.authors,
    ...book.metadata.genres,
    ...book.metadata.tags,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return text.includes(search.toLowerCase());
}

function matchesSeriesCriterion(series: DemoSeriesRecord, criterion: FilterCriterion): boolean {
  switch (criterion.type) {
    case 'readStatus':
      return getSeriesReadStatus(series) === criterion.value;
    case 'genre':
      return series.metadata.genres.includes(criterion.value);
    case 'tag':
      return series.metadata.tags.includes(criterion.value);
    case 'publisher':
      return series.detailedMetadata.publishers.some((publisher) => publisher.name === criterion.value);
    case 'language':
      return series.metadata.language === criterion.value;
    case 'ageRating':
      return String(series.detailedMetadata.ageRating) === criterion.value;
    case 'seriesStatus':
      return series.detailedMetadata.seriesStatus === criterion.value;
    case 'libraryId':
      return series.libraryId === criterion.value;
    case 'complete':
      return criterion.value === 'true';
    case 'oneShot':
      return criterion.value === 'true' ? series.booksCount === 1 : series.booksCount !== 1;
    default:
      return true;
  }
}

function matchesBookCriterion(book: DemoBookRecord, criterion: FilterCriterion): boolean {
  switch (criterion.type) {
    case 'readStatus':
      return getBookReadStatus(book) === criterion.value;
    case 'genre':
      return book.metadata.genres.includes(criterion.value);
    case 'tag':
      return book.metadata.tags.includes(criterion.value);
    case 'publisher':
      return true;
    case 'language':
      return book.metadata.language === criterion.value;
    case 'ageRating': {
      const series = demoSeries.find((entry) => entry.id === book.seriesId);
      return String(series?.detailedMetadata.ageRating ?? '') === criterion.value;
    }
    case 'libraryId':
      return book.libraryId === criterion.value;
    case 'oneShot': {
      const series = demoSeries.find((entry) => entry.id === book.seriesId);
      return criterion.value === 'true'
        ? (series?.booksCount ?? 0) === 1
        : (series?.booksCount ?? 0) !== 1;
    }
    default:
      return true;
  }
}

function sortBooks(records: DemoBookRecord[], sort?: string): DemoBookRecord[] {
  const sorted = [...records];
  switch (sort) {
    case 'metadata.numberSort,asc':
      sorted.sort((a, b) => a.number - b.number);
      break;
    case 'metadata.titleSort,asc':
    default:
      sorted.sort((a, b) => a.sortTitle.localeCompare(b.sortTitle));
      break;
  }
  return sorted;
}

function sortSeries(records: DemoSeriesRecord[], sort?: string): DemoSeriesRecord[] {
  const sorted = [...records];
  switch (sort) {
    case 'metadata.titleSort,asc':
    default:
      sorted.sort((a, b) => a.sortTitle.localeCompare(b.sortTitle));
      break;
  }
  return sorted;
}

export class DemoProvider implements ILibraryProvider {
  readonly name = 'Demo';

  async getLibraries(): Promise<Library[]> {
    return demoLibraries.map((library) => ({
      id: library.id,
      name: library.name,
      bookCount: demoBooks.filter((book) => book.libraryId === library.id).length,
      coverUrl: null,
    }));
  }

  async getSeries(libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]> {
    const filtered = libraryId
      ? demoSeries.filter((series) => series.libraryId === libraryId)
      : demoSeries;
    return paginate(sortSeries(filtered), page, pageSize).map(toSeriesBook);
  }

  async getSeriesDetail(seriesId: string): Promise<Book> {
    const series = demoSeries.find((entry) => entry.id === seriesId);
    if (!series) throw new Error('Series not found');
    return toSeriesBook(series);
  }

  async getBookDetail(bookId: string): Promise<Book> {
    const book = demoBooks.find((entry) => entry.id === bookId);
    if (!book) throw new Error('Book not found');
    return toBook(book);
  }

  async getVolumes(seriesId: string): Promise<Volume[]> {
    const books = sortBooks(
      demoBooks.filter((book) => book.seriesId === seriesId),
      'metadata.numberSort,asc',
    );

    return books.map((book) => ({
      id: book.id,
      number: book.number,
      name: book.title,
      chapters: [
        {
          id: book.id,
          title: book.title,
          number: String(book.number),
          pagesTotal: book.pagesTotal,
          pagesRead: getCurrentPagesRead(book),
        },
      ],
    }));
  }

  getEpubUrl(bookId: string): string {
    return `demo://book/${bookId}`;
  }

  getDownloadUrl(bookId: string): string {
    return `demo://download/${bookId}`;
  }

  async getProgress(chapterId: string): Promise<ReadingProgress | null> {
    const saved = progressStore.get(chapterId);
    if (saved) return saved;

    const book = demoBooks.find((entry) => entry.id === chapterId);
    if (!book || getCurrentPagesRead(book) === 0) return null;

    return {
      chapterId,
      page: getCurrentPagesRead(book),
      bookScrollId: null,
      lastRead: new Date(),
    };
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    progressStore.set(progress.chapterId, progress);
  }

  getBookCoverUrl(bookId: string): string {
    return getDemoBookCoverUri(bookId);
  }

  getVolumeCoverUrl(volumeId: string): string {
    return getDemoBookCoverUri(volumeId);
  }

  getLibraryCoverUrl(libraryId: string): string {
    const firstSeries = demoSeries.find((series) => series.libraryId === libraryId);
    return firstSeries ? getDemoSeriesCoverUri(firstSeries.id) : '';
  }

  getCollectionCoverUrl(collectionId: string): string {
    const collection = demoCollections.find((entry) => entry.id === collectionId);
    const firstSeriesId = collection?.seriesIds[0];
    return firstSeriesId ? getDemoSeriesCoverUri(firstSeriesId) : '';
  }

  getReadListCoverUrl(readListId: string): string {
    const readList = demoReadLists.find((entry) => entry.id === readListId);
    const firstBookId = readList?.bookIds[0];
    return firstBookId ? getDemoBookCoverUri(firstBookId) : '';
  }

  getChapterCoverUrl(chapterId: string): string {
    return getDemoBookCoverUri(chapterId);
  }

  getCoverUrl(seriesId: string): string {
    return getDemoSeriesCoverUri(seriesId);
  }

  getAuthorCoverUrl(authorId: string): string {
    return getDemoAuthorCoverUri(authorId) ?? '';
  }

  async getAuthors(page: number, pageSize: number, search?: string): Promise<Author[]> {
    const names = Array.from(new Set(demoSeries.flatMap((series) => series.metadata.authors)));
    const authors = names
      .filter((name) => includesText(name, search))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => {
        const authoredSeries = demoSeries.filter((series) => series.metadata.authors.includes(name));
        return {
          id: `${name}|writer`,
          name,
          role: 'writer',
          coverUrl: null,
          seriesCount: authoredSeries.length,
        };
      });
    return paginate(authors, page, pageSize);
  }

  async getSeriesByAuthor(authorId: string, page: number, pageSize: number): Promise<Book[]> {
    const [name] = authorId.split('|');
    const series = demoSeries.filter((entry) => entry.metadata.authors.includes(name));
    return paginate(sortSeries(series), page, pageSize).map(toSeriesBook);
  }

  async getBooksByAuthor(authorId: string, page: number, pageSize: number): Promise<Book[]> {
    const [name] = authorId.split('|');
    const books = demoBooks.filter((entry) => entry.metadata.authors.includes(name));
    return paginate(sortBooks(books), page, pageSize).map(toBook);
  }

  async getCollections(): Promise<Collection[]> {
    return demoCollections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      summary: collection.summary,
    }));
  }

  async getCollectionSeries(collectionId: string, page: number, pageSize: number): Promise<Book[]> {
    const collection = demoCollections.find((entry) => entry.id === collectionId);
    if (!collection) return [];
    const items = collection.seriesIds
      .map((seriesId) => demoSeries.find((series) => series.id === seriesId))
      .filter((series): series is DemoSeriesRecord => Boolean(series));
    return paginate(sortSeries(items), page, pageSize).map(toSeriesBook);
  }

  async getReadLists(): Promise<ReadList[]> {
    return demoReadLists.map((list) => ({
      id: list.id,
      name: list.name,
      summary: list.summary,
    }));
  }

  async getReadListBooks(readListId: string, page: number, pageSize: number): Promise<Book[]> {
    const list = demoReadLists.find((entry) => entry.id === readListId);
    if (!list) return [];
    const items = list.bookIds
      .map((bookId) => demoBooks.find((book) => book.id === bookId))
      .filter((book): book is DemoBookRecord => Boolean(book));
    return paginate(items, page, pageSize).map(toBook);
  }

  async getBookmarks(seriesId: string): Promise<Bookmark[]> {
    return bookmarkStore.get(seriesId) ?? [];
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    const saved: Bookmark = {
      id: `demo-bookmark-${Date.now()}`,
      ...bookmark,
    };
    const existing = bookmarkStore.get(bookmark.seriesId) ?? [];
    bookmarkStore.set(bookmark.seriesId, [...existing, saved]);
    return saved;
  }

  async removeBookmark(bookmark: Bookmark): Promise<void> {
    const existing = bookmarkStore.get(bookmark.seriesId) ?? [];
    bookmarkStore.set(
      bookmark.seriesId,
      existing.filter((entry) => entry.id !== bookmark.id),
    );
  }

  async getLibraryBooks(libraryId: string, page: number, pageSize: number): Promise<Book[]> {
    const books = demoBooks.filter((book) => book.libraryId === libraryId);
    return paginate(sortBooks(books), page, pageSize).map(toBook);
  }

  async getDetailedMetadata(seriesId: string): Promise<DetailedMetadata> {
    const series = demoSeries.find((entry) => entry.id === seriesId);
    if (!series) throw new Error('Series metadata not found');
    return series.detailedMetadata;
  }

  async getRecentlyAdded(pageSize: number): Promise<Book[]> {
    return [...demoSeries]
      .sort((a, b) => compareDatesDesc(a.addedAt, b.addedAt))
      .slice(0, pageSize)
      .map(toSeriesBook);
  }

  async getContinueReading(pageSize: number): Promise<Book[]> {
    return demoBooks
      .filter((book) => book.id === 'book-wells-2')
      .filter((book) => getBookReadStatus(book) === 'IN_PROGRESS')
      .sort((a, b) => compareDatesDesc(a.addedAt, b.addedAt))
      .slice(0, pageSize)
      .map(toBook);
  }

  async getRecentlyUpdatedSeries(pageSize: number): Promise<Book[]> {
    return [...demoSeries]
      .sort((a, b) => compareDatesDesc(a.updatedAt, b.updatedAt))
      .slice(0, pageSize)
      .map(toSeriesBook);
  }

  async getRecentlyAddedBooks(pageSize: number): Promise<Book[]> {
    return [...demoBooks]
      .sort((a, b) => compareDatesDesc(a.addedAt, b.addedAt))
      .slice(0, pageSize)
      .map(toBook);
  }

  async getContinuePoint(seriesId: string): Promise<{ chapterId: string; title: string } | null> {
    const books = sortBooks(
      demoBooks.filter((book) => book.seriesId === seriesId),
      'metadata.numberSort,asc',
    );
    const inProgress = books.find((book) => getBookReadStatus(book) === 'IN_PROGRESS');
    if (inProgress) {
      return { chapterId: inProgress.id, title: inProgress.title };
    }

    let foundRead = false;
    for (const book of books) {
      if (getBookReadStatus(book) === 'READ') {
        foundRead = true;
        continue;
      }
      if (foundRead) {
        return { chapterId: book.id, title: book.title };
      }
    }

    const firstUnread = books.find((book) => getBookReadStatus(book) === 'UNREAD');
    return firstUnread ? { chapterId: firstUnread.id, title: firstUnread.title } : null;
  }

  async searchSeries(filters: SearchFilters, page: number, pageSize: number): Promise<PagedResult<Book>> {
    const filtered = sortSeries(
      demoSeries.filter(
        (series) =>
          matchesFullTextSeries(series, filters.fullTextSearch) &&
          filters.criteria.every((criterion) => matchesSeriesCriterion(series, criterion)),
      ),
      filters.sort,
    );

    return {
      items: paginate(filtered, page, pageSize).map(toSeriesBook),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      currentPage: page,
    };
  }

  async searchBooks(filters: SearchFilters, page: number, pageSize: number): Promise<PagedResult<Book>> {
    const filtered = sortBooks(
      demoBooks.filter(
        (book) =>
          matchesFullTextBook(book, filters.fullTextSearch) &&
          filters.criteria.every((criterion) => matchesBookCriterion(book, criterion)),
      ),
      filters.sort,
    );

    return {
      items: paginate(filtered, page, pageSize).map(toBook),
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / pageSize),
      currentPage: page,
    };
  }

  async getFilterOptions(): Promise<FilterOptions> {
    return {
      genres: Array.from(new Set(demoSeries.flatMap((series) => series.metadata.genres))).sort(),
      tags: Array.from(new Set(demoSeries.flatMap((series) => series.metadata.tags))).sort(),
      publishers: Array.from(
        new Set(demoSeries.flatMap((series) => series.detailedMetadata.publishers.map((publisher) => publisher.name))),
      ).sort(),
      languages: ['en'],
      ageRatings: Array.from(new Set(demoSeries.map((series) => String(series.detailedMetadata.ageRating)))).sort(),
      libraries: demoLibraries.map((library) => ({ id: library.id, name: library.name })),
    };
  }
}

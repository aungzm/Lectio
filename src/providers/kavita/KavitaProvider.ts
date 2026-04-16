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
import { KavitaClient } from './client';
import type {
  KavitaSeriesDto,
  KavitaVolumeDto,
  KavitaChapterDto,
  KavitaReadingListItemDto,
  KavitaBookmarkDto,
} from './types';
import { MangaFormat } from './types';

// Kavita person role integer → readable string
const KAVITA_ROLE_MAP: Record<number, string> = {
  1: 'writer',
  3: 'penciller',
  4: 'inker',
  5: 'colorist',
  6: 'letterer',
  7: 'cover-artist',
  8: 'editor',
  9: 'publisher',
  10: 'character',
  11: 'translator',
  12: 'artist',
};

function mapRole(roles: number[] | null): string {
  if (!roles || roles.length === 0) return 'unknown';
  return KAVITA_ROLE_MAP[roles[0]] ?? 'unknown';
}

function toBookFormat(format: MangaFormat): BookFormat {
  if (format === MangaFormat.Epub) return BookFormat.Epub;
  if (format === MangaFormat.Pdf) return BookFormat.Pdf;
  return BookFormat.Unknown;
}

function mapSeries(s: KavitaSeriesDto): Book {
  const meta = s.metadata;
  const metadata: BookMetadata = {
    summary: meta?.summary ?? null,
    authors: meta?.writers.map((w) => w.name) ?? [],
    genres: meta?.genres.map((g) => g.title) ?? [],
    tags: meta?.tags.map((t) => t.title) ?? [],
    language: meta?.language ?? null,
    year: meta?.releaseYear ?? null,
  };
  return {
    id: String(s.id),
    title: s.name,
    sortTitle: s.sortName,
    coverUrl: null,
    pagesTotal: s.pages,
    pagesRead: s.pagesRead,
    format: toBookFormat(s.format),
    libraryId: String(s.libraryId),
    metadata,
  };
}

function mapVolumes(volumes: KavitaVolumeDto[]): Volume[] {
  return volumes.map((v) => ({
    id: String(v.id),
    number: v.number,
    name: v.name,
    chapters: v.chapters.map((c: KavitaChapterDto): Chapter => ({
      id: String(c.id),
      title: c.titleName || (Number(c.title) > 0 ? c.title : null) || (Number(c.range) > 0 ? c.range : null) || (Number(c.number) > 0 ? `Chapter ${c.number}` : null) || '',
      number: c.number,
      pagesTotal: c.pages,
      pagesRead: c.pagesRead,
    })),
  }));
}

function readingListItemLabel(item: KavitaReadingListItemDto): string {
  if (item.chapterTitle) return `${item.seriesName} — ${item.chapterTitle}`;
  const chapterNum = parseFloat(item.chapterNumber);
  if (chapterNum < 0) {
    return item.volumeNumber && item.volumeNumber !== '0'
      ? `${item.seriesName} — Vol. ${item.volumeNumber}`
      : item.seriesName;
  }
  return `${item.seriesName} — Chapter ${item.chapterNumber}`;
}

function mapReadingListItem(item: KavitaReadingListItemDto): Book {
  const label = readingListItemLabel(item);
  return {
    id: String(item.chapterId),
    title: label,
    sortTitle: label,
    coverUrl: null,
    pagesTotal: item.pages,
    pagesRead: item.pagesRead,
    format: toBookFormat(item.seriesFormat),
    libraryId: String(item.libraryId),
    seriesId: String(item.seriesId),
    volumeId: String(item.volumeId),
    metadata: {
      summary: null,
      authors: [],
      genres: [],
      tags: [],
      language: null,
      year: null,
    },
  };
}

function mapBookmark(b: KavitaBookmarkDto): Bookmark {
  return {
    id: String(b.id),
    seriesId: String(b.seriesId),
    bookId: String(b.chapterId),
    page: b.page,
    xPath: b.xPath ?? null,
    chapterTitle: b.chapterTitle ?? null,
  };
}

export class KavitaProvider implements ILibraryProvider {
  readonly name = 'Kavita';
  private readonly client: KavitaClient;

  constructor(serverUrl: string, token: string, apiKey: string) {
    this.client = new KavitaClient(serverUrl, token, apiKey);
  }

  async getLibraries(): Promise<Library[]> {
    const libs = await this.client.getLibraries();
    return libs.map((l) => ({
      id: String(l.id),
      name: l.name,
      bookCount: l.count,
      coverUrl: null,
    }));
  }

  getLibraryCoverUrl(libraryId: string): string {
    return this.client.libraryCoverUrl(Number(libraryId));
  }

  async getSeries(libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]> {
    const libId = libraryId ? Number(libraryId) : undefined;
    const series = await this.client.getSeries(libId, page, pageSize);
    return series.map(mapSeries);
  }

  async getSeriesDetail(seriesId: string): Promise<Book> {
    const s = await this.client.getSeriesDetail(Number(seriesId));
    return mapSeries(s);
  }

  async getVolumes(seriesId: string): Promise<Volume[]> {
    const volumes = await this.client.getVolumes(Number(seriesId));
    return mapVolumes(volumes);
  }

  getEpubUrl(chapterId: string): string {
    return this.client.epubUrl(Number(chapterId));
  }

  async getProgress(chapterId: string): Promise<ReadingProgress | null> {
    const p = await this.client.getProgress(Number(chapterId));
    if (!p) return null;
    return {
      chapterId,
      page: p.pageNum,
      bookScrollId: p.bookScrollId,
      lastRead: new Date(p.lastModified),
    };
  }

  async saveProgress(progress: ReadingProgress): Promise<void> {
    await this.client.saveProgress({
      chapterId: Number(progress.chapterId),
      volumeId: 0,
      seriesId: 0,
      libraryId: 0,
      pageNum: progress.page,
      bookScrollId: progress.bookScrollId ?? undefined,
    });
  }

  getCoverUrl(seriesId: string): string {
    return this.client.coverUrl(Number(seriesId));
  }

  getVolumeCoverUrl(volumeId: string): string {
    return this.client.volumeCoverUrl(Number(volumeId));
  }

  async getAuthors(_page: number, _pageSize: number, search?: string): Promise<Author[]> {
    const persons = await this.client.getPersons(search ? { name: search } : {});
    return persons.map((p): Author => ({
      id: String(p.id),
      name: p.name ?? '',
      role: mapRole(p.roles),
      coverUrl: p.coverImage ? this.client.personCoverUrl(p.id) : null,
      seriesCount: p.seriesCount,
    }));
  }

  async getSeriesByAuthor(authorId: string, _page: number, _pageSize: number): Promise<Book[]> {
    const series = await this.client.getSeriesByPerson(Number(authorId));
    return series.map(mapSeries);
  }

  getAuthorCoverUrl(authorId: string): string {
    return this.client.personCoverUrl(Number(authorId));
  }

  async getCollections(): Promise<Collection[]> {
    const cols = await this.client.getCollections();
    return cols.map((c) => ({
      id: String(c.id),
      name: c.title,
      summary: c.summary ?? null,
    }));
  }

  async getCollectionSeries(collectionId: string, page: number, pageSize: number): Promise<Book[]> {
    const series = await this.client.getCollectionSeries(Number(collectionId), page, pageSize);
    return series.map(mapSeries);
  }

  getCollectionCoverUrl(collectionId: string): string {
    return this.client.collectionCoverUrl(Number(collectionId));
  }

  getReadListCoverUrl(readListId: string): string {
    return this.client.readingListCoverUrl(Number(readListId));
  }

  async getReadLists(): Promise<ReadList[]> {
    const lists = await this.client.getReadingLists();
    return lists.map((l) => ({
      id: String(l.id),
      name: l.title,
      summary: l.summary ?? null,
    }));
  }

  async getReadListBooks(readListId: string, _page: number, _pageSize: number): Promise<Book[]> {
    const items = await this.client.getReadingListItems(Number(readListId));
    return items.map(mapReadingListItem);
  }

  async getBookmarks(seriesId: string): Promise<Bookmark[]> {
    const bms = await this.client.getSeriesBookmarks(Number(seriesId));
    return bms.map(mapBookmark);
  }

  async addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    await this.client.addBookmark({
      chapterId: Number(bookmark.bookId),
      volumeId: 0,
      seriesId: Number(bookmark.seriesId),
      page: bookmark.page,
      xPath: bookmark.xPath ?? undefined,
    });
    // Kavita doesn't return the created bookmark — re-fetch to get the id
    const all = await this.client.getSeriesBookmarks(Number(bookmark.seriesId));
    const created = all.find(
      (b) => b.chapterId === Number(bookmark.bookId) && b.page === bookmark.page,
    );
    return created ? mapBookmark(created) : { id: '0', ...bookmark };
  }

  async removeBookmark(bookmark: Bookmark): Promise<void> {
    await this.client.removeBookmark({
      chapterId: Number(bookmark.bookId),
      volumeId: 0,
      seriesId: Number(bookmark.seriesId),
      page: bookmark.page,
    });
  }

  async getWantToRead(page: number, pageSize: number): Promise<Book[]> {
    const series = await this.client.getWantToRead(page, pageSize);
    return series.map(mapSeries);
  }

  async getRecentlyAdded(pageSize: number): Promise<Book[]> {
    const series = await this.client.getRecentlyAdded(pageSize);
    return series.map(mapSeries);
  }

  async getContinueReading(pageSize: number): Promise<Book[]> {
    const series = await this.client.getContinueReading(pageSize);
    return series.map(mapSeries);
  }
}

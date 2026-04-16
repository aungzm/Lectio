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
  kavitaLogin,
  kavitaGetCurrentUser,
  kavitaGetLibraries,
  kavitaGetSeries,
  kavitaGetSeriesDetail,
  kavitaGetVolumes,
  kavitaGetProgress,
  kavitaSaveProgress,
  kavitaEpubUrl,
  kavitaCoverUrl,
  kavitaVolumeCoverUrl,
  kavitaGetPersons,
  kavitaGetSeriesByPerson,
  kavitaLibraryCoverUrl,
  kavitaGetCollections,
  kavitaGetCollectionSeries,
  kavitaGetReadingLists,
  kavitaGetReadingListItems,
  kavitaReadingListCoverUrl,
  kavitaGetSeriesBookmarks,
  kavitaAddBookmark,
  kavitaRemoveBookmark,
  kavitaPersonCoverUrl,
  kavitaCollectionCoverUrl,
  kavitaGetWantToRead,
  kavitaGetRecentlyAdded,
  kavitaGetContinueReading,
} from './client';
import type {
  KavitaSeriesDto,
  KavitaVolumeDto,
  KavitaChapterDto,
  KavitaBrowsePersonDto,
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

function mapPerson(p: KavitaBrowsePersonDto, serverUrl: string, apiKey: string): Author {
  return {
    id: String(p.id),
    name: p.name ?? '',
    role: mapRole(p.roles),
    coverUrl: p.coverImage ? kavitaPersonCoverUrl(serverUrl, p.id, apiKey) : null,
    seriesCount: p.seriesCount,
  };
}

function readingListItemLabel(item: KavitaReadingListItemDto): string {
  if (item.chapterTitle) return `${item.seriesName} — ${item.chapterTitle}`;
  // -100000 is Kavita's sentinel for a volume-level file with no discrete chapter number
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

  async login(serverUrl: string, username: string, password: string): Promise<AuthResult> {
    const user = await kavitaLogin(serverUrl, { username, password });
    return { token: user.token, username: user.username, apiKey: user.apiKey };
  }

  async validateToken(serverUrl: string, token: string): Promise<boolean> {
    try {
      await kavitaGetCurrentUser(serverUrl, token);
      return true;
    } catch {
      return false;
    }
  }

  async getLibraries(serverUrl: string, token: string): Promise<Library[]> {
    const libs = await kavitaGetLibraries(serverUrl, token);
    return libs.map((l) => ({
      id: String(l.id),
      name: l.name,
      bookCount: l.count,
      coverUrl: null,
    }));
  }

  getLibraryCoverUrl(serverUrl: string, libraryId: string, apiKey: string): string {
    return kavitaLibraryCoverUrl(serverUrl, Number(libraryId), apiKey);
  }

  async getSeries(serverUrl: string, token: string, libraryId: string | undefined, page: number, pageSize: number): Promise<Book[]> {
    const libId = libraryId ? Number(libraryId) : undefined;
    const series = await kavitaGetSeries(serverUrl, token, libId, page, pageSize);
    return series.map(mapSeries);
  }

  async getSeriesDetail(serverUrl: string, token: string, seriesId: string): Promise<Book> {
    const s = await kavitaGetSeriesDetail(serverUrl, token, Number(seriesId));
    return mapSeries(s);
  }

  async getVolumes(serverUrl: string, token: string, seriesId: string): Promise<Volume[]> {
    const volumes = await kavitaGetVolumes(serverUrl, token, Number(seriesId));
    return mapVolumes(volumes);
  }

  getEpubUrl(serverUrl: string, token: string, chapterId: string): string {
    return kavitaEpubUrl(serverUrl, token, Number(chapterId));
  }

  async getProgress(serverUrl: string, token: string, chapterId: string): Promise<ReadingProgress | null> {
    const p = await kavitaGetProgress(serverUrl, token, Number(chapterId));
    if (!p) return null;
    return {
      chapterId,
      page: p.pageNum,
      bookScrollId: p.bookScrollId,
      lastRead: new Date(p.lastModified),
    };
  }

  async saveProgress(serverUrl: string, token: string, progress: ReadingProgress): Promise<void> {
    await kavitaSaveProgress(serverUrl, token, {
      chapterId: Number(progress.chapterId),
      volumeId: 0,
      seriesId: 0,
      libraryId: 0,
      pageNum: progress.page,
      bookScrollId: progress.bookScrollId ?? undefined,
    });
  }

  getCoverUrl(serverUrl: string, seriesId: string, apiKey: string): string {
    return kavitaCoverUrl(serverUrl, Number(seriesId), apiKey);
  }

  getVolumeCoverUrl(serverUrl: string, volumeId: string, apiKey: string): string {
    return kavitaVolumeCoverUrl(serverUrl, Number(volumeId), apiKey);
  }

  async getAuthors(
    serverUrl: string,
    token: string,
    _page: number,
    _pageSize: number,
    search?: string,
  ): Promise<Author[]> {
    const persons = await kavitaGetPersons(serverUrl, token, search ? { name: search } : {});
    // Extract apiKey from token (for cover URLs, Kavita needs apiKey not JWT; we store apiKey separately)
    // Cover URLs are built lazily by the UI using auth.apiKey
    return persons.map((p) => mapPerson(p, serverUrl, ''));
  }

  async getSeriesByAuthor(
    serverUrl: string,
    token: string,
    authorId: string,
    _page: number,
    _pageSize: number,
  ): Promise<Book[]> {
    const series = await kavitaGetSeriesByPerson(serverUrl, token, Number(authorId));
    return series.map(mapSeries);
  }

  getAuthorCoverUrl(serverUrl: string, authorId: string, apiKey: string): string {
    return kavitaPersonCoverUrl(serverUrl, Number(authorId), apiKey);
  }


  async getCollections(serverUrl: string, token: string): Promise<Collection[]> {
    const cols = await kavitaGetCollections(serverUrl, token);
    return cols.map((c) => ({
      id: String(c.id),
      name: c.title,
      summary: c.summary ?? null,
    }));
  }

  async getCollectionSeries(
    serverUrl: string,
    token: string,
    collectionId: string,
    page: number,
    pageSize: number,
  ): Promise<Book[]> {
    const series = await kavitaGetCollectionSeries(serverUrl, token, Number(collectionId), page, pageSize);
    return series.map(mapSeries);
  }

  getCollectionCoverUrl(serverUrl: string, collectionId: string, apiKey: string): string {
    return kavitaCollectionCoverUrl(serverUrl, Number(collectionId), apiKey);
  }


  getReadListCoverUrl(serverUrl: string, readListId: string, apiKey: string): string {
    return kavitaReadingListCoverUrl(serverUrl, Number(readListId), apiKey);
  }

  async getReadLists(serverUrl: string, token: string): Promise<ReadList[]> {
    const lists = await kavitaGetReadingLists(serverUrl, token);
    return lists.map((l) => ({
      id: String(l.id),
      name: l.title,
      summary: l.summary ?? null,
    }));
  }

  async getReadListBooks(
    serverUrl: string,
    token: string,
    readListId: string,
    _page: number,
    _pageSize: number,
  ): Promise<Book[]> {
    const items = await kavitaGetReadingListItems(serverUrl, token, Number(readListId));
    return items.map(mapReadingListItem);
  }


  async getBookmarks(serverUrl: string, token: string, seriesId: string): Promise<Bookmark[]> {
    const bms = await kavitaGetSeriesBookmarks(serverUrl, token, Number(seriesId));
    return bms.map(mapBookmark);
  }

  async addBookmark(serverUrl: string, token: string, bookmark: Omit<Bookmark, 'id'>): Promise<Bookmark> {
    await kavitaAddBookmark(serverUrl, token, {
      chapterId: Number(bookmark.bookId),
      volumeId: 0,
      seriesId: Number(bookmark.seriesId),
      page: bookmark.page,
      xPath: bookmark.xPath ?? undefined,
    });
    // Kavita doesn't return the created bookmark — re-fetch to get the id
    const all = await kavitaGetSeriesBookmarks(serverUrl, token, Number(bookmark.seriesId));
    const created = all.find(
      (b) => b.chapterId === Number(bookmark.bookId) && b.page === bookmark.page,
    );
    return created ? mapBookmark(created) : { id: '0', ...bookmark };
  }

  async removeBookmark(serverUrl: string, token: string, bookmark: Bookmark): Promise<void> {
    await kavitaRemoveBookmark(serverUrl, token, {
      chapterId: Number(bookmark.bookId),
      volumeId: 0,
      seriesId: Number(bookmark.seriesId),
      page: bookmark.page,
    });
  }

  async getWantToRead(serverUrl: string, token: string, page: number, pageSize: number): Promise<Book[]> {
    const series = await kavitaGetWantToRead(serverUrl, token, page, pageSize);
    return series.map(mapSeries);
  }

  async getRecentlyAdded(serverUrl: string, token: string, pageSize: number): Promise<Book[]> {
    const series = await kavitaGetRecentlyAdded(serverUrl, token, pageSize);
    return series.map(mapSeries);
  }

  async getContinueReading(serverUrl: string, token: string, pageSize: number): Promise<Book[]> {
    const series = await kavitaGetContinueReading(serverUrl, token, pageSize);
    return series.map(mapSeries);
  }
}

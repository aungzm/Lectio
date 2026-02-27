import axios, { AxiosInstance } from 'axios';
import type {
  KavitaLoginDto,
  KavitaUserDto,
  KavitaLibraryDto,
  KavitaSeriesDto,
  KavitaVolumeDto,
  KavitaProgressDto,
  KavitaUpdateProgressDto,
  KavitaChapterInfoDto,
  KavitaBrowsePersonDto,
  KavitaBrowsePersonFilterDto,
  KavitaCollectionDto,
  KavitaReadingListDto,
  KavitaReadingListItemDto,
  KavitaBookmarkDto,
  KavitaBookmarkUpdateDto,
} from './types';

/** Normalize a server URL once — strip trailing slash. */
function normalizeUrl(serverUrl: string): string {
  return serverUrl.replace(/\/$/, '');
}

// ── Static helpers (no auth needed) ──────────────────────────────────────────

/** Authenticate with a Kavita server. Called before a client instance exists. */
export async function kavitaLogin(serverUrl: string, credentials: KavitaLoginDto): Promise<KavitaUserDto> {
  const { data } = await axios.post<KavitaUserDto>(
    `${normalizeUrl(serverUrl)}/api/Account/login`,
    credentials,
    { headers: { 'Content-Type': 'application/json' } },
  );
  return data;
}

/** Validate a token by hitting the account endpoint. */
export async function kavitaValidateToken(serverUrl: string, token: string): Promise<boolean> {
  try {
    await axios.get(`${normalizeUrl(serverUrl)}/api/Account`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return true;
  } catch {
    return false;
  }
}

// ── KavitaClient ─────────────────────────────────────────────────────────────

export class KavitaClient {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;
  readonly apiKey: string;

  constructor(serverUrl: string, token: string, apiKey: string) {
    this.baseUrl = normalizeUrl(serverUrl);
    this.apiKey = apiKey;
    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // ── Libraries ──────────────────────────────────────────────────────────────

  async getLibraries(): Promise<KavitaLibraryDto[]> {
    const { data } = await this.http.get<KavitaLibraryDto[]>('/api/library/libraries');
    return data;
  }

  // ── Series ─────────────────────────────────────────────────────────────────

  async getSeries(libraryId?: number, pageNumber = 0, pageSize = 30): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
      statements: [],
      combination: 1,
      limitTo: 0,
      sortOptions: { sortField: 1, isAscending: true },
      ...(libraryId !== undefined ? { libraryId } : {}),
      pageNumber,
      pageSize,
    });
    return data ?? [];
  }

  async getSeriesDetail(seriesId: number): Promise<KavitaSeriesDto> {
    const { data } = await this.http.get<KavitaSeriesDto>(`/api/Series/${seriesId}`);
    return data;
  }

  async getVolumes(seriesId: number): Promise<KavitaVolumeDto[]> {
    const { data } = await this.http.get<KavitaVolumeDto[]>('/api/Series/volumes', { params: { seriesId } });
    return data;
  }

  async getChapterInfo(chapterId: number): Promise<KavitaChapterInfoDto> {
    const { data } = await this.http.get<KavitaChapterInfoDto>('/api/Reader/chapter-info', { params: { chapterId } });
    return data;
  }

  // ── Progress ───────────────────────────────────────────────────────────────

  async getProgress(chapterId: number): Promise<KavitaProgressDto | null> {
    try {
      const { data } = await this.http.get<KavitaProgressDto>('/api/Reader/get-progress', { params: { chapterId } });
      return data;
    } catch {
      return null;
    }
  }

  async saveProgress(progress: KavitaUpdateProgressDto): Promise<void> {
    await this.http.post('/api/Reader/progress', progress);
  }

  // ── Person / Authors ───────────────────────────────────────────────────────

  async getPersons(filter: KavitaBrowsePersonFilterDto = {}): Promise<KavitaBrowsePersonDto[]> {
    const { data } = await this.http.post<KavitaBrowsePersonDto[]>('/api/Person/all', filter);
    return data ?? [];
  }

  async getSeriesByPerson(personId: number): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.get<KavitaSeriesDto[]>('/api/Person/series-known-for', { params: { personId } });
    return data ?? [];
  }

  // ── Collections ────────────────────────────────────────────────────────────

  async getCollections(): Promise<KavitaCollectionDto[]> {
    const { data } = await this.http.get<KavitaCollectionDto[]>('/api/Collection');
    return data ?? [];
  }

  async getCollectionSeries(collectionId: number, pageNumber = 0, pageSize = 30): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.get<KavitaSeriesDto[]>('/api/Series/series-by-collection', {
      params: { collectionId, PageNumber: pageNumber, PageSize: pageSize },
    });
    return data ?? [];
  }

  // ── Reading Lists ──────────────────────────────────────────────────────────

  async getReadingLists(): Promise<KavitaReadingListDto[]> {
    const { data } = await this.http.post<KavitaReadingListDto[]>('/api/ReadingList/lists', {});
    return data ?? [];
  }

  async getReadingListItems(readingListId: number): Promise<KavitaReadingListItemDto[]> {
    const { data } = await this.http.get<KavitaReadingListItemDto[]>('/api/ReadingList/items', {
      params: { readingListId },
    });
    return data ?? [];
  }

  // ── Want to Read ───────────────────────────────────────────────────────────

  async getWantToRead(pageNumber = 0, pageSize = 30): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.get<KavitaSeriesDto[]>('/api/want-to-read', {
      params: { PageNumber: pageNumber, PageSize: pageSize },
    });
    return data ?? [];
  }

  async getRecentlyAdded(pageSize = 20): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
      statements: [],
      combination: 1,
      limitTo: 0,
      sortOptions: { sortField: 6, isAscending: false },
      pageNumber: 0,
      pageSize,
    });
    return data ?? [];
  }

  async getContinueReading(pageSize = 20): Promise<KavitaSeriesDto[]> {
    const { data } = await this.http.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
      statements: [],
      combination: 1,
      limitTo: 0,
      sortOptions: { sortField: 5, isAscending: false },
      pageNumber: 0,
      pageSize,
    });
    return (data ?? []).filter((s) => s.pagesRead > 0);
  }

  // ── Bookmarks ──────────────────────────────────────────────────────────────

  async getSeriesBookmarks(seriesId: number): Promise<KavitaBookmarkDto[]> {
    const { data } = await this.http.get<KavitaBookmarkDto[]>('/api/Reader/series-bookmarks', {
      params: { seriesId },
    });
    return data ?? [];
  }

  async addBookmark(bookmark: KavitaBookmarkUpdateDto): Promise<void> {
    await this.http.post('/api/Reader/bookmark', bookmark);
  }

  async removeBookmark(bookmark: KavitaBookmarkUpdateDto): Promise<void> {
    await this.http.post('/api/Reader/unbookmark', bookmark);
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  epubUrl(chapterId: number): string {
    return `${this.baseUrl}/api/Reader/epub?chapterId=${chapterId}&apiKey=${this.apiKey}`;
  }

  coverUrl(seriesId: number): string {
    return `${this.baseUrl}/api/Image/series-cover?seriesId=${seriesId}&apiKey=${this.apiKey}`;
  }

  volumeCoverUrl(volumeId: number): string {
    return `${this.baseUrl}/api/Image/volume-cover?volumeId=${volumeId}&apiKey=${this.apiKey}`;
  }

  personCoverUrl(personId: number): string {
    return `${this.baseUrl}/api/Image/person-cover?personId=${personId}&apiKey=${this.apiKey}`;
  }

  libraryCoverUrl(libraryId: number): string {
    return `${this.baseUrl}/api/Image/library-cover?libraryId=${libraryId}&apiKey=${this.apiKey}`;
  }

  readingListCoverUrl(readingListId: number): string {
    return `${this.baseUrl}/api/Image/readinglist-cover?readingListId=${readingListId}&apiKey=${this.apiKey}`;
  }

  collectionCoverUrl(collectionId: number): string {
    return `${this.baseUrl}/api/Image/collection-cover?collectionTagId=${collectionId}&apiKey=${this.apiKey}`;
  }
}

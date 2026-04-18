import axios, { AxiosInstance } from 'axios';
import type {
  KomgaUserDto,
  KomgaLibraryDto,
  KomgaSeriesDto,
  KomgaBookDto,
  KomgaAuthorDto,
  KomgaCollectionDto,
  KomgaReadListDto,
  KomgaReadProgressDto,
  KomgaReadProgressUpdateDto,
  KomgaPageResultDto,
  KomgaStoredBookmark,
  KomgaClientSettingsPatch,
  KomgaClientSettingsResponse,
  KomgaSeriesSearch,
  KomgaBookSearch,
} from './types';
import { normalizeUrl } from '../base/url';

// ── Static helpers (pre-auth) ────────────────────────────────────────────────

/**
 * Sends Basic Auth + X-Auth-Token header to trigger session creation.
 * Returns the session token from the response header alongside user info.
 * Also returns the base64 Basic Auth string for use in image requests.
 */
export async function komgaLogin(
  serverUrl: string,
  username: string,
  password: string,
): Promise<{ user: KomgaUserDto; sessionToken: string; basicAuth: string }> {
  const basicAuth = btoa(`${username}:${password}`);
  const response = await axios.get<KomgaUserDto>(`${normalizeUrl(serverUrl)}/api/v2/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      'X-Auth-Token': '',
    },
  });
  const sessionToken =
    (response.headers['x-auth-token'] as string | undefined) ??
    (response.headers['X-Auth-Token'] as string | undefined) ??
    '';
  return { user: response.data, sessionToken, basicAuth };
}

/** Validate a token by hitting the user endpoint. */
export async function komgaValidateToken(serverUrl: string, token: string): Promise<boolean> {
  try {
    await axios.get(`${normalizeUrl(serverUrl)}/api/v2/users/me`, {
      headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
    });
    return true;
  } catch {
    return false;
  }
}

// ── KomgaClient ──────────────────────────────────────────────────────────────

export class KomgaClient {
  private readonly http: AxiosInstance;
  private readonly baseUrl: string;
  readonly basicAuth: string;

  constructor(serverUrl: string, basicAuth: string) {
    this.baseUrl = normalizeUrl(serverUrl);
    this.basicAuth = basicAuth;
    this.http = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${basicAuth}`,
      },
    });
  }

  // ── Libraries ──────────────────────────────────────────────────────────────

  async getLibraries(): Promise<KomgaLibraryDto[]> {
    const { data } = await this.http.get<KomgaLibraryDto[]>('/api/v1/libraries');
    return data;
  }

  // ── Series ─────────────────────────────────────────────────────────────────

  async getSeries(libraryId?: string, page = 0, size = 30): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const params: Record<string, any> = { page, size, sort: 'metadata.titleSort,asc' };
    if (libraryId) params['library_id'] = libraryId;
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series', { params });
    return data;
  }

  async getSeriesDetail(seriesId: string): Promise<KomgaSeriesDto> {
    const { data } = await this.http.get<KomgaSeriesDto>(`/api/v1/series/${seriesId}`);
    return data;
  }

  async getSeriesBooks(seriesId: string, page = 0, size = 50): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaBookDto>>(
      `/api/v1/series/${seriesId}/books`,
      { params: { page, size, sort: 'metadata.numberSort,asc' } },
    );
    return data;
  }

  async getBooks(libraryId?: string, page = 0, size = 30): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const params: Record<string, any> = { page, size, sort: 'metadata.titleSort,asc' };
    if (libraryId) params['library_id'] = libraryId;
    const { data } = await this.http.get<KomgaPageResultDto<KomgaBookDto>>('/api/v1/books', { params });
    return data;
  }

  async getBookDetail(bookId: string): Promise<KomgaBookDto> {
    const { data } = await this.http.get<KomgaBookDto>(`/api/v1/books/${bookId}`);
    return data;
  }

  async getSeriesByAuthor(authorName: string, authorRole: string, page = 0, size = 30): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series', {
      params: {
        'author': [`${authorName},${authorRole}`],
        page,
        size,
        sort: 'metadata.titleSort,asc',
      },
    });
    return data;
  }

  // ── Authors ────────────────────────────────────────────────────────────────

  async getBooksByAuthor(authorName: string, authorRole: string, page = 0, size = 30): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaBookDto>>('/api/v1/books', {
      params: {
        'author': [`${authorName},${authorRole}`],
        page,
        size,
        sort: 'metadata.titleSort,asc',
      },
    });
    return data;
  }

  async getAuthors(page = 0, size = 30, search?: string): Promise<KomgaPageResultDto<KomgaAuthorDto>> {
    const params: Record<string, any> = { page, size, role: 'writer' };
    if (search) params['search'] = search;
    const { data } = await this.http.get<KomgaPageResultDto<KomgaAuthorDto>>('/api/v2/authors', { params });
    return data;
  }

  // ── Collections ────────────────────────────────────────────────────────────

  async getCollections(page = 0, size = 100): Promise<KomgaPageResultDto<KomgaCollectionDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaCollectionDto>>('/api/v1/collections', {
      params: { page, size },
    });
    return data;
  }

  async getCollectionSeries(collectionId: string, page = 0, size = 30): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>(
      `/api/v1/collections/${collectionId}/series`,
      { params: { page, size } },
    );
    return data;
  }

  // ── Read Lists ─────────────────────────────────────────────────────────────

  async getReadLists(page = 0, size = 100): Promise<KomgaPageResultDto<KomgaReadListDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaReadListDto>>('/api/v1/readlists', {
      params: { page, size },
    });
    return data;
  }

  async getReadListBooks(readListId: string, page = 0, size = 50): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaBookDto>>(
      `/api/v1/readlists/${readListId}/books`,
      { params: { page, size } },
    );
    return data;
  }

  // ── Progress ───────────────────────────────────────────────────────────────

  async getBookProgress(bookId: string): Promise<KomgaReadProgressDto | null> {
    try {
      const { data } = await this.http.get<KomgaReadProgressDto>(`/api/v1/books/${bookId}/read-progress`);
      return data;
    } catch {
      return null;
    }
  }

  async saveBookProgress(bookId: string, update: KomgaReadProgressUpdateDto): Promise<void> {
    await this.http.patch(`/api/v1/books/${bookId}/read-progress`, update);
  }

  // ── Bookmarks (via client-settings) ────────────────────────────────────────

  private async getClientSettings(): Promise<KomgaClientSettingsResponse> {
    try {
      const { data } = await this.http.get<KomgaClientSettingsResponse>('/api/v1/client-settings/user');
      return data ?? {};
    } catch {
      return {};
    }
  }

  private async patchClientSettings(patch: KomgaClientSettingsPatch): Promise<void> {
    await this.http.patch('/api/v1/client-settings/user', patch);
  }

  async getBookmarks(seriesId: string): Promise<KomgaStoredBookmark[]> {
    const settings = await this.getClientSettings();
    const key = `lektio.bookmarks.${seriesId}`;
    const raw = settings[key]?.value;
    if (!raw) return [];
    try {
      return JSON.parse(raw) as KomgaStoredBookmark[];
    } catch {
      return [];
    }
  }

  async addBookmark(bookmark: KomgaStoredBookmark): Promise<void> {
    const existing = await this.getBookmarks(bookmark.seriesId);
    const updated = [...existing, bookmark];
    const key = `lektio.bookmarks.${bookmark.seriesId}`;
    await this.patchClientSettings({ [key]: { value: JSON.stringify(updated) } });
  }

  async removeBookmark(bookmark: KomgaStoredBookmark): Promise<void> {
    const existing = await this.getBookmarks(bookmark.seriesId);
    const updated = existing.filter((b) => b.id !== bookmark.id);
    const key = `lektio.bookmarks.${bookmark.seriesId}`;
    await this.patchClientSettings({ [key]: { value: JSON.stringify(updated) } });
  }

  // ── Search (POST) ─────────────────────────────────────────────────────────

  async searchSeries(body: KomgaSeriesSearch, page = 0, size = 30, sort = 'metadata.titleSort,asc'): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.post<KomgaPageResultDto<KomgaSeriesDto>>(
      '/api/v1/series/list',
      body,
      { params: { page, size, sort } },
    );
    return data;
  }

  async searchBooks(body: KomgaBookSearch, page = 0, size = 30, sort = 'metadata.titleSort,asc'): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const { data } = await this.http.post<KomgaPageResultDto<KomgaBookDto>>(
      '/api/v1/books/list',
      body,
      { params: { page, size, sort } },
    );
    return data;
  }

  // ── Referential (for filter dropdowns) ────────────────────────────────────

  async getGenres(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/api/v1/genres');
    return data;
  }

  async getTags(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/api/v1/tags');
    return data;
  }

  async getPublishers(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/api/v1/publishers');
    return data;
  }

  async getLanguages(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/api/v1/languages');
    return data;
  }

  async getAgeRatings(): Promise<string[]> {
    const { data } = await this.http.get<string[]>('/api/v1/age-ratings');
    return data;
  }

  // ── Home screen ───────────────────────────────────────────────────────────

  async getNewSeries(page = 0, size = 20): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series/new', {
      params: { page, size },
    });
    return data;
  }

  async getLatestSeries(page = 0, size = 20): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series/latest', {
      params: { page, size },
    });
    return data;
  }

  async getLatestBooks(page = 0, size = 20): Promise<KomgaPageResultDto<KomgaBookDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaBookDto>>('/api/v1/books/latest', {
      params: { page, size },
    });
    return data;
  }

  async getInProgressSeries(page = 0, size = 20): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
    const { data } = await this.http.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series', {
      params: { page, size, read_status: 'IN_PROGRESS' },
    });
    return data;
  }

  // ── URL helpers ────────────────────────────────────────────────────────────

  seriesCoverUrl(seriesId: string): string {
    return `${this.baseUrl}/api/v1/series/${seriesId}/thumbnail`;
  }

  bookCoverUrl(bookId: string): string {
    return `${this.baseUrl}/api/v1/books/${bookId}/thumbnail`;
  }

  bookFileUrl(bookId: string): string {
    return `${this.baseUrl}/api/v1/books/${bookId}/file`;
  }
}

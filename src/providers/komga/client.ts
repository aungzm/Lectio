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
} from './types';

/**
 * Builds an Axios client for Komga.
 * Uses X-Auth-Token (session) for normal API calls.
 */
function buildClient(serverUrl: string, token: string): AxiosInstance {
  return axios.create({
    baseURL: serverUrl.replace(/\/$/, ''),
    headers: {
      'Content-Type': 'application/json',
      'X-Auth-Token': token,
    },
  });
}


/**
 * Option B login:
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
  const response = await axios.get<KomgaUserDto>(`${serverUrl.replace(/\/$/, '')}/api/v2/users/me`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${basicAuth}`,
      'X-Auth-Token': '',  // empty value triggers session token creation in response
    },
  });
  // Komga returns the session token in the X-Auth-Token response header
  const sessionToken =
    (response.headers['x-auth-token'] as string | undefined) ??
    (response.headers['X-Auth-Token'] as string | undefined) ??
    '';
  return { user: response.data, sessionToken, basicAuth };
}

export async function komgaGetCurrentUser(serverUrl: string, token: string): Promise<KomgaUserDto> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaUserDto>('/api/v2/users/me');
  return data;
}


export async function komgaGetLibraries(serverUrl: string, token: string): Promise<KomgaLibraryDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaLibraryDto[]>('/api/v1/libraries');
  return data;
}


export async function komgaGetSeries(
  serverUrl: string,
  token: string,
  libraryId?: string,
  page = 0,
  size = 30,
): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
  const client = buildClient(serverUrl, token);
  const params: Record<string, any> = { page, size, sort: 'metadata.titleSort,asc' };
  if (libraryId) params['library_id'] = libraryId;
  const { data } = await client.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series', { params });
  return data;
}

export async function komgaGetSeriesDetail(
  serverUrl: string,
  token: string,
  seriesId: string,
): Promise<KomgaSeriesDto> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaSeriesDto>(`/api/v1/series/${seriesId}`);
  return data;
}

export async function komgaGetSeriesBooks(
  serverUrl: string,
  token: string,
  seriesId: string,
  page = 0,
  size = 50,
): Promise<KomgaPageResultDto<KomgaBookDto>> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaPageResultDto<KomgaBookDto>>(
    `/api/v1/series/${seriesId}/books`,
    { params: { page, size, sort: 'metadata.numberSort,asc' } },
  );
  return data;
}

export async function komgaGetBooks(
  serverUrl: string,
  token: string,
  libraryId?: string,
  page = 0,
  size = 30,
): Promise<KomgaPageResultDto<KomgaBookDto>> {
  const client = buildClient(serverUrl, token);
  const params: Record<string, any> = { page, size, sort: 'metadata.titleSort,asc' };
  if (libraryId) params['library_id'] = libraryId;
  const { data } = await client.get<KomgaPageResultDto<KomgaBookDto>>('/api/v1/books', { params });
  return data;
}

export async function komgaGetSeriesByAuthor(
  serverUrl: string,
  token: string,
  authorName: string,
  authorRole: string,
  page = 0,
  size = 30,
): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
  const client = buildClient(serverUrl, token);
  // Komga author filter format: "name,role"
  const { data } = await client.get<KomgaPageResultDto<KomgaSeriesDto>>('/api/v1/series', {
    params: {
      'author': [`${authorName},${authorRole}`],
      page,
      size,
      sort: 'metadata.titleSort,asc',
    },
  });
  return data;
}

export async function komgaGetAuthors(
  serverUrl: string,
  token: string,
  page = 0,
  size = 30,
  search?: string,
): Promise<KomgaPageResultDto<KomgaAuthorDto>> {
  const client = buildClient(serverUrl, token);
  const params: Record<string, any> = { page, size, role: 'writer' };
  if (search) params['search'] = search;
  const { data } = await client.get<KomgaPageResultDto<KomgaAuthorDto>>('/api/v2/authors', { params });
  return data;
}


export async function komgaGetCollections(
  serverUrl: string,
  token: string,
  page = 0,
  size = 100,
): Promise<KomgaPageResultDto<KomgaCollectionDto>> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaPageResultDto<KomgaCollectionDto>>('/api/v1/collections', {
    params: { page, size },
  });
  return data;
}

export async function komgaGetCollectionSeries(
  serverUrl: string,
  token: string,
  collectionId: string,
  page = 0,
  size = 30,
): Promise<KomgaPageResultDto<KomgaSeriesDto>> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaPageResultDto<KomgaSeriesDto>>(
    `/api/v1/collections/${collectionId}/series`,
    { params: { page, size } },
  );
  return data;
}

export async function komgaGetReadLists(
  serverUrl: string,
  token: string,
  page = 0,
  size = 100,
): Promise<KomgaPageResultDto<KomgaReadListDto>> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaPageResultDto<KomgaReadListDto>>('/api/v1/readlists', {
    params: { page, size },
  });
  return data;
}

export async function komgaGetReadListBooks(
  serverUrl: string,
  token: string,
  readListId: string,
  page = 0,
  size = 50,
): Promise<KomgaPageResultDto<KomgaBookDto>> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KomgaPageResultDto<KomgaBookDto>>(
    `/api/v1/readlists/${readListId}/books`,
    { params: { page, size } },
  );
  return data;
}


export async function komgaGetBookProgress(
  serverUrl: string,
  token: string,
  bookId: string,
): Promise<KomgaReadProgressDto | null> {
  const client = buildClient(serverUrl, token);
  try {
    const { data } = await client.get<KomgaReadProgressDto>(`/api/v1/books/${bookId}/read-progress`);
    return data;
  } catch {
    return null;
  }
}

export async function komgaSaveBookProgress(
  serverUrl: string,
  token: string,
  bookId: string,
  update: KomgaReadProgressUpdateDto,
): Promise<void> {
  const client = buildClient(serverUrl, token);
  await client.patch(`/api/v1/books/${bookId}/read-progress`, update);
}

const BOOKMARK_KEY_PREFIX = 'lektio.bookmarks.';

async function getClientSettings(
  serverUrl: string,
  token: string,
): Promise<KomgaClientSettingsResponse> {
  const client = buildClient(serverUrl, token);
  try {
    const { data } = await client.get<KomgaClientSettingsResponse>('/api/v1/client-settings/user');
    return data ?? {};
  } catch {
    return {};
  }
}

async function patchClientSettings(
  serverUrl: string,
  token: string,
  patch: KomgaClientSettingsPatch,
): Promise<void> {
  const client = buildClient(serverUrl, token);
  await client.patch('/api/v1/client-settings/user', patch);
}

export async function komgaGetBookmarks(
  serverUrl: string,
  token: string,
  seriesId: string,
): Promise<KomgaStoredBookmark[]> {
  const settings = await getClientSettings(serverUrl, token);
  const key = `${BOOKMARK_KEY_PREFIX}${seriesId}`;
  const raw = settings[key]?.value;
  if (!raw) return [];
  try {
    return JSON.parse(raw) as KomgaStoredBookmark[];
  } catch {
    return [];
  }
}

export async function komgaAddBookmark(
  serverUrl: string,
  token: string,
  bookmark: KomgaStoredBookmark,
): Promise<void> {
  const existing = await komgaGetBookmarks(serverUrl, token, bookmark.seriesId);
  const updated = [...existing, bookmark];
  const key = `${BOOKMARK_KEY_PREFIX}${bookmark.seriesId}`;
  await patchClientSettings(serverUrl, token, { [key]: { value: JSON.stringify(updated) } });
}

export async function komgaRemoveBookmark(
  serverUrl: string,
  token: string,
  bookmark: KomgaStoredBookmark,
): Promise<void> {
  const existing = await komgaGetBookmarks(serverUrl, token, bookmark.seriesId);
  const updated = existing.filter((b) => b.id !== bookmark.id);
  const key = `${BOOKMARK_KEY_PREFIX}${bookmark.seriesId}`;
  await patchClientSettings(serverUrl, token, { [key]: { value: JSON.stringify(updated) } });
}

/** Series thumbnail — requires auth header (handled by CoverImage component). */
export function komgaSeriesCoverUrl(serverUrl: string, seriesId: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/v1/series/${seriesId}/thumbnail`;
}

/** Book thumbnail — requires auth header. */
export function komgaBookCoverUrl(serverUrl: string, bookId: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/v1/books/${bookId}/thumbnail`;
}

/** Book epub file URL — requires auth header (handled by reader). */
export function komgaBookFileUrl(serverUrl: string, bookId: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/v1/books/${bookId}/file`;
}

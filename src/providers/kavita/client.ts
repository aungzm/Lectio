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
  KavitaStandaloneChapterDto,
  KavitaCollectionDto,
  KavitaReadingListDto,
  KavitaReadingListItemDto,
  KavitaBookmarkDto,
  KavitaBookmarkUpdateDto,
} from './types';

function buildClient(serverUrl: string, token?: string): AxiosInstance {
  const client = axios.create({
    baseURL: serverUrl.replace(/\/$/, ''),
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return client;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function kavitaLogin(serverUrl: string, credentials: KavitaLoginDto): Promise<KavitaUserDto> {
  const client = buildClient(serverUrl);
  const { data } = await client.post<KavitaUserDto>('/api/Account/login', credentials);
  return data;
}

export async function kavitaGetCurrentUser(serverUrl: string, token: string): Promise<KavitaUserDto> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaUserDto>('/api/Account');
  return data;
}

// ── Libraries ────────────────────────────────────────────────────────────────

export async function kavitaGetLibraries(serverUrl: string, token: string): Promise<KavitaLibraryDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaLibraryDto[]>('/api/library/libraries');
  return data;
}

// ── Series ───────────────────────────────────────────────────────────────────

export async function kavitaGetSeries(
  serverUrl: string,
  token: string,
  libraryId?: number,
  pageNumber = 0,
  pageSize = 30,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
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

export async function kavitaGetSeriesDetail(serverUrl: string, token: string, seriesId: number): Promise<KavitaSeriesDto> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaSeriesDto>(`/api/Series/${seriesId}`);
  return data;
}

export async function kavitaGetVolumes(serverUrl: string, token: string, seriesId: number): Promise<KavitaVolumeDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaVolumeDto[]>(`/api/Series/volumes`, { params: { seriesId } });
  return data;
}

export async function kavitaGetChapterInfo(serverUrl: string, token: string, chapterId: number): Promise<KavitaChapterInfoDto> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaChapterInfoDto>('/api/Reader/chapter-info', { params: { chapterId } });
  return data;
}

// ── Progress ─────────────────────────────────────────────────────────────────

export async function kavitaGetProgress(serverUrl: string, token: string, chapterId: number): Promise<KavitaProgressDto | null> {
  const client = buildClient(serverUrl, token);
  try {
    const { data } = await client.get<KavitaProgressDto>('/api/Reader/get-progress', { params: { chapterId } });
    return data;
  } catch {
    return null;
  }
}

export async function kavitaSaveProgress(serverUrl: string, token: string, progress: KavitaUpdateProgressDto): Promise<void> {
  const client = buildClient(serverUrl, token);
  await client.post('/api/Reader/progress', progress);
}

// ── Person / Authors ─────────────────────────────────────────────────────────

export async function kavitaGetPersons(
  serverUrl: string,
  token: string,
  filter: KavitaBrowsePersonFilterDto = {},
): Promise<KavitaBrowsePersonDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaBrowsePersonDto[]>('/api/Person/all', filter);
  return data ?? [];
}

export async function kavitaGetSeriesByPerson(
  serverUrl: string,
  token: string,
  personId: number,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaSeriesDto[]>('/api/Person/series-known-for', { params: { personId } });
  return data ?? [];
}

export async function kavitaGetChaptersByRole(
  serverUrl: string,
  token: string,
  personId: number,
  role: number,
): Promise<KavitaStandaloneChapterDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaStandaloneChapterDto[]>('/api/Person/chapters-by-role', {
    params: { personId, role },
  });
  return data ?? [];
}

export function kavitaChapterCoverUrl(serverUrl: string, chapterId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/chapter-cover?chapterId=${chapterId}&apiKey=${apiKey}`;
}

// ── Collections ───────────────────────────────────────────────────────────────

export async function kavitaGetCollections(serverUrl: string, token: string): Promise<KavitaCollectionDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaCollectionDto[]>('/api/Collection');
  return data ?? [];
}

export async function kavitaGetCollectionSeries(
  serverUrl: string,
  token: string,
  collectionId: number,
  pageNumber = 0,
  pageSize = 30,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<{ content: KavitaSeriesDto[] }>('/api/Series/series-by-collection', {
    params: { collectionId, PageNumber: pageNumber, PageSize: pageSize },
  });
  return data?.content ?? (data as any) ?? [];
}

// ── Reading Lists ─────────────────────────────────────────────────────────────

export async function kavitaGetReadingLists(serverUrl: string, token: string): Promise<KavitaReadingListDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaReadingListDto[]>('/api/ReadingList/lists', {});
  return data ?? [];
}

export async function kavitaGetReadingListItems(
  serverUrl: string,
  token: string,
  readingListId: number,
): Promise<KavitaReadingListItemDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaReadingListItemDto[]>('/api/ReadingList/items', {
    params: { readingListId },
  });
  return data ?? [];
}

// ── Want to Read ──────────────────────────────────────────────────────────────

export async function kavitaGetWantToRead(
  serverUrl: string,
  token: string,
  pageNumber = 0,
  pageSize = 30,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaSeriesDto[]>('/api/want-to-read', { pageNumber, pageSize });
  return data ?? [];
}

export async function kavitaGetRecentlyAdded(
  serverUrl: string,
  token: string,
  pageSize = 20,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
    statements: [],
    combination: 1,
    limitTo: 0,
    sortOptions: { sortField: 6, isAscending: false },
    pageNumber: 0,
    pageSize,
  });
  return data ?? [];
}

export async function kavitaGetContinueReading(
  serverUrl: string,
  token: string,
  pageSize = 20,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<KavitaSeriesDto[]>('/api/Series/all-v2', {
    statements: [],
    combination: 1,
    limitTo: 0,
    sortOptions: { sortField: 5, isAscending: false },
    pageNumber: 0,
    pageSize,
  });
  // Filter client-side to only series with reading progress
  return (data ?? []).filter((s) => s.pagesRead > 0);
}

// ── Bookmarks ─────────────────────────────────────────────────────────────────

export async function kavitaGetSeriesBookmarks(
  serverUrl: string,
  token: string,
  seriesId: number,
): Promise<KavitaBookmarkDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaBookmarkDto[]>('/api/Reader/series-bookmarks', {
    params: { seriesId },
  });
  return data ?? [];
}

export async function kavitaAddBookmark(
  serverUrl: string,
  token: string,
  bookmark: KavitaBookmarkUpdateDto,
): Promise<void> {
  const client = buildClient(serverUrl, token);
  await client.post('/api/Reader/bookmark', bookmark);
}

export async function kavitaRemoveBookmark(
  serverUrl: string,
  token: string,
  bookmark: KavitaBookmarkUpdateDto,
): Promise<void> {
  const client = buildClient(serverUrl, token);
  await client.post('/api/Reader/unbookmark', bookmark);
}

// ── URL helpers ───────────────────────────────────────────────────────────────

/** Returns a URL to stream/download the epub file for a chapter. */
export function kavitaEpubUrl(serverUrl: string, token: string, chapterId: number): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Reader/epub?chapterId=${chapterId}&apiKey=${token}`;
}

/** Returns a URL for a series cover image. */
export function kavitaCoverUrl(serverUrl: string, seriesId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/series-cover?seriesId=${seriesId}&apiKey=${apiKey}`;
}

/** Returns a URL for a volume cover image. */
export function kavitaVolumeCoverUrl(serverUrl: string, volumeId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/volume-cover?volumeId=${volumeId}&apiKey=${apiKey}`;
}

/** Returns a URL for a person/author cover image. */
export function kavitaPersonCoverUrl(serverUrl: string, personId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/person-cover?personId=${personId}&apiKey=${apiKey}`;
}

/** Returns a URL for a collection cover image. */
export function kavitaCollectionCoverUrl(serverUrl: string, collectionId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/collection-cover?collectionId=${collectionId}&apiKey=${apiKey}`;
}

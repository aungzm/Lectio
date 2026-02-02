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

export async function kavitaGetLibraries(serverUrl: string, token: string): Promise<KavitaLibraryDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.get<KavitaLibraryDto[]>('/api/Library');
  return data;
}

export async function kavitaGetSeries(
  serverUrl: string,
  token: string,
  libraryId?: number,
  pageNumber = 0,
  pageSize = 30,
): Promise<KavitaSeriesDto[]> {
  const client = buildClient(serverUrl, token);
  const { data } = await client.post<{ content: KavitaSeriesDto[] }>('/api/Series/all-v2', {
    statements: [],
    combination: 1,
    limitTo: 0,
    sortOptions: { sortField: 1, isAscending: true },
    ...(libraryId !== undefined ? { libraryId } : {}),
    pageNumber,
    pageSize,
  });
  return data.content ?? [];
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

/** Returns a URL to stream/download the epub file for a chapter. */
export function kavitaEpubUrl(serverUrl: string, token: string, chapterId: number): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Reader/epub?chapterId=${chapterId}&apiKey=${token}`;
}

/** Returns a URL for a series cover image. */
export function kavitaCoverUrl(serverUrl: string, seriesId: number, apiKey: string): string {
  return `${serverUrl.replace(/\/$/, '')}/api/Image/series-cover?seriesId=${seriesId}&apiKey=${apiKey}`;
}

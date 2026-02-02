import type { ILibraryProvider, AuthResult, Library, Book, Volume, Chapter, ReadingProgress } from '../base/ILibraryProvider';
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
} from './client';
import type { KavitaSeriesDto, KavitaVolumeDto, KavitaChapterDto } from './types';
import { MangaFormat, LibraryType } from './types';

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
    coverUrl: null, // caller must build via getCoverUrl
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
      title: c.title || c.range || `Chapter ${c.number}`,
      number: c.number,
      pagesTotal: c.pages,
      pagesRead: c.pagesRead,
    })),
  }));
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

  async getSeries(serverUrl: string, token: string, libraryId: string, page: number, pageSize: number): Promise<Book[]> {
    const series = await kavitaGetSeries(serverUrl, token, Number(libraryId), page, pageSize);
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
    // volumeId, seriesId, libraryId are required by Kavita — caller must supply via chapterId lookup
    // For now we store what we have; the store layer should enrich this before calling
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
}

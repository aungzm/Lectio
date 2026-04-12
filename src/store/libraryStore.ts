import { create } from 'zustand';
import type { Library, Book, Volume, ILibraryProvider } from '@/providers';
import type { ProviderType, ServerConfig } from './authStore';
import { createProvider } from './authStore';

interface LibraryState {
  libraries: Library[];
  seriesByLibrary: Record<string, Book[]>;
  allSeries: Book[];
  volumes: Record<string, Volume[]>; // keyed by seriesId
  seriesDetails: Record<string, Book>; // keyed by seriesId
  isLoading: boolean;
  error: string | null;

  fetchLibraries: (config: ServerConfig, token: string) => Promise<void>;
  fetchSeries: (config: ServerConfig, token: string, libraryId: string, page?: number) => Promise<void>;
  fetchAllSeries: (config: ServerConfig, token: string, page?: number) => Promise<void>;
  fetchVolumes: (config: ServerConfig, token: string, seriesId: string) => Promise<void>;
  fetchSeriesDetail: (config: ServerConfig, token: string, seriesId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraries: [],
  seriesByLibrary: {},
  allSeries: [],
  volumes: {},
  seriesDetails: {},
  isLoading: false,
  error: null,

  fetchLibraries: async (config, token) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const libraries = await provider.getLibraries(config.serverUrl, token);
      set({ libraries, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load libraries' });
    }
  },

  fetchSeries: async (config, token, libraryId, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const series = await provider.getSeries(config.serverUrl, token, libraryId, page, 30);
      const { seriesByLibrary } = get();
      set({
        seriesByLibrary: {
          ...seriesByLibrary,
          [libraryId]: page === 0 ? series : [...(seriesByLibrary[libraryId] ?? []), ...series],
        },
        isLoading: false,
      });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load series' });
    }
  },

  fetchAllSeries: async (config, token, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const series = await provider.getSeries(config.serverUrl, token, undefined, page, 30);
      set((state) => ({
        allSeries: page === 0 ? series : [...state.allSeries, ...series],
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load series' });
    }
  },

  fetchVolumes: async (config, token, seriesId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const volumes = await provider.getVolumes(config.serverUrl, token, seriesId);
      set((state) => ({ volumes: { ...state.volumes, [seriesId]: volumes }, isLoading: false }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load volumes' });
    }
  },

  fetchSeriesDetail: async (config, token, seriesId) => {
    try {
      const provider = createProvider(config.providerType);
      const detail = await provider.getSeriesDetail(config.serverUrl, token, seriesId);
      set((state) => ({ seriesDetails: { ...state.seriesDetails, [seriesId]: detail } }));
    } catch {
      // Non-fatal — screen still works without metadata
    }
  },
}));

import { create } from 'zustand';
import { KavitaProvider } from '@/providers';
import type { Library, Book, Volume, ILibraryProvider } from '@/providers';
import type { ProviderType, ServerConfig } from './authStore';

function getProvider(type: ProviderType): ILibraryProvider {
  switch (type) {
    case 'kavita':
      return new KavitaProvider();
  }
}

interface LibraryState {
  libraries: Library[];
  seriesByLibrary: Record<string, Book[]>;
  volumes: Record<string, Volume[]>; // keyed by seriesId
  isLoading: boolean;
  error: string | null;

  fetchLibraries: (config: ServerConfig, token: string) => Promise<void>;
  fetchSeries: (config: ServerConfig, token: string, libraryId: string, page?: number) => Promise<void>;
  fetchVolumes: (config: ServerConfig, token: string, seriesId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraries: [],
  seriesByLibrary: {},
  volumes: {},
  isLoading: false,
  error: null,

  fetchLibraries: async (config, token) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getProvider(config.providerType);
      const libraries = await provider.getLibraries(config.serverUrl, token);
      set({ libraries, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load libraries' });
    }
  },

  fetchSeries: async (config, token, libraryId, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getProvider(config.providerType);
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

  fetchVolumes: async (config, token, seriesId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getProvider(config.providerType);
      const volumes = await provider.getVolumes(config.serverUrl, token, seriesId);
      set((state) => ({ volumes: { ...state.volumes, [seriesId]: volumes }, isLoading: false }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load volumes' });
    }
  },
}));

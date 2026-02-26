import { create } from 'zustand';
import type { Library, Book, Volume, ILibraryProvider } from '@/providers';

interface LibraryState {
  libraries: Library[];
  seriesByLibrary: Record<string, Book[]>;
  allSeries: Book[];
  volumes: Record<string, Volume[]>; // keyed by seriesId
  isLoading: boolean;
  error: string | null;

  fetchLibraries: (provider: ILibraryProvider) => Promise<void>;
  fetchSeries: (provider: ILibraryProvider, libraryId: string, page?: number) => Promise<void>;
  fetchAllSeries: (provider: ILibraryProvider, page?: number) => Promise<void>;
  fetchVolumes: (provider: ILibraryProvider, seriesId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraries: [],
  seriesByLibrary: {},
  allSeries: [],
  volumes: {},
  isLoading: false,
  error: null,

  fetchLibraries: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      const libraries = await provider.getLibraries();
      set({ libraries, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load libraries' });
    }
  },

  fetchSeries: async (provider, libraryId, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const series = await provider.getSeries(libraryId, page, 30);
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

  fetchAllSeries: async (provider, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const series = await provider.getSeries(undefined, page, 30);
      set((state) => ({
        allSeries: page === 0 ? series : [...state.allSeries, ...series],
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load series' });
    }
  },

  fetchVolumes: async (provider, seriesId) => {
    set({ isLoading: true, error: null });
    try {
      const volumes = await provider.getVolumes(seriesId);
      set((state) => ({ volumes: { ...state.volumes, [seriesId]: volumes }, isLoading: false }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load volumes' });
    }
  },
}));

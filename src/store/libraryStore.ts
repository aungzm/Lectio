import { create } from 'zustand';
import type { Library, Book, Volume, ILibraryProvider } from '@/providers';

interface LibraryState {
  libraries: Library[];
  seriesByLibrary: Record<string, Book[]>;
  booksByLibrary: Record<string, Book[]>;
  allSeries: Book[];
  volumes: Record<string, Volume[]>; // keyed by seriesId
  loadingLibraries: boolean;
  loadingSeries: boolean;
  loadingVolumes: boolean;
  error: string | null;

  fetchLibraries: (provider: ILibraryProvider) => Promise<void>;
  fetchSeries: (provider: ILibraryProvider, libraryId: string, page?: number) => Promise<void>;
  fetchLibraryBooks: (provider: ILibraryProvider, libraryId: string, page?: number) => Promise<void>;
  fetchAllSeries: (provider: ILibraryProvider, page?: number) => Promise<void>;
  fetchVolumes: (provider: ILibraryProvider, seriesId: string) => Promise<void>;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  libraries: [],
  seriesByLibrary: {},
  booksByLibrary: {},
  allSeries: [],
  volumes: {},
  loadingLibraries: false,
  loadingSeries: false,
  loadingVolumes: false,
  error: null,

  fetchLibraries: async (provider) => {
    set({ loadingLibraries: true, error: null });
    try {
      const libraries = await provider.getLibraries();
      set({ libraries, loadingLibraries: false });
    } catch (e: any) {
      set({ loadingLibraries: false, error: e?.message ?? 'Failed to load libraries' });
    }
  },

  fetchSeries: async (provider, libraryId, page = 0) => {
    set({ loadingSeries: true, error: null });
    try {
      const series = await provider.getSeries(libraryId, page, 30);
      const { seriesByLibrary } = get();
      set({
        seriesByLibrary: {
          ...seriesByLibrary,
          [libraryId]: page === 0 ? series : [...(seriesByLibrary[libraryId] ?? []), ...series],
        },
        loadingSeries: false,
      });
    } catch (e: any) {
      set({ loadingSeries: false, error: e?.message ?? 'Failed to load series' });
    }
  },

  fetchLibraryBooks: async (provider, libraryId, page = 0) => {
    set({ loadingSeries: true, error: null });
    try {
      if (!provider.getLibraryBooks) throw new Error('Provider does not support getLibraryBooks');
      const books = await provider.getLibraryBooks(libraryId, page, 30);
      const { booksByLibrary } = get();
      set({
        booksByLibrary: {
          ...booksByLibrary,
          [libraryId]: page === 0 ? books : [...(booksByLibrary[libraryId] ?? []), ...books],
        },
        loadingSeries: false,
      });
    } catch (e: any) {
      set({ loadingSeries: false, error: e?.message ?? 'Failed to load books' });
    }
  },

  fetchAllSeries: async (provider, page = 0) => {
    set({ loadingSeries: true, error: null });
    try {
      const series = await provider.getSeries(undefined, page, 30);
      set((state) => ({
        allSeries: page === 0 ? series : [...state.allSeries, ...series],
        loadingSeries: false,
      }));
    } catch (e: any) {
      set({ loadingSeries: false, error: e?.message ?? 'Failed to load series' });
    }
  },

  fetchVolumes: async (provider, seriesId) => {
    set({ loadingVolumes: true, error: null });
    try {
      const volumes = await provider.getVolumes(seriesId);
      set((state) => ({ volumes: { ...state.volumes, [seriesId]: volumes }, loadingVolumes: false }));
    } catch (e: any) {
      set({ loadingVolumes: false, error: e?.message ?? 'Failed to load volumes' });
    }
  },
}));

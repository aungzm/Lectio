import { create } from 'zustand';
import type { Book, ILibraryProvider } from '@/providers';

interface HomeState {
  recentlyAdded: Book[];
  continueReading: Book[];
  recentlyUpdatedSeries: Book[];
  wantToRead: Book[];
  loadingHome: boolean;
  loadingWantToRead: boolean;
  error: string | null;

  fetchHomeData: (provider: ILibraryProvider) => Promise<void>;
  fetchWantToRead: (provider: ILibraryProvider, page?: number) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  recentlyAdded: [],
  continueReading: [],
  recentlyUpdatedSeries: [],
  wantToRead: [],
  loadingHome: false,
  loadingWantToRead: false,
  error: null,

  fetchHomeData: async (provider) => {
    set({ loadingHome: true, error: null });
    try {
      const [recentlyAdded, continueReading, recentlyUpdatedSeries] = await Promise.all([
        provider.getRecentlyAdded?.(20) ?? [],
        provider.getContinueReading?.(20) ?? [],
        provider.getRecentlyUpdatedSeries?.(20) ?? [],
      ]);
      set({ recentlyAdded, continueReading, recentlyUpdatedSeries, loadingHome: false });
    } catch (e: any) {
      set({ loadingHome: false, error: e?.message ?? 'Failed to load home data' });
    }
  },

  fetchWantToRead: async (provider, page = 0) => {
    set({ loadingWantToRead: true, error: null });
    try {
      const items = await provider.getWantToRead?.(page, 50) ?? [];
      set((state) => ({
        wantToRead: page === 0 ? items : [...state.wantToRead, ...items],
        loadingWantToRead: false,
      }));
    } catch (e: any) {
      set({ loadingWantToRead: false, error: e?.message ?? 'Failed to load want to read' });
    }
  },
}));

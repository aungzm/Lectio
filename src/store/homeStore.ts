import { create } from 'zustand';
import type { Book, ILibraryProvider } from '@/providers';

interface HomeState {
  recentlyAdded: Book[];
  recentlyAddedBooks: Book[];
  continueReading: Book[];
  recentlyUpdatedSeries: Book[];
  loadingHome: boolean;
  error: string | null;

  fetchHomeData: (provider: ILibraryProvider) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set, get) => ({
  recentlyAdded: [],
  recentlyAddedBooks: [],
  continueReading: [],
  recentlyUpdatedSeries: [],
  loadingHome: false,
  error: null,

  fetchHomeData: async (provider) => {
    set({ loadingHome: true, error: null });
    try {
      const [recentlyAdded, recentlyAddedBooks, continueReading, recentlyUpdatedSeries] = await Promise.all([
        provider.getRecentlyAdded?.(20) ?? [],
        provider.getRecentlyAddedBooks?.(20) ?? [],
        provider.getContinueReading?.(20) ?? [],
        provider.getRecentlyUpdatedSeries?.(20) ?? [],
      ]);
      set({ recentlyAdded, recentlyAddedBooks, continueReading, recentlyUpdatedSeries, loadingHome: false });
    } catch (e: any) {
      set({ loadingHome: false, error: e?.message ?? 'Failed to load home data' });
    }
  },
}));

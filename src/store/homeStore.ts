import { create } from 'zustand';
import type { Book, ILibraryProvider } from '@/providers';

interface HomeState {
  recentlyAdded: Book[];
  continueReading: Book[];
  wantToRead: Book[];
  isLoading: boolean;
  error: string | null;

  fetchHomeData: (provider: ILibraryProvider) => Promise<void>;
  fetchWantToRead: (provider: ILibraryProvider, page?: number) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  recentlyAdded: [],
  continueReading: [],
  wantToRead: [],
  isLoading: false,
  error: null,

  fetchHomeData: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      const [recentlyAdded, continueReading] = await Promise.all([
        provider.getRecentlyAdded?.(20) ?? [],
        provider.getContinueReading?.(20) ?? [],
      ]);
      set({ recentlyAdded, continueReading, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load home data' });
    }
  },

  fetchWantToRead: async (provider, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const wantToRead = await provider.getWantToRead?.(page, 50) ?? [];
      set({ wantToRead, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load want to read' });
    }
  },
}));

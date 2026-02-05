import { create } from 'zustand';
import type { Book } from '@/providers';
import type { ServerConfig } from './authStore';
import { createProvider } from './authStore';

interface HomeState {
  recentlyAdded: Book[];
  continueReading: Book[];
  wantToRead: Book[];
  isLoading: boolean;
  error: string | null;

  fetchHomeData: (config: ServerConfig, token: string) => Promise<void>;
  fetchWantToRead: (config: ServerConfig, token: string, page?: number) => Promise<void>;
}

export const useHomeStore = create<HomeState>((set) => ({
  recentlyAdded: [],
  continueReading: [],
  wantToRead: [],
  isLoading: false,
  error: null,

  fetchHomeData: async (config, token) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const [recentlyAdded, continueReading] = await Promise.all([
        provider.getRecentlyAdded?.(config.serverUrl, token, 20) ?? [],
        provider.getContinueReading?.(config.serverUrl, token, 20) ?? [],
      ]);
      set({ recentlyAdded, continueReading, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load home data' });
    }
  },

  fetchWantToRead: async (config, token, page = 0) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      const wantToRead = await provider.getWantToRead?.(config.serverUrl, token, page, 50) ?? [];
      set({ wantToRead, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load want to read' });
    }
  },
}));

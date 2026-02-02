import { create } from 'zustand';
import { KavitaProvider } from '@/providers';
import type { ReadingProgress, ILibraryProvider } from '@/providers';
import type { ProviderType, ServerConfig } from './authStore';

function getProvider(type: ProviderType): ILibraryProvider {
  switch (type) {
    case 'kavita':
      return new KavitaProvider();
  }
}

interface ProgressState {
  progress: Record<string, ReadingProgress>; // keyed by chapterId

  fetchProgress: (config: ServerConfig, token: string, chapterId: string) => Promise<ReadingProgress | null>;
  saveProgress: (config: ServerConfig, token: string, progress: ReadingProgress) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  fetchProgress: async (config, token, chapterId) => {
    try {
      const provider = getProvider(config.providerType);
      const p = await provider.getProgress(config.serverUrl, token, chapterId);
      if (p) {
        set((state) => ({ progress: { ...state.progress, [chapterId]: p } }));
      }
      return p;
    } catch {
      return null;
    }
  },

  saveProgress: async (config, token, progress) => {
    // Optimistic local update
    set((state) => ({ progress: { ...state.progress, [progress.chapterId]: progress } }));
    try {
      const provider = getProvider(config.providerType);
      await provider.saveProgress(config.serverUrl, token, progress);
    } catch {
      // Queue for retry when back online — offline sync TBD
    }
  },
}));

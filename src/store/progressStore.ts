import { create } from 'zustand';
import type { ReadingProgress } from '@/providers';
import type { ServerConfig } from './authStore';
import { createProvider } from './authStore';

interface ProgressState {
  progress: Record<string, ReadingProgress>; // keyed by chapterId/bookId

  fetchProgress: (config: ServerConfig, token: string, chapterId: string) => Promise<ReadingProgress | null>;
  saveProgress: (config: ServerConfig, token: string, progress: ReadingProgress) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  fetchProgress: async (config, token, chapterId) => {
    try {
      const provider = createProvider(config.providerType);
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
    set((state) => ({ progress: { ...state.progress, [progress.chapterId]: progress } }));
    try {
      const provider = createProvider(config.providerType);
      await provider.saveProgress(config.serverUrl, token, progress);
    } catch {
      // offline — retry on next save
    }
  },
}));

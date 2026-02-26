import { create } from 'zustand';
import type { ReadingProgress, ILibraryProvider } from '@/providers';

interface ProgressState {
  progress: Record<string, ReadingProgress>; // keyed by chapterId/bookId

  fetchProgress: (provider: ILibraryProvider, chapterId: string) => Promise<ReadingProgress | null>;
  saveProgress: (provider: ILibraryProvider, progress: ReadingProgress) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: {},

  fetchProgress: async (provider, chapterId) => {
    try {
      const p = await provider.getProgress(chapterId);
      if (p) {
        set((state) => ({ progress: { ...state.progress, [chapterId]: p } }));
      }
      return p;
    } catch {
      return null;
    }
  },

  saveProgress: async (provider, progress) => {
    set((state) => ({ progress: { ...state.progress, [progress.chapterId]: progress } }));
    try {
      await provider.saveProgress(progress);
    } catch {
      // offline — retry on next save
    }
  },
}));

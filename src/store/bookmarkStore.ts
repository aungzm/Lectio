import { create } from 'zustand';
import type { Bookmark } from '@/providers';
import type { ServerConfig } from './authStore';
import { createProvider } from './authStore';

interface BookmarkState {
  bookmarksBySeriesId: Record<string, Bookmark[]>;
  isLoading: boolean;
  error: string | null;

  fetchBookmarks: (config: ServerConfig, token: string, seriesId: string) => Promise<void>;
  addBookmark: (config: ServerConfig, token: string, bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
  removeBookmark: (config: ServerConfig, token: string, bookmark: Bookmark) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarksBySeriesId: {},
  isLoading: false,
  error: null,

  fetchBookmarks: async (config, token, seriesId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getBookmarks) {
        set({ isLoading: false });
        return;
      }
      const bookmarks = await provider.getBookmarks(config.serverUrl, token, seriesId);
      set((state) => ({
        bookmarksBySeriesId: { ...state.bookmarksBySeriesId, [seriesId]: bookmarks },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load bookmarks' });
    }
  },

  addBookmark: async (config, token, bookmark) => {
    // Optimistic update with a temp id
    const tempId = `temp-${Date.now()}`;
    const optimistic: Bookmark = { id: tempId, ...bookmark };
    set((state) => ({
      bookmarksBySeriesId: {
        ...state.bookmarksBySeriesId,
        [bookmark.seriesId]: [
          ...(state.bookmarksBySeriesId[bookmark.seriesId] ?? []),
          optimistic,
        ],
      },
    }));
    try {
      const provider = createProvider(config.providerType);
      if (!provider.addBookmark) return;
      const saved = await provider.addBookmark(config.serverUrl, token, bookmark);
      // Replace temp entry with real server id
      set((state) => ({
        bookmarksBySeriesId: {
          ...state.bookmarksBySeriesId,
          [bookmark.seriesId]: (state.bookmarksBySeriesId[bookmark.seriesId] ?? []).map(
            (b) => (b.id === tempId ? saved : b),
          ),
        },
      }));
    } catch (e: any) {
      // Roll back optimistic update
      set((state) => ({
        bookmarksBySeriesId: {
          ...state.bookmarksBySeriesId,
          [bookmark.seriesId]: (state.bookmarksBySeriesId[bookmark.seriesId] ?? []).filter(
            (b) => b.id !== tempId,
          ),
        },
        error: e?.message ?? 'Failed to save bookmark',
      }));
    }
  },

  removeBookmark: async (config, token, bookmark) => {
    // Optimistic removal
    set((state) => ({
      bookmarksBySeriesId: {
        ...state.bookmarksBySeriesId,
        [bookmark.seriesId]: (state.bookmarksBySeriesId[bookmark.seriesId] ?? []).filter(
          (b) => b.id !== bookmark.id,
        ),
      },
    }));
    try {
      const provider = createProvider(config.providerType);
      if (!provider.removeBookmark) return;
      await provider.removeBookmark(config.serverUrl, token, bookmark);
    } catch (e: any) {
      // Re-fetch on failure to restore correct state
      await get().fetchBookmarks(config, token, bookmark.seriesId);
      set({ error: e?.message ?? 'Failed to remove bookmark' });
    }
  },
}));

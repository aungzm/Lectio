import { create } from 'zustand';
import type { Bookmark, ILibraryProvider } from '@/providers';

interface BookmarkState {
  bookmarksBySeriesId: Record<string, Bookmark[]>;
  isLoading: boolean;
  error: string | null;

  fetchBookmarks: (provider: ILibraryProvider, seriesId: string) => Promise<void>;
  addBookmark: (provider: ILibraryProvider, bookmark: Omit<Bookmark, 'id'>) => Promise<void>;
  removeBookmark: (provider: ILibraryProvider, bookmark: Bookmark) => Promise<void>;
}

export const useBookmarkStore = create<BookmarkState>((set, get) => ({
  bookmarksBySeriesId: {},
  isLoading: false,
  error: null,

  fetchBookmarks: async (provider, seriesId) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getBookmarks) {
        set({ isLoading: false });
        return;
      }
      const bookmarks = await provider.getBookmarks(seriesId);
      set((state) => ({
        bookmarksBySeriesId: { ...state.bookmarksBySeriesId, [seriesId]: bookmarks },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load bookmarks' });
    }
  },

  addBookmark: async (provider, bookmark) => {
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
      if (!provider.addBookmark) return;
      const saved = await provider.addBookmark(bookmark);
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

  removeBookmark: async (provider, bookmark) => {
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
      if (!provider.removeBookmark) return;
      await provider.removeBookmark(bookmark);
    } catch (e: any) {
      // Re-fetch on failure to restore correct state
      await get().fetchBookmarks(provider, bookmark.seriesId);
      set({ error: e?.message ?? 'Failed to remove bookmark' });
    }
  },
}));

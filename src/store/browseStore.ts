import { create } from 'zustand';
import type { Author, Collection, ReadList, Book, ILibraryProvider } from '@/providers';

interface BrowseState {
  authors: Author[];
  seriesByAuthor: Record<string, Book[]>;
  collections: Collection[];
  seriesByCollection: Record<string, Book[]>;
  readLists: ReadList[];
  booksByReadList: Record<string, Book[]>;
  isLoading: boolean;
  error: string | null;

  fetchAuthors: (provider: ILibraryProvider, page?: number, search?: string) => Promise<void>;
  fetchSeriesByAuthor: (provider: ILibraryProvider, authorId: string) => Promise<void>;
  fetchCollections: (provider: ILibraryProvider) => Promise<void>;
  fetchCollectionSeries: (provider: ILibraryProvider, collectionId: string) => Promise<void>;
  fetchReadLists: (provider: ILibraryProvider) => Promise<void>;
  fetchReadListBooks: (provider: ILibraryProvider, readListId: string) => Promise<void>;
}

export const useBrowseStore = create<BrowseState>((set, get) => ({
  authors: [],
  seriesByAuthor: {},
  collections: [],
  seriesByCollection: {},
  readLists: [],
  booksByReadList: {},
  isLoading: false,
  error: null,

  fetchAuthors: async (provider, page = 0, search) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getAuthors) {
        set({ isLoading: false });
        return;
      }
      const authors = await provider.getAuthors(page, 50, search);
      set({ authors, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load authors' });
    }
  },

  fetchSeriesByAuthor: async (provider, authorId) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getSeriesByAuthor) {
        set({ isLoading: false });
        return;
      }
      const series = await provider.getSeriesByAuthor(authorId, 0, 50);
      set((state) => ({
        seriesByAuthor: { ...state.seriesByAuthor, [authorId]: series },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load series by author' });
    }
  },

  fetchCollections: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getCollections) {
        set({ isLoading: false });
        return;
      }
      const collections = await provider.getCollections();
      set({ collections, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load collections' });
    }
  },

  fetchCollectionSeries: async (provider, collectionId) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getCollectionSeries) {
        set({ isLoading: false });
        return;
      }
      const series = await provider.getCollectionSeries(collectionId, 0, 50);
      set((state) => ({
        seriesByCollection: { ...state.seriesByCollection, [collectionId]: series },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load collection series' });
    }
  },

  fetchReadLists: async (provider) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getReadLists) {
        set({ isLoading: false });
        return;
      }
      const readLists = await provider.getReadLists();
      set({ readLists, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load reading lists' });
    }
  },

  fetchReadListBooks: async (provider, readListId) => {
    set({ isLoading: true, error: null });
    try {
      if (!provider.getReadListBooks) {
        set({ isLoading: false });
        return;
      }
      const books = await provider.getReadListBooks(readListId, 0, 50);
      set((state) => ({
        booksByReadList: { ...state.booksByReadList, [readListId]: books },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load reading list books' });
    }
  },
}));

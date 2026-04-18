import { create } from 'zustand';
import type { Author, Collection, ReadList, Book, ILibraryProvider } from '@/providers';

interface BrowseState {
  authors: Author[];
  seriesByAuthor: Record<string, Book[]>;
  booksByAuthor: Record<string, Book[]>;
  collections: Collection[];
  seriesByCollection: Record<string, Book[]>;
  readLists: ReadList[];
  booksByReadList: Record<string, Book[]>;
  loadingAuthors: boolean;
  loadingSeriesByAuthor: boolean;
  loadingBooksByAuthor: boolean;
  loadingCollections: boolean;
  loadingCollectionSeries: boolean;
  loadingReadLists: boolean;
  loadingReadListBooks: boolean;
  error: string | null;

  fetchAuthors: (provider: ILibraryProvider, page?: number, search?: string) => Promise<void>;
  fetchSeriesByAuthor: (provider: ILibraryProvider, authorId: string) => Promise<void>;
  fetchBooksByAuthor: (provider: ILibraryProvider, authorId: string) => Promise<void>;
  fetchCollections: (provider: ILibraryProvider) => Promise<void>;
  fetchCollectionSeries: (provider: ILibraryProvider, collectionId: string) => Promise<void>;
  fetchReadLists: (provider: ILibraryProvider) => Promise<void>;
  fetchReadListBooks: (provider: ILibraryProvider, readListId: string) => Promise<void>;
}

export const useBrowseStore = create<BrowseState>((set, get) => ({
  authors: [],
  seriesByAuthor: {},
  booksByAuthor: {},
  collections: [],
  seriesByCollection: {},
  readLists: [],
  booksByReadList: {},
  loadingAuthors: false,
  loadingSeriesByAuthor: false,
  loadingBooksByAuthor: false,
  loadingCollections: false,
  loadingCollectionSeries: false,
  loadingReadLists: false,
  loadingReadListBooks: false,
  error: null,

  fetchAuthors: async (provider, page = 0, search) => {
    set({ loadingAuthors: true, error: null });
    try {
      if (!provider.getAuthors) {
        set({ loadingAuthors: false });
        return;
      }
      const authors = await provider.getAuthors(page, 50, search);
      set({ authors, loadingAuthors: false });
    } catch (e: any) {
      set({ loadingAuthors: false, error: e?.message ?? 'Failed to load authors' });
    }
  },

  fetchSeriesByAuthor: async (provider, authorId) => {
    set({ loadingSeriesByAuthor: true, error: null });
    try {
      if (!provider.getSeriesByAuthor) {
        set({ loadingSeriesByAuthor: false });
        return;
      }
      const series = await provider.getSeriesByAuthor(authorId, 0, 50);
      set((state) => ({
        seriesByAuthor: { ...state.seriesByAuthor, [authorId]: series },
        loadingSeriesByAuthor: false,
      }));
    } catch (e: any) {
      set({ loadingSeriesByAuthor: false, error: e?.message ?? 'Failed to load series by author' });
    }
  },

  fetchBooksByAuthor: async (provider, authorId) => {
    set({ loadingBooksByAuthor: true, error: null });
    try {
      if (!provider.getBooksByAuthor) {
        set({ loadingBooksByAuthor: false });
        return;
      }
      const books = await provider.getBooksByAuthor(authorId, 0, 100);
      set((state) => ({
        booksByAuthor: { ...state.booksByAuthor, [authorId]: books },
        loadingBooksByAuthor: false,
      }));
    } catch (e: any) {
      set({ loadingBooksByAuthor: false, error: e?.message ?? 'Failed to load books by author' });
    }
  },

  fetchCollections: async (provider) => {
    set({ loadingCollections: true, error: null });
    try {
      if (!provider.getCollections) {
        set({ loadingCollections: false });
        return;
      }
      const collections = await provider.getCollections();
      set({ collections, loadingCollections: false });
    } catch (e: any) {
      set({ loadingCollections: false, error: e?.message ?? 'Failed to load collections' });
    }
  },

  fetchCollectionSeries: async (provider, collectionId) => {
    set({ loadingCollectionSeries: true, error: null });
    try {
      if (!provider.getCollectionSeries) {
        set({ loadingCollectionSeries: false });
        return;
      }
      const series = await provider.getCollectionSeries(collectionId, 0, 50);
      set((state) => ({
        seriesByCollection: { ...state.seriesByCollection, [collectionId]: series },
        loadingCollectionSeries: false,
      }));
    } catch (e: any) {
      set({ loadingCollectionSeries: false, error: e?.message ?? 'Failed to load collection series' });
    }
  },

  fetchReadLists: async (provider) => {
    set({ loadingReadLists: true, error: null });
    try {
      if (!provider.getReadLists) {
        set({ loadingReadLists: false });
        return;
      }
      const readLists = await provider.getReadLists();
      set({ readLists, loadingReadLists: false });
    } catch (e: any) {
      set({ loadingReadLists: false, error: e?.message ?? 'Failed to load reading lists' });
    }
  },

  fetchReadListBooks: async (provider, readListId) => {
    set({ loadingReadListBooks: true, error: null });
    try {
      if (!provider.getReadListBooks) {
        set({ loadingReadListBooks: false });
        return;
      }
      const books = await provider.getReadListBooks(readListId, 0, 50);
      set((state) => ({
        booksByReadList: { ...state.booksByReadList, [readListId]: books },
        loadingReadListBooks: false,
      }));
    } catch (e: any) {
      set({ loadingReadListBooks: false, error: e?.message ?? 'Failed to load reading list books' });
    }
  },
}));

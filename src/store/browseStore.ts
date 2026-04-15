import { create } from 'zustand';
import type { Author, Collection, ReadList, Book, AuthorChapter } from '@/providers';
import type { ServerConfig } from './authStore';
import { createProvider } from './authStore';

interface BrowseState {
  authors: Author[];
  seriesByAuthor: Record<string, Book[]>;
  chaptersByAuthor: Record<string, AuthorChapter[]>;
  collections: Collection[];
  seriesByCollection: Record<string, Book[]>;
  readLists: ReadList[];
  booksByReadList: Record<string, Book[]>;
  isLoading: boolean;
  error: string | null;

  fetchAuthors: (config: ServerConfig, token: string, page?: number, search?: string) => Promise<void>;
  fetchSeriesByAuthor: (config: ServerConfig, token: string, authorId: string) => Promise<void>;
  fetchChaptersByAuthor: (config: ServerConfig, token: string, authorId: string, apiKey: string) => Promise<void>;
  fetchCollections: (config: ServerConfig, token: string) => Promise<void>;
  fetchCollectionSeries: (config: ServerConfig, token: string, collectionId: string) => Promise<void>;
  fetchReadLists: (config: ServerConfig, token: string) => Promise<void>;
  fetchReadListBooks: (config: ServerConfig, token: string, readListId: string) => Promise<void>;
}

export const useBrowseStore = create<BrowseState>((set, get) => ({
  authors: [],
  seriesByAuthor: {},
  chaptersByAuthor: {},
  collections: [],
  seriesByCollection: {},
  readLists: [],
  booksByReadList: {},
  isLoading: false,
  error: null,

  fetchAuthors: async (config, token, page = 0, search) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getAuthors) {
        set({ isLoading: false });
        return;
      }
      const authors = await provider.getAuthors(config.serverUrl, token, page, 50, search);
      set({ authors, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load authors' });
    }
  },

  fetchSeriesByAuthor: async (config, token, authorId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getSeriesByAuthor) {
        set({ isLoading: false });
        return;
      }
      const series = await provider.getSeriesByAuthor(config.serverUrl, token, authorId, 0, 50);
      set((state) => ({
        seriesByAuthor: { ...state.seriesByAuthor, [authorId]: series },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load series by author' });
    }
  },

  fetchChaptersByAuthor: async (config, token, authorId, apiKey) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getChaptersByAuthor) {
        set({ isLoading: false });
        return;
      }
      const chapters = await provider.getChaptersByAuthor(config.serverUrl, token, authorId, apiKey);
      set((state) => ({
        chaptersByAuthor: { ...state.chaptersByAuthor, [authorId]: chapters },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load chapters by author' });
    }
  },

  fetchCollections: async (config, token) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getCollections) {
        set({ isLoading: false });
        return;
      }
      const collections = await provider.getCollections(config.serverUrl, token);
      set({ collections, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load collections' });
    }
  },

  fetchCollectionSeries: async (config, token, collectionId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getCollectionSeries) {
        set({ isLoading: false });
        return;
      }
      const series = await provider.getCollectionSeries(config.serverUrl, token, collectionId, 0, 50);
      set((state) => ({
        seriesByCollection: { ...state.seriesByCollection, [collectionId]: series },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load collection series' });
    }
  },

  fetchReadLists: async (config, token) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getReadLists) {
        set({ isLoading: false });
        return;
      }
      const readLists = await provider.getReadLists(config.serverUrl, token);
      set({ readLists, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load reading lists' });
    }
  },

  fetchReadListBooks: async (config, token, readListId) => {
    set({ isLoading: true, error: null });
    try {
      const provider = createProvider(config.providerType);
      if (!provider.getReadListBooks) {
        set({ isLoading: false });
        return;
      }
      const books = await provider.getReadListBooks(config.serverUrl, token, readListId, 0, 50);
      set((state) => ({
        booksByReadList: { ...state.booksByReadList, [readListId]: books },
        isLoading: false,
      }));
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Failed to load reading list books' });
    }
  },
}));

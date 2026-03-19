import { create } from 'zustand';
import type {
  ILibraryProvider,
  Book,
  SearchFilters,
  PagedResult,
  FilterOptions,
} from '@/providers';

const PAGE_SIZE = 30;

interface FilterState {
  // Referential data (fetched once, cached)
  filterOptions: FilterOptions | null;
  loadingFilterOptions: boolean;
  fetchFilterOptions: (provider: ILibraryProvider) => Promise<void>;

  // Series search
  seriesResults: PagedResult<Book> | null;
  loadingSeriesSearch: boolean;
  searchSeries: (provider: ILibraryProvider, filters: SearchFilters, page?: number) => Promise<void>;

  // Books search
  bookResults: PagedResult<Book> | null;
  loadingBookSearch: boolean;
  searchBooks: (provider: ILibraryProvider, filters: SearchFilters, page?: number) => Promise<void>;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  filterOptions: null,
  loadingFilterOptions: false,

  seriesResults: null,
  loadingSeriesSearch: false,

  bookResults: null,
  loadingBookSearch: false,

  async fetchFilterOptions(provider) {
    if (get().filterOptions || get().loadingFilterOptions) return;
    if (!provider.getFilterOptions) return;
    set({ loadingFilterOptions: true });
    try {
      const options = await provider.getFilterOptions();
      set({ filterOptions: options });
    } catch (e) {
      console.warn('Failed to fetch filter options', e);
    } finally {
      set({ loadingFilterOptions: false });
    }
  },

  async searchSeries(provider, filters, page = 0) {
    if (!provider.searchSeries) return;
    set({ loadingSeriesSearch: true });
    try {
      const result = await provider.searchSeries(filters, page, PAGE_SIZE);
      if (page > 0) {
        const prev = get().seriesResults;
        set({
          seriesResults: prev
            ? { ...result, items: [...prev.items, ...result.items] }
            : result,
        });
      } else {
        set({ seriesResults: result });
      }
    } catch (e) {
      console.warn('Series search failed', e);
    } finally {
      set({ loadingSeriesSearch: false });
    }
  },

  async searchBooks(provider, filters, page = 0) {
    if (!provider.searchBooks) return;
    set({ loadingBookSearch: true });
    try {
      const result = await provider.searchBooks(filters, page, PAGE_SIZE);
      if (page > 0) {
        const prev = get().bookResults;
        set({
          bookResults: prev
            ? { ...result, items: [...prev.items, ...result.items] }
            : result,
        });
      } else {
        set({ bookResults: result });
      }
    } catch (e) {
      console.warn('Books search failed', e);
    } finally {
      set({ loadingBookSearch: false });
    }
  },
}));

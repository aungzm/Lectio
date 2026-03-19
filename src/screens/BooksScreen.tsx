import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { BookGrid } from '@/components/BookGrid';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useBookDetailNavigation } from '@/hooks/useBookDetailNavigation';
import type { SearchFilters, FilterType } from '@/providers';
import type { BooksScreenProps } from '@/navigation/types';

const BOOK_FILTER_TYPES: FilterType[] = [
  'readStatus',
  'tag',
  'libraryId',
];

export default function BooksScreen({ route }: BooksScreenProps) {
  const libraryId = route.params?.libraryId;
  const provider = useAuthStore((s) => s.provider);
  const { bookResults, loadingBookSearch, searchBooks, filterOptions, loadingFilterOptions, fetchFilterOptions } =
    useFilterStore();
  const getCoverUri = useCoverUri('getBookCoverUrl');
  const handlePress = useBookDetailNavigation();

  const lockedCriteria = libraryId ? [{ type: 'libraryId' as const, value: libraryId }] : [];
  const lockedTypes: FilterType[] = libraryId ? ['libraryId'] : [];

  const [filters, setFilters] = useState<SearchFilters>({
    criteria: [...lockedCriteria],
  });
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    (f: SearchFilters, page = 0) => {
      if (!provider) return;
      searchBooks(provider, f, page);
    },
    [provider, searchBooks],
  );

  useEffect(() => {
    doSearch(filters, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const updated = { ...filters, fullTextSearch: searchText || undefined };
      setFilters(updated);
      doSearch(updated, 0);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const handleFiltersChange = useCallback(
    (newFilters: SearchFilters) => {
      setFilters(newFilters);
      doSearch(newFilters, 0);
    },
    [doSearch],
  );

  const handleEndReached = useCallback(() => {
    if (loadingBookSearch) return;
    if (!bookResults) return;
    if (bookResults.currentPage + 1 >= bookResults.totalPages) return;
    doSearch(filters, bookResults.currentPage + 1);
  }, [loadingBookSearch, bookResults, filters, doSearch]);

  const handleLoadOptions = useCallback(() => {
    if (provider) fetchFilterOptions(provider);
  }, [provider, fetchFilterOptions]);

  const items = bookResults?.items ?? [];
  const isInitialLoad = loadingBookSearch && items.length === 0;

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  const header = (
    <View>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search books…"
      />
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
        availableTypes={BOOK_FILTER_TYPES}
        lockedTypes={lockedTypes}
        onLoadOptions={handleLoadOptions}
        loading={loadingFilterOptions}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <BookGrid
        items={items}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={handlePress}
        emptyText="No books found."
        ListHeaderComponent={header}
        onEndReached={handleEndReached}
        loadingMore={loadingBookSearch && items.length > 0}
      />
    </View>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { BookGrid } from '@/components/BookGrid';
import { SearchBar } from '@/components/SearchBar';
import { FilterBar } from '@/components/FilterBar';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useCoverUri } from '@/hooks/useCoverUri';
import type { SearchFilters, FilterType } from '@/providers';
import type { SeriesScreenProps } from '@/navigation/types';

const SERIES_FILTER_TYPES: FilterType[] = [
  'readStatus',
  'genre',
  'tag',
  'publisher',
  'language',
  'seriesStatus',
  'libraryId',
  'complete',
];

export default function SeriesScreen({ route, navigation }: SeriesScreenProps) {
  const libraryId = route.params?.libraryId;
  const provider = useAuthStore((s) => s.provider);
  const { seriesResults, loadingSeriesSearch, searchSeries, filterOptions, loadingFilterOptions, fetchFilterOptions } =
    useFilterStore();
  const getCoverUri = useCoverUri();

  // Build initial criteria with locked libraryId if present
  const lockedCriteria = libraryId ? [{ type: 'libraryId' as const, value: libraryId }] : [];
  const lockedTypes: FilterType[] = libraryId ? ['libraryId'] : [];

  const [filters, setFilters] = useState<SearchFilters>({
    criteria: [...lockedCriteria],
  });
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pageRef = useRef(0);

  // Trigger search when filters change
  const doSearch = useCallback(
    (f: SearchFilters, page = 0) => {
      if (!provider) return;
      pageRef.current = page;
      searchSeries(provider, f, page);
    },
    [provider, searchSeries],
  );

  // Initial load
  useEffect(() => {
    doSearch(filters, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // Debounced text search
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
    if (loadingSeriesSearch) return;
    if (!seriesResults) return;
    if (seriesResults.currentPage + 1 >= seriesResults.totalPages) return;
    doSearch(filters, seriesResults.currentPage + 1);
  }, [loadingSeriesSearch, seriesResults, filters, doSearch]);

  const handleLoadOptions = useCallback(() => {
    if (provider) fetchFilterOptions(provider);
  }, [provider, fetchFilterOptions]);

  const items = seriesResults?.items ?? [];
  const isInitialLoad = loadingSeriesSearch && items.length === 0;

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  const header = (
    <View>
      <SearchBar
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search series…"
      />
      <FilterBar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        filterOptions={filterOptions}
        availableTypes={SERIES_FILTER_TYPES}
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
        onPress={(book) =>
          navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })
        }
        emptyText="No series found."
        ListHeaderComponent={header}
        onEndReached={handleEndReached}
        loadingMore={loadingSeriesSearch && items.length > 0}
      />
    </View>
  );
}

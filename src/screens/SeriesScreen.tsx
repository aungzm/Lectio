import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { BookGrid } from '@/components/BookGrid';
import { FilterBar } from '@/components/FilterBar';
import { BrowseTopBar } from '@/components/BrowseTopBar';
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
  const provider = useAuthStore((state) => state.provider);
  const {
    seriesResults,
    loadingSeriesSearch,
    searchSeries,
    filterOptions,
    loadingFilterOptions,
    fetchFilterOptions,
  } = useFilterStore();
  const getCoverUri = useCoverUri();

  const lockedCriteria = libraryId ? [{ type: 'libraryId' as const, value: libraryId }] : [];
  const lockedTypes: FilterType[] = libraryId ? ['libraryId'] : [];

  const [filters, setFilters] = useState<SearchFilters>({
    criteria: [...lockedCriteria],
  });
  const [searchText, setSearchText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    (nextFilters: SearchFilters, page = 0) => {
      if (!provider) return;
      searchSeries(provider, nextFilters, page);
    },
    [provider, searchSeries],
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
    (nextFilters: SearchFilters) => {
      setFilters(nextFilters);
      doSearch(nextFilters, 0);
    },
    [doSearch],
  );

  const handleEndReached = useCallback(() => {
    if (loadingSeriesSearch || !seriesResults) return;
    if (seriesResults.currentPage + 1 >= seriesResults.totalPages) return;
    doSearch(filters, seriesResults.currentPage + 1);
  }, [loadingSeriesSearch, seriesResults, filters, doSearch]);

  const handleLoadOptions = useCallback(() => {
    if (provider) fetchFilterOptions(provider);
  }, [provider, fetchFilterOptions]);

  const items = seriesResults?.items ?? [];
  const isInitialLoad = loadingSeriesSearch && items.length === 0;
  const activeFilterCount = filters.criteria.filter((criterion) => !lockedTypes.includes(criterion.type)).length;

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <BookGrid
        items={items}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
        ListHeaderComponent={
          <BrowseTopBar
            title="Series"
            subtitle="Browse full runs, discover fresh arrivals, and only open search or filters when you want them."
            searchValue={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search series..."
            resultCount={items.length}
            resultLabel={items.length === 1 ? 'result' : 'results'}
            activeFilterCount={activeFilterCount}
            filterContent={
              <FilterBar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                filterOptions={filterOptions}
                availableTypes={SERIES_FILTER_TYPES}
                lockedTypes={lockedTypes}
                onLoadOptions={handleLoadOptions}
                loading={loadingFilterOptions}
              />
            }
          />
        }
        onEndReached={handleEndReached}
        loadingMore={loadingSeriesSearch && items.length > 0}
      />
    </View>
  );
}

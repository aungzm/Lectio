import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { BookGrid } from '@/components/BookGrid';
import { FilterBar } from '@/components/FilterBar';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
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
  const searchButtonActive = searchOpen || Boolean(searchText);
  const filterButtonActive = filtersOpen || activeFilterCount > 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View className="items-center justify-center">
          <View className="relative overflow-hidden rounded-full border border-primary-100 bg-primary-50 px-6 py-2">
            <View className="absolute -left-2 top-1 h-4 w-4 rounded-full bg-primary-100/80" />
            <View className="absolute right-3 top-0.5 h-3 w-3 rounded-full bg-white/70" />
            <View className="absolute -right-1 bottom-0.5 h-5 w-5 rounded-full bg-primary-100/60" />
            <Text className="text-xl font-bold tracking-[0.2px] text-secondary">Series</Text>
          </View>
        </View>
      ),
      headerTitleAlign: 'center',
      headerLeft: () => <NavIconButton type="drawer" />,
      headerRight: () => (
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => setSearchOpen((value) => !value)}
            className={`rounded-full border px-3 py-3 ${
              searchButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
            }`}
          >
            {searchButtonActive ? <X size={18} color="#ffffff" /> : <Search size={18} color="#000000" />}
          </Pressable>
          <Pressable
            onPress={() => setFiltersOpen((value) => !value)}
            className={`rounded-full border px-3 py-3 ${
              filterButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
            }`}
          >
            <View>
              <SlidersHorizontal size={18} color={filterButtonActive ? '#ffffff' : '#000000'} />
              {activeFilterCount > 0 ? (
                <View className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-accent px-1 py-0.5">
                  <Text className="text-center text-[10px] font-bold text-primary">{activeFilterCount}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>
      ),
    });
  }, [activeFilterCount, filterButtonActive, navigation, searchButtonActive]);

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
          <View className="px-4 pt-2 pb-3">
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              {items.length} {items.length === 1 ? 'result' : 'results'}
            </Text>

            {searchOpen ? (
              <View className="mt-3 rounded-2xl border border-border bg-surface">
                <SearchBar
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Search series..."
                />
              </View>
            ) : null}

            {filtersOpen ? (
              <View className="mt-3 rounded-2xl border border-border bg-surface py-2">
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
            ) : null}
          </View>
        }
        onEndReached={handleEndReached}
        loadingMore={loadingSeriesSearch && items.length > 0}
      />
    </View>
  );
}

import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { AnimatedBrowseTopBar } from '@/components/AnimatedBrowseTopBar';
import { BookGrid } from '@/components/BookGrid';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
import { SeriesFilterModal, SERIES_FILTER_TYPES } from '@/components/SeriesFilterModal';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useScrollAwareHeader } from '@/hooks/useScrollAwareHeader';
import type { SearchFilters, FilterType } from '@/providers';
import { useThemeColors } from '@/theme/useThemeColors';
import type { SeriesScreenProps } from '@/navigation/types';

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
  const { primary, secondary } = useThemeColors();

  const lockedCriteria = libraryId ? [{ type: 'libraryId' as const, value: libraryId }] : [];
  const lockedTypes: FilterType[] = libraryId ? ['libraryId'] : [];

  const [filters, setFilters] = useState<SearchFilters>({
    criteria: [...lockedCriteria],
  });
  const [searchText, setSearchText] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { headerVisible, handleScroll } = useScrollAwareHeader({
    lockedVisible: searchOpen || filtersOpen,
  });

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

  const handleOpenFilters = useCallback(() => {
    setFiltersOpen(true);
    handleLoadOptions();
  }, [handleLoadOptions]);

  const items = seriesResults?.items ?? [];
  const isInitialLoad = loadingSeriesSearch && items.length === 0;
  const activeFilterCount = filters.criteria.filter((criterion) => !lockedTypes.includes(criterion.type)).length;
  const searchButtonActive = searchOpen || Boolean(searchText);
  const filterButtonActive = filtersOpen || activeFilterCount > 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <AnimatedBrowseTopBar
        title="Series"
        visible={headerVisible}
        leftSlot={<NavIconButton type="drawer" />}
        rightSlot={
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => setSearchOpen((value) => !value)}
              className={`rounded-full border px-3 py-3 ${
                searchButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
              }`}
            >
              {searchButtonActive ? <X size={18} color={primary} /> : <Search size={18} color={secondary} />}
            </Pressable>
            <Pressable
              onPress={() => (filtersOpen ? setFiltersOpen(false) : handleOpenFilters())}
              className={`rounded-full border px-3 py-3 ${
                filterButtonActive ? 'border-secondary bg-secondary' : 'border-border bg-primary'
              }`}
            >
              <View>
                <SlidersHorizontal size={18} color={filterButtonActive ? primary : secondary} />
                {activeFilterCount > 0 ? (
                  <View className="absolute -right-3 -top-3 min-w-[18px] rounded-full bg-accent px-1 py-0.5">
                    <Text className="text-center text-[10px] font-bold text-accent-contrast">{activeFilterCount}</Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          </View>
        }
      />

      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-accent-soft">
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search series..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={items}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={(book) => navigation.navigate('SeriesDetail', { seriesId: book.id, title: book.title })}
        emptyText="No series found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Chip label={`${items.length} series`} />
          </View>
        }
        onEndReached={handleEndReached}
        loadingMore={loadingSeriesSearch && items.length > 0}
        onScroll={handleScroll}
      />

      <SeriesFilterModal
        visible={filtersOpen}
        filters={filters}
        onApply={handleFiltersChange}
        onClose={() => setFiltersOpen(false)}
        filterOptions={filterOptions}
        availableTypes={SERIES_FILTER_TYPES}
        lockedTypes={lockedTypes}
        onLoadOptions={handleLoadOptions}
        loading={loadingFilterOptions}
        notesByType={{
          seriesStatus: 'Use this for publishing state like ongoing or ended.',
          complete: 'Use this for a simple complete vs incomplete library flag. It is separate from publishing status.',
        }}
      />
    </View>
  );
}

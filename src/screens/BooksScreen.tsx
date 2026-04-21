import React, { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useFilterStore } from '@/store/filterStore';
import { BookGrid } from '@/components/BookGrid';
import { BrowseHeaderTitle } from '@/components/BrowseHeaderTitle';
import { Chip } from '@/components/Chip';
import { LoadingScreen } from '@/components/LoadingScreen';
import NavIconButton from '@/components/NavIconButton';
import { SearchBar } from '@/components/SearchBar';
import { BOOK_FILTER_TYPES, SeriesFilterModal } from '@/components/SeriesFilterModal';
import { useCoverUri } from '@/hooks/useCoverUri';
import { useBookDetailNavigation } from '@/hooks/useBookDetailNavigation';
import { useThemeColors } from '@/theme/useThemeColors';
import type { SearchFilters, FilterType } from '@/providers';
import type { BooksScreenProps } from '@/navigation/types';

export default function BooksScreen({ route, navigation }: BooksScreenProps) {
  const libraryId = route.params?.libraryId;
  const provider = useAuthStore((state) => state.provider);
  const {
    bookResults,
    loadingBookSearch,
    searchBooks,
    filterOptions,
    loadingFilterOptions,
    fetchFilterOptions,
  } = useFilterStore();
  const getCoverUri = useCoverUri('getBookCoverUrl');
  const handlePress = useBookDetailNavigation();
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

  const doSearch = useCallback(
    (nextFilters: SearchFilters, page = 0) => {
      if (!provider) return;
      searchBooks(provider, nextFilters, page);
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
    (nextFilters: SearchFilters) => {
      setFilters(nextFilters);
      doSearch(nextFilters, 0);
    },
    [doSearch],
  );

  const handleEndReached = useCallback(() => {
    if (loadingBookSearch || !bookResults) return;
    if (bookResults.currentPage + 1 >= bookResults.totalPages) return;
    doSearch(filters, bookResults.currentPage + 1);
  }, [loadingBookSearch, bookResults, filters, doSearch]);

  const handleLoadOptions = useCallback(() => {
    if (provider) fetchFilterOptions(provider);
  }, [provider, fetchFilterOptions]);

  const handleOpenFilters = useCallback(() => {
    setFiltersOpen(true);
    handleLoadOptions();
  }, [handleLoadOptions]);

  const items = bookResults?.items ?? [];
  const isInitialLoad = loadingBookSearch && items.length === 0;
  const activeFilterCount = filters.criteria.filter((criterion) => !lockedTypes.includes(criterion.type)).length;
  const searchButtonActive = searchOpen || Boolean(searchText);
  const filterButtonActive = filtersOpen || activeFilterCount > 0;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <BrowseHeaderTitle label="Books" />,
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
      ),
    });
  }, [activeFilterCount, filterButtonActive, navigation, searchButtonActive]);

  if (isInitialLoad) {
    return <LoadingScreen />;
  }

  return (
    <View className="flex-1 bg-background">
      <View className="px-4 pb-1">
        {searchOpen ? (
          <View className="mt-2 rounded-[26px] bg-accent-soft">
            <SearchBar value={searchText} onChangeText={setSearchText} placeholder="Search books..." />
          </View>
        ) : null}
      </View>

      <BookGrid
        items={items}
        getCoverUri={(item) => getCoverUri(item.id)}
        getTitle={(item) => item.title}
        onPress={handlePress}
        emptyText="No books found."
        ListHeaderComponent={
          <View className="px-4 pb-3 pt-2">
            <Chip label={`${items.length} ${items.length === 1 ? 'book' : 'books'}`} />
          </View>
        }
        onEndReached={handleEndReached}
        loadingMore={loadingBookSearch && items.length > 0}
      />

      <SeriesFilterModal
        visible={filtersOpen}
        filters={filters}
        onApply={handleFiltersChange}
        onClose={() => setFiltersOpen(false)}
        filterOptions={filterOptions}
        availableTypes={BOOK_FILTER_TYPES}
        lockedTypes={lockedTypes}
        onLoadOptions={handleLoadOptions}
        loading={loadingFilterOptions}
        title="Filter Books"
        subtitle="Choose a few book-specific filters, then apply them together."
        emptyStateText="No book filters selected yet. Start with reading progress, one-shot, or library."
        notesByType={{
          oneShot: 'Use this to isolate standalone books or one-off releases from books in larger series runs.',
          tag: 'Your current Komga server returns no book-specific tags, so this may stay empty until tags are added.',
        }}
      />
    </View>
  );
}

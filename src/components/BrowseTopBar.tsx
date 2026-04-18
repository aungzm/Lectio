import React, { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { SearchBar } from '@/components/SearchBar';

interface BrowseTopBarProps {
  title: string;
  subtitle: string;
  searchValue: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder?: string;
  resultCount?: number;
  resultLabel?: string;
  filterContent?: React.ReactNode;
  activeFilterCount?: number;
}

export function BrowseTopBar({
  title,
  subtitle,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  resultLabel,
  filterContent,
  activeFilterCount = 0,
}: BrowseTopBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const countLabel = useMemo(() => {
    if (resultCount == null || !resultLabel) return null;
    return `${resultCount} ${resultLabel}`;
  }, [resultCount, resultLabel]);

  return (
    <View className="px-4 pt-4 pb-3">
      <View className="relative overflow-hidden rounded-[30px] border border-border bg-surface px-5 py-5">
        <View className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-100" />
        <View className="absolute -left-8 top-16 h-20 w-20 rounded-full bg-primary-50" />

        <View className="flex-row items-start justify-between">
          <View className="mr-4 flex-1">
            <Text className="text-3xl font-bold text-secondary">{title}</Text>
            <Text className="mt-2 text-sm leading-6 text-tertiary">{subtitle}</Text>
            {countLabel ? (
              <View className="mt-4 self-start rounded-full border border-border bg-background px-3 py-2">
                <Text className="text-xs font-semibold uppercase tracking-wide text-secondary">
                  {countLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setSearchOpen((value) => !value)}
              className={`rounded-full border px-3 py-3 ${
                searchOpen || searchValue ? 'border-secondary bg-secondary' : 'border-border bg-background'
              }`}
            >
              {searchOpen || searchValue ? (
                <X size={18} color="#ffffff" />
              ) : (
                <Search size={18} color="#000000" />
              )}
            </Pressable>
            {filterContent ? (
              <Pressable
                onPress={() => setFiltersOpen((value) => !value)}
                className={`rounded-full border px-3 py-3 ${
                  filtersOpen || activeFilterCount > 0
                    ? 'border-secondary bg-secondary'
                    : 'border-border bg-background'
                }`}
              >
                <View>
                  <SlidersHorizontal
                    size={18}
                    color={filtersOpen || activeFilterCount > 0 ? '#ffffff' : '#000000'}
                  />
                  {activeFilterCount > 0 ? (
                    <View className="absolute -right-2 -top-2 min-w-[18px] rounded-full bg-accent px-1 py-0.5">
                      <Text className="text-center text-[10px] font-bold text-primary">
                        {activeFilterCount}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            ) : null}
          </View>
        </View>

        {searchOpen ? (
          <View className="mt-4 rounded-2xl border border-border bg-background">
            <SearchBar
              value={searchValue}
              onChangeText={onSearchChange}
              placeholder={searchPlaceholder}
            />
          </View>
        ) : null}

        {filtersOpen && filterContent ? (
          <View className="mt-4 rounded-2xl border border-border bg-background py-2">
            {filterContent}
          </View>
        ) : null}
      </View>
    </View>
  );
}

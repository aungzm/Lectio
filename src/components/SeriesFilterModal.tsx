import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SlidersHorizontal, X } from 'lucide-react-native';
import { Chip } from './Chip';
import type { FilterCriterion, FilterOptions, FilterType, SearchFilters } from '@/providers';
import { useThemeColors } from '@/theme/useThemeColors';

interface SeriesFilterModalProps {
  visible: boolean;
  filters: SearchFilters;
  filterOptions: FilterOptions | null;
  lockedTypes?: FilterType[];
  availableTypes?: FilterType[];
  loading?: boolean;
  title?: string;
  subtitle?: string;
  emptyStateText?: string;
  notesByType?: Partial<Record<FilterType, string>>;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  onLoadOptions?: () => void;
}

interface FilterSection {
  type: FilterType;
  title: string;
  description: string;
}

const READ_STATUS_OPTIONS = [
  { value: 'UNREAD', label: 'Unread' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'READ', label: 'Read' },
];

const SERIES_STATUS_OPTIONS = [
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'ENDED', label: 'Ended' },
  { value: 'HIATUS', label: 'Hiatus' },
  { value: 'ABANDONED', label: 'Abandoned' },
];

const BOOLEAN_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export const SERIES_FILTER_TYPES: FilterType[] = [
  'readStatus',
  'seriesStatus',
  'complete',
  'oneShot',
  'genre',
  'publisher',
  'language',
  'tag',
  'ageRating',
  'libraryId',
];

export const BOOK_FILTER_TYPES: FilterType[] = [
  'readStatus',
  'oneShot',
  'tag',
  'libraryId',
];

const FILTER_SECTIONS: FilterSection[] = [
  {
    type: 'readStatus',
    title: 'Read status',
    description: 'Separate unread series from in-progress and finished reads.',
  },
  {
    type: 'seriesStatus',
    title: 'Series status',
    description: 'Publishing state from Komga metadata, like ongoing, ended, hiatus, or abandoned.',
  },
  {
    type: 'complete',
    title: 'Library complete',
    description: 'Simple yes or no flag for whether this series is marked complete in your library.',
  },
  {
    type: 'oneShot',
    title: 'One-shot',
    description: 'Quickly isolate single-volume stories from longer runs.',
  },
  {
    type: 'genre',
    title: 'Genre',
    description: 'Browse by mood, theme, or story style.',
  },
  {
    type: 'publisher',
    title: 'Publisher',
    description: 'Narrow the shelf to a specific publisher or imprint.',
  },
  {
    type: 'language',
    title: 'Language',
    description: 'Keep the list focused on the languages you want to read.',
  },
  {
    type: 'tag',
    title: 'Tag',
    description: 'Use your custom metadata labels when they are available.',
  },
  {
    type: 'ageRating',
    title: 'Age rating',
    description: 'Filter by maturity level when your Komga library exposes it.',
  },
  {
    type: 'libraryId',
    title: 'Library',
    description: 'Switch between libraries when the screen is not already scoped.',
  },
];

export function getSeriesFilterTypeLabel(type: FilterType): string {
  return FILTER_SECTIONS.find((section) => section.type === type)?.title ?? type;
}

export function getSeriesFilterValueLabel(
  type: FilterType,
  value: string,
  filterOptions: FilterOptions | null,
): string {
  if (type === 'libraryId' && filterOptions) {
    return filterOptions.libraries.find((library) => library.id === value)?.name ?? value;
  }
  if (type === 'complete' || type === 'oneShot') {
    return value === 'true' ? 'Yes' : 'No';
  }
  return value.replaceAll('_', ' ');
}

export function getSeriesCriterionSummary(
  criterion: FilterCriterion,
  filterOptions: FilterOptions | null,
): string {
  return `${getSeriesFilterTypeLabel(criterion.type)}: ${getSeriesFilterValueLabel(
    criterion.type,
    criterion.value,
    filterOptions,
  )}`;
}

function getOptionsForType(
  type: FilterType,
  filterOptions: FilterOptions | null,
): { value: string; label: string }[] {
  switch (type) {
    case 'readStatus':
      return READ_STATUS_OPTIONS;
    case 'seriesStatus':
      return SERIES_STATUS_OPTIONS;
    case 'complete':
    case 'oneShot':
      return BOOLEAN_OPTIONS;
    case 'genre':
      return (filterOptions?.genres ?? []).map((value) => ({ value, label: value }));
    case 'publisher':
      return (filterOptions?.publishers ?? []).map((value) => ({ value, label: value }));
    case 'language':
      return (filterOptions?.languages ?? []).map((value) => ({ value, label: value }));
    case 'tag':
      return (filterOptions?.tags ?? []).map((value) => ({ value, label: value }));
    case 'ageRating':
      return (filterOptions?.ageRatings ?? []).map((value) => ({ value, label: value }));
    case 'libraryId':
      return (filterOptions?.libraries ?? []).map((library) => ({
        value: library.id,
        label: library.name,
      }));
    default:
      return [];
  }
}

function removeUnlockedCriteria(criteria: FilterCriterion[], lockedTypes: FilterType[]): FilterCriterion[] {
  return criteria.filter((criterion) => lockedTypes.includes(criterion.type));
}

export function SeriesFilterModal({
  visible,
  filters,
  filterOptions,
  lockedTypes = [],
  availableTypes = SERIES_FILTER_TYPES,
  loading = false,
  title = 'Filter Series',
  subtitle = 'Choose filters and see results update as you go.',
  emptyStateText = 'No filters selected yet. Start with reading progress, status, or genre.',
  notesByType,
  onClose,
  onApply,
  onLoadOptions,
}: SeriesFilterModalProps) {
  const { accent, accentSoft, accentSoftStrong, primary, tertiary } = useThemeColors();
  const visibleSections = useMemo(
    () =>
      FILTER_SECTIONS.filter(
        (section) => availableTypes.includes(section.type) && !lockedTypes.includes(section.type),
      ),
    [availableTypes, lockedTypes],
  );
  const [activeType, setActiveType] = useState<FilterType | null>(visibleSections[0]?.type ?? null);
  const [optionSearch, setOptionSearch] = useState('');

  useEffect(() => {
    if (!visible) return;

    setOptionSearch('');
    setActiveType((current) => {
      if (current && visibleSections.some((section) => section.type === current)) {
        return current;
      }
      return visibleSections[0]?.type ?? null;
    });

    if (!filterOptions && onLoadOptions) {
      onLoadOptions();
    }
  }, [visible, filters, visibleSections, filterOptions, onLoadOptions]);

  const activeSection = visibleSections.find((section) => section.type === activeType) ?? visibleSections[0] ?? null;
  const activeCriteria = filters.criteria.filter((criterion) => !lockedTypes.includes(criterion.type));
  const allOptions = activeSection ? getOptionsForType(activeSection.type, filterOptions) : [];
  const filteredOptions = allOptions.filter((option) =>
    option.label.toLowerCase().includes(optionSearch.trim().toLowerCase()),
  );

  const isSelected = useCallback(
    (type: FilterType, value: string) =>
      filters.criteria.some((criterion) => criterion.type === type && criterion.value === value),
    [filters.criteria],
  );

  const toggleCriterion = useCallback((type: FilterType, value: string) => {
    const exists = filters.criteria.some((criterion) => criterion.type === type && criterion.value === value);
    const nextFilters = {
      ...filters,
      criteria: exists
        ? filters.criteria.filter((criterion) => !(criterion.type === type && criterion.value === value))
        : [...filters.criteria, { type, value }],
    };
    onApply(nextFilters);
  }, [filters, onApply]);

  const removeCriterion = useCallback((criterion: FilterCriterion) => {
    onApply({
      ...filters,
      criteria: filters.criteria.filter(
        (item) => !(item.type === criterion.type && item.value === criterion.value),
      ),
    });
  }, [filters, onApply]);

  const clearAll = useCallback(() => {
    onApply({
      ...filters,
      criteria: removeUnlockedCriteria(filters.criteria, lockedTypes),
    });
  }, [filters, lockedTypes, onApply]);

  const shouldShowSearch = allOptions.length > 6;

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/45 justify-end">
        <Pressable className="flex-1" onPress={onClose} />

        <View className="max-h-[88%] rounded-t-[32px] border border-border bg-surface px-4 pb-6 pt-4">
          <View className="items-center pb-3">
            <View className="h-1.5 w-14 rounded-full bg-border" />
          </View>

          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <View className="rounded-full bg-accent-soft p-2">
                  <SlidersHorizontal size={16} color={accent} />
                </View>
                <Text className="text-xl font-bold text-secondary">{title}</Text>
              </View>
              <Text className="mt-2 text-sm leading-5 text-tertiary">{subtitle}</Text>
            </View>

            <Pressable
              onPress={onClose}
              className="rounded-full border border-border bg-background p-3"
              hitSlop={8}
            >
              <X size={18} color={tertiary} />
            </Pressable>
          </View>

          {activeCriteria.length > 0 ? (
            <View className="mt-4 rounded-2xl border border-border bg-background px-3 py-3">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
                  Picked fields
                </Text>
                <Text className="text-xs text-tertiary">Tap x to remove</Text>
              </View>

              <View className="flex-row flex-wrap">
                {activeCriteria.map((criterion) => (
                  <Chip
                    key={`${criterion.type}-${criterion.value}`}
                    label={getSeriesCriterionSummary(criterion, filterOptions)}
                    onDismiss={() => removeCriterion(criterion)}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View className="mt-4 rounded-2xl border border-dashed border-border bg-background px-4 py-4">
              <Text className="text-sm text-tertiary">{emptyStateText}</Text>
            </View>
          )}

          <ScrollView
            className="mt-4"
            showsVerticalScrollIndicator={false}
            contentContainerClassName="pb-4"
          >
            <Text className="text-xs font-semibold uppercase tracking-wide text-tertiary">
              Browse Fields
            </Text>

            <View className="mt-3 flex-row flex-wrap gap-2">
              {visibleSections.map((section) => {
                const count = filters.criteria.filter((criterion) => criterion.type === section.type).length;
                const selected = activeSection?.type === section.type;

                return (
                  <Pressable
                    key={section.type}
                    onPress={() => {
                      setActiveType(section.type);
                      setOptionSearch('');
                      if (!filterOptions && onLoadOptions) onLoadOptions();
                    }}
                    className={`min-w-[47%] flex-1 rounded-2xl border px-4 py-3 ${
                      selected ? 'border-secondary bg-secondary' : 'border-border bg-background'
                    }`}
                  >
                    <Text className={`text-sm font-semibold ${selected ? 'text-primary' : 'text-secondary'}`}>
                      {section.title}
                    </Text>
                    <Text
                      className={`mt-1 text-xs leading-5 ${selected ? 'text-primary' : 'text-tertiary'}`}
                      numberOfLines={2}
                    >
                      {section.description}
                    </Text>
                    {count > 0 ? (
                      <View
                        className={`mt-3 self-start rounded-full px-2.5 py-1 ${
                          selected ? 'bg-accent-soft-strong' : 'bg-accent-soft'
                        }`}
                      >
                        <Text className={`text-[11px] font-semibold ${selected ? 'text-secondary' : 'text-accent'}`}>
                          {count} selected
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {activeSection ? (
              <View className="mt-5 rounded-[28px] border border-border bg-background px-4 py-4">
                <Text className="text-lg font-bold text-secondary">{activeSection.title}</Text>
                <Text className="mt-1 text-sm leading-5 text-tertiary">{activeSection.description}</Text>

                {notesByType?.[activeSection.type] ? (
                  <View className="mt-3 rounded-2xl border border-accent-soft-strong bg-accent-soft px-3 py-3">
                    <Text className="text-xs leading-5 text-accent-dark">{notesByType[activeSection.type]}</Text>
                  </View>
                ) : null}

                {shouldShowSearch ? (
                  <View className="mt-4">
                    <TextInput
                      value={optionSearch}
                      onChangeText={setOptionSearch}
                      placeholder={`Search ${activeSection.title.toLowerCase()}...`}
                      placeholderTextColorClassName="accent-muted"
                      className="rounded-2xl border border-accent-soft-strong bg-surface px-4 py-3 text-sm text-secondary"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                ) : null}

                <View className="mt-4 gap-2">
                  {loading && allOptions.length === 0 ? (
                    <View className="items-center py-6">
                      <ActivityIndicator size="small" color={accent} />
                      <Text className="mt-3 text-sm text-tertiary">Loading filter values...</Text>
                    </View>
                  ) : filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => {
                      const selected = isSelected(activeSection.type, option.value);

                      return (
                        <Pressable
                          key={option.value}
                          onPress={() => toggleCriterion(activeSection.type, option.value)}
                          className={`rounded-2xl border px-4 py-3 ${
                            selected ? 'border-accent-soft-strong bg-accent-soft' : 'border-border bg-surface'
                          }`}
                        >
                          <View className="flex-row items-center justify-between gap-3">
                            <Text className="flex-1 text-sm font-medium text-secondary">{option.label}</Text>
                            <View
                              className={`h-5 w-5 rounded-full border items-center justify-center ${
                                selected ? 'border-accent bg-accent' : 'border-border bg-background'
                              }`}
                            >
                              {selected ? <View className="h-2 w-2 rounded-full bg-accent-contrast" /> : null}
                            </View>
                          </View>
                        </Pressable>
                      );
                    })
                  ) : (
                    <View className="rounded-2xl border border-dashed border-border bg-surface px-4 py-5">
                      <Text className="text-sm leading-5 text-tertiary">
                        {optionSearch
                          ? `No ${activeSection.title.toLowerCase()} values match "${optionSearch}".`
                          : `No ${activeSection.title.toLowerCase()} values are available right now.`}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View className="flex-row gap-3 border-t border-border pt-4">
            <Pressable
              onPress={clearAll}
              className="flex-1 items-center justify-center rounded-2xl border border-border bg-background px-4 py-4"
            >
              <Text className="text-sm font-semibold text-secondary">Clear</Text>
            </Pressable>

            <Pressable
              onPress={onClose}
              className="flex-1 items-center justify-center rounded-2xl bg-secondary px-4 py-4"
            >
              <Text className="text-sm font-semibold text-primary">Done</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

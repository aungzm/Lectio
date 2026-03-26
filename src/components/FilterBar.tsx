import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { ChevronDown, ChevronUp, X } from 'lucide-react-native';
import { Chip } from './Chip';
import type { FilterType, FilterCriterion, SearchFilters, FilterOptions } from '@/providers';

interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  filterOptions: FilterOptions | null;
  availableTypes: FilterType[];
  lockedTypes?: FilterType[];
  onLoadOptions?: () => void;
  loading?: boolean;
}

const FILTER_LABELS: Record<FilterType, string> = {
  readStatus: 'Read Status',
  genre: 'Genre',
  tag: 'Tag',
  publisher: 'Publisher',
  language: 'Language',
  ageRating: 'Age Rating',
  seriesStatus: 'Status',
  libraryId: 'Library',
  complete: 'Complete',
  oneShot: 'One-Shot',
};

const READ_STATUS_VALUES = ['UNREAD', 'IN_PROGRESS', 'READ'];
const SERIES_STATUS_VALUES = ['ONGOING', 'ENDED', 'HIATUS', 'ABANDONED'];
const BOOLEAN_VALUES = ['true', 'false'];

function getOptionsForType(type: FilterType, filterOptions: FilterOptions | null): { value: string; label: string }[] {
  if (!filterOptions) return [];
  switch (type) {
    case 'readStatus':
      return READ_STATUS_VALUES.map((v) => ({ value: v, label: v.replace('_', ' ') }));
    case 'genre':
      return filterOptions.genres.map((v) => ({ value: v, label: v }));
    case 'tag':
      return filterOptions.tags.map((v) => ({ value: v, label: v }));
    case 'publisher':
      return filterOptions.publishers.map((v) => ({ value: v, label: v }));
    case 'language':
      return filterOptions.languages.map((v) => ({ value: v, label: v }));
    case 'ageRating':
      return filterOptions.ageRatings.map((v) => ({ value: v, label: v }));
    case 'seriesStatus':
      return SERIES_STATUS_VALUES.map((v) => ({ value: v, label: v }));
    case 'libraryId':
      return filterOptions.libraries.map((l) => ({ value: l.id, label: l.name }));
    case 'complete':
      return BOOLEAN_VALUES.map((v) => ({ value: v, label: v === 'true' ? 'Yes' : 'No' }));
    case 'oneShot':
      return BOOLEAN_VALUES.map((v) => ({ value: v, label: v === 'true' ? 'Yes' : 'No' }));
    default:
      return [];
  }
}

export function FilterBar({
  filters,
  onFiltersChange,
  filterOptions,
  availableTypes,
  lockedTypes = [],
  onLoadOptions,
  loading,
}: FilterBarProps) {
  const [expandedType, setExpandedType] = useState<FilterType | null>(null);

  const activeCriteria = filters.criteria.filter((c) => !lockedTypes.includes(c.type));
  const hasActiveFilters = activeCriteria.length > 0;

  const toggleExpand = useCallback((type: FilterType) => {
    setExpandedType((prev) => {
      const next = prev === type ? null : type;
      if (next && !filterOptions && onLoadOptions) onLoadOptions();
      return next;
    });
  }, [filterOptions, onLoadOptions]);

  const isSelected = useCallback(
    (type: FilterType, value: string) =>
      filters.criteria.some((c) => c.type === type && c.value === value),
    [filters.criteria],
  );

  const toggleCriterion = useCallback(
    (type: FilterType, value: string) => {
      const exists = filters.criteria.some((c) => c.type === type && c.value === value);
      const newCriteria = exists
        ? filters.criteria.filter((c) => !(c.type === type && c.value === value))
        : [...filters.criteria, { type, value }];
      onFiltersChange({ ...filters, criteria: newCriteria });
    },
    [filters, onFiltersChange],
  );

  const removeCriterion = useCallback(
    (type: FilterType, value: string) => {
      onFiltersChange({
        ...filters,
        criteria: filters.criteria.filter((c) => !(c.type === type && c.value === value)),
      });
    },
    [filters, onFiltersChange],
  );

  const clearAll = useCallback(() => {
    onFiltersChange({
      ...filters,
      criteria: filters.criteria.filter((c) => lockedTypes.includes(c.type)),
    });
  }, [filters, lockedTypes, onFiltersChange]);

  const getLabelForValue = (type: FilterType, value: string): string => {
    if (type === 'libraryId' && filterOptions) {
      return filterOptions.libraries.find((l) => l.id === value)?.name ?? value;
    }
    if (type === 'complete' || type === 'oneShot') {
      return value === 'true' ? 'Yes' : 'No';
    }
    return value.replace('_', ' ');
  };

  const visibleTypes = availableTypes.filter((t) => !lockedTypes.includes(t));

  return (
    <View>
      {/* Category buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 8 }}
      >
        {visibleTypes.map((type) => {
          const isExpanded = expandedType === type;
          const count = filters.criteria.filter((c) => c.type === type).length;
          const Icon = isExpanded ? ChevronUp : ChevronDown;

          return (
            <Pressable
              key={type}
              onPress={() => toggleExpand(type)}
              className={`flex-row items-center rounded-full px-3 py-1.5 mr-2 border ${
                isExpanded ? 'bg-secondary border-secondary' : 'bg-surface border-border'
              }`}
            >
              <Text className={`text-xs font-medium ${isExpanded ? 'text-primary' : 'text-secondary'}`}>
                {FILTER_LABELS[type]}
                {count > 0 && ` (${count})`}
              </Text>
              <Icon size={14} color={isExpanded ? '#ffffff' : '#6b7280'} className="ml-1" />
            </Pressable>
          );
        })}

        {hasActiveFilters && (
          <Pressable
            onPress={clearAll}
            className="flex-row items-center rounded-full px-3 py-1.5 border border-danger bg-surface"
          >
            <X size={12} color="#ef4444" />
            <Text className="text-xs font-medium text-red-500 ml-1">Clear</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Expanded filter values */}
      {expandedType && (
        <View className="px-3 pb-2">
          {loading ? (
            <ActivityIndicator size="small" className="py-2" />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 4 }}
            >
              {getOptionsForType(expandedType, filterOptions).map((opt) => (
                <Chip
                  key={opt.value}
                  label={opt.label}
                  selected={isSelected(expandedType, opt.value)}
                  onPress={() => toggleCriterion(expandedType, opt.value)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        >
          {activeCriteria.map((c) => (
            <Chip
              key={`${c.type}-${c.value}`}
              label={`${FILTER_LABELS[c.type]}: ${getLabelForValue(c.type, c.value)}`}
              selected
              onDismiss={() => removeCriterion(c.type, c.value)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

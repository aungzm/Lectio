import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Chip } from '@/components/Chip';

interface CollapsibleChipSectionProps {
  label: string;
  items: string[];
  collapsedCount?: number;
}

export function CollapsibleChipSection({
  label,
  items,
  collapsedCount = 8,
}: CollapsibleChipSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, collapsedCount);
  const hasHiddenItems = items.length > collapsedCount;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-tertiary">{label}</Text>
      <View className="flex-row flex-wrap">
        {visibleItems.map((item) => <Chip key={item} label={item} />)}
      </View>
      {hasHiddenItems ? (
        <Pressable onPress={() => setExpanded((value) => !value)} className="mt-1">
          <Text className="text-sm font-medium text-accent">
            {expanded ? 'Show less' : `Show ${items.length - collapsedCount} more`}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

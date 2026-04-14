import React from 'react';
import { View, Text } from 'react-native';
import { Chip } from '@/components/Chip';
import type { PersonInfo } from '@/providers';

interface PeopleChipsProps {
  label: string;
  people: PersonInfo[];
}

export function PeopleChips({ label, people }: PeopleChipsProps) {
  if (people.length === 0) return null;

  return (
    <View className="mb-5">
      <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-tertiary">{label}</Text>
      <View className="flex-row flex-wrap">
        {people.map((person) => <Chip key={person.name} label={person.name} />)}
      </View>
    </View>
  );
}

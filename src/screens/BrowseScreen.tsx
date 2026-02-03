import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import type { BrowseHubScreenProps } from '@/navigation/types';

interface BrowseSectionProps {
  title: string;
  subtitle: string;
  onPress: () => void;
  supported: boolean;
}

function BrowseSection({ title, subtitle, onPress, supported }: BrowseSectionProps) {
  if (!supported) return null;
  return (
    <TouchableOpacity
      className="bg-white mx-4 mb-3 rounded-xl px-5 py-4 flex-row items-center justify-between shadow-sm border border-gray-100"
      onPress={onPress}
    >
      <View>
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        <Text className="text-sm text-gray-500 mt-0.5">{subtitle}</Text>
      </View>
      <Text className="text-gray-400 text-lg">›</Text>
    </TouchableOpacity>
  );
}

export default function BrowseScreen({ navigation }: BrowseHubScreenProps) {
  const serverConfig = useAuthStore((s) => s.serverConfig);
  const providerType = serverConfig?.providerType;

  // Both Kavita and Komga support all browse features
  const supportsAuthors = !!providerType;
  const supportsCollections = !!providerType;
  const supportsReadLists = !!providerType;

  return (
    <ScrollView className="flex-1 bg-gray-50" contentContainerClassName="py-6">
      <Text className="text-xs font-semibold text-gray-400 uppercase px-4 mb-3">Browse by</Text>

      <BrowseSection
        title="Authors"
        subtitle="Browse series by author"
        onPress={() => navigation.navigate('Authors')}
        supported={supportsAuthors}
      />
      <BrowseSection
        title="Collections"
        subtitle="Server-curated collections"
        onPress={() => navigation.navigate('Collections')}
        supported={supportsCollections}
      />
      <BrowseSection
        title="Reading Lists"
        subtitle="Ordered reading sequences"
        onPress={() => navigation.navigate('ReadLists')}
        supported={supportsReadLists}
      />
    </ScrollView>
  );
}

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { DetailedMetadata, PersonInfo } from '@/providers';

const AGE_RATING_LABELS: Record<number, string> = {
  0: 'Unknown',
  1: 'Everyone',
  2: 'G',
  3: 'Early Childhood',
  4: 'Everyone 10+',
  5: 'PG',
  6: 'Kids to Adults',
  7: 'Teen',
  8: 'MA 15+',
  9: 'Mature 17+',
  10: 'M',
  11: 'R 18+',
  12: 'Adults Only 18+',
  13: 'X 18+',
  14: 'Not Applicable',
};

function PeopleRow({ label, people }: { label: string; people: PersonInfo[] }) {
  if (people.length === 0) return null;
  return (
    <View className="mb-3">
      <Text className="text-xs font-semibold text-gray-500 uppercase mb-1">{label}</Text>
      <Text className="text-sm text-gray-800">{people.map((p) => p.name).join(', ')}</Text>
    </View>
  );
}

function TagChip({ label }: { label: string }) {
  return (
    <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
      <Text className="text-xs text-gray-700">{label}</Text>
    </View>
  );
}

export default function BookDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chapterId, seriesId, title } = route.params as {
    chapterId: string;
    seriesId: string;
    title: string;
  };
  const { provider } = useAuthStore();

  const [metadata, setMetadata] = useState<DetailedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!provider?.getDetailedMetadata) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    provider.getDetailedMetadata(seriesId).then(
      (data) => { if (!cancelled) { setMetadata(data); setLoading(false); } },
      (err) => { if (!cancelled) { setError(err?.message ?? 'Failed to load metadata'); setLoading(false); } },
    );
    return () => { cancelled = true; };
  }, [seriesId, provider]);

  function getCoverUri(): string | null {
    if (!provider) return null;
    return provider.getChapterCoverUrl?.(chapterId)
      ?? provider.getCoverUrl(seriesId);
  }

  function handleReadNow() {
    if (!provider) return;
    const epubUrl = provider.getEpubUrl(chapterId);
    navigation.navigate('Reader', { chapterId, title, epubUrl });
  }

  function handleDownload() {
    if (!provider?.getDownloadUrl) {
      Alert.alert('Download', 'Download is not supported for this provider.');
      return;
    }
    const url = provider.getDownloadUrl(chapterId);
    Linking.openURL(url).catch(() =>
      Alert.alert('Download', 'Could not open the download link.'),
    );
  }

  if (loading) {
    return <LoadingScreen />;
  }

  const ageLabel = metadata ? AGE_RATING_LABELS[metadata.ageRating] ?? null : null;

  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-10">
      {/* Hero section */}
      <View className="flex-row px-4 py-5 bg-gray-50 border-b border-gray-200">
        <View className="w-32 h-48 bg-gray-200 rounded-xl overflow-hidden shadow mr-4">
          <CoverImage uri={getCoverUri()} className="w-full h-full" resizeMode="cover" />
        </View>
        <View className="flex-1 justify-center">
          <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={3}>
            {title}
          </Text>
          {metadata?.writers && metadata.writers.length > 0 && (
            <Text className="text-sm text-gray-600 mb-1">
              {metadata.writers.map((w) => w.name).join(', ')}
            </Text>
          )}
          {metadata?.releaseYear && (
            <Text className="text-xs text-gray-400">{metadata.releaseYear}</Text>
          )}
          {metadata?.language && (
            <Text className="text-xs text-gray-400 mt-0.5">
              Language: {metadata.language.toUpperCase()}
            </Text>
          )}
        </View>
      </View>

      {/* Action buttons */}
      <View className="flex-row px-4 py-4 gap-3">
        <TouchableOpacity
          className="flex-1 bg-blue-600 rounded-xl py-3 items-center"
          onPress={handleReadNow}
        >
          <Text className="text-white font-semibold text-base">Read Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
          onPress={handleDownload}
        >
          <Text className="text-gray-800 font-semibold text-base">Download</Text>
        </TouchableOpacity>
      </View>

      {error && (
        <Text className="text-red-500 text-sm px-4 mb-2">{error}</Text>
      )}

      {metadata && (
        <View className="px-4">
          {/* Synopsis */}
          {metadata.summary && metadata.summary.length > 0 && (
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">Synopsis</Text>
              <Text className="text-sm text-gray-800 leading-5">{metadata.summary}</Text>
            </View>
          )}

          {/* Genres */}
          {metadata.genres.length > 0 && (
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Genres</Text>
              <View className="flex-row flex-wrap">
                {metadata.genres.map((g) => <TagChip key={g} label={g} />)}
              </View>
            </View>
          )}

          {/* Tags */}
          {metadata.tags.length > 0 && (
            <View className="mb-5">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</Text>
              <View className="flex-row flex-wrap">
                {metadata.tags.map((t) => <TagChip key={t} label={t} />)}
              </View>
            </View>
          )}

          {/* People */}
          <PeopleRow label="Author(s)" people={metadata.writers} />
          <PeopleRow label="Penciller(s)" people={metadata.pencillers} />
          <PeopleRow label="Inker(s)" people={metadata.inkers} />
          <PeopleRow label="Colorist(s)" people={metadata.colorists} />
          <PeopleRow label="Letterer(s)" people={metadata.letterers} />
          <PeopleRow label="Cover Artist(s)" people={metadata.coverArtists} />
          <PeopleRow label="Editor(s)" people={metadata.editors} />
          <PeopleRow label="Publisher(s)" people={metadata.publishers} />
          <PeopleRow label="Translator(s)" people={metadata.translators} />
          <PeopleRow label="Character(s)" people={metadata.characters} />

          {/* Age rating */}
          {ageLabel && ageLabel !== 'Unknown' && (
            <View className="mb-3">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-1">Age Rating</Text>
              <Text className="text-sm text-gray-800">{ageLabel}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

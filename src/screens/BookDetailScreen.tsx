import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Linking,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { Chip } from '@/components/Chip';
import { MetadataSection } from '@/components/MetadataSection';
import { ActionButton } from '@/components/ActionButton';
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
    <View className="mb-4">
      <Text className="text-xs font-semibold text-tertiary uppercase tracking-wide mb-1">{label}</Text>
      <Text className="text-sm text-secondary">{people.map((p) => p.name).join(', ')}</Text>
    </View>
  );
}

const SYNOPSIS_BASE_STYLES = {
  body: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 22,
  },
  a: {
    color: '#0ea5e9',
  },
};

export default function BookDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { chapterId, seriesId, title } = route.params as {
    chapterId: string;
    seriesId: string;
    title: string;
  };
  const { provider } = useAuthStore();
  const { width } = useWindowDimensions();

  const [metadata, setMetadata] = useState<DetailedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

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

  const synopsisHtml = useMemo(() => {
    if (!metadata?.summary) return null;
    const text = metadata.summary.trim();
    if (!text) return null;
    if (/<[a-z][\s\S]*>/i.test(text)) return { html: text };
    return { html: `<p>${text}</p>` };
  }, [metadata?.summary]);

  const synopsisPlain = useMemo(() => {
    if (!metadata?.summary) return '';
    return metadata.summary.replace(/<[^>]*>/g, '').trim();
  }, [metadata?.summary]);

  const SYNOPSIS_TRUNCATE_LENGTH = 150;
  const synopsisNeedsTruncation = synopsisPlain.length > SYNOPSIS_TRUNCATE_LENGTH;

  if (loading) {
    return <LoadingScreen />;
  }

  const ageLabel = metadata ? AGE_RATING_LABELS[metadata.ageRating] ?? null : null;
  const contentWidth = width - 32; // px-4 on each side

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-12">
      {/* Hero */}
      <View className="items-center pt-2 pb-6 px-4">
        <View className="w-40 h-56 bg-border rounded-2xl overflow-hidden shadow-lg">
          <CoverImage uri={getCoverUri()} className="w-full h-full" resizeMode="cover" />
        </View>
        <Text className="text-xl font-bold text-secondary mt-4 text-center px-4" numberOfLines={3}>
          {title}
        </Text>
        {metadata?.writers && metadata.writers.length > 0 && (
          <Text className="text-sm text-tertiary mt-1">
            {metadata.writers.map((w) => w.name).join(', ')}
          </Text>
        )}
        <View className="flex-row items-center gap-3 mt-2">
          {metadata?.releaseYear && (
            <Text className="text-xs text-muted">{metadata.releaseYear}</Text>
          )}
          {metadata?.language && (
            <Text className="text-xs text-muted">{metadata.language.toUpperCase()}</Text>
          )}
          {ageLabel && ageLabel !== 'Unknown' && (
            <View className="bg-border rounded px-1.5 py-0.5">
              <Text className="text-xs text-tertiary font-medium">{ageLabel}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row px-4 gap-3 mb-6">
        <ActionButton label="Read Now" onPress={handleReadNow} />
        <ActionButton label="Download" onPress={handleDownload} variant="secondary" />
      </View>

      {error && (
        <Text className="text-danger text-sm px-4 mb-4">{error}</Text>
      )}

      {metadata && (
        <View className="px-4">
          {/* Synopsis */}
          {synopsisHtml && (
            <MetadataSection label="Synopsis">
              {synopsisExpanded ? (
                <>
                  <RenderHtml
                    contentWidth={contentWidth}
                    source={synopsisHtml}
                    tagsStyles={SYNOPSIS_BASE_STYLES}
                  />
                  <Pressable onPress={() => setSynopsisExpanded(false)} className="mt-1">
                    <Text className="text-accent text-sm font-medium">Show less</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text className="text-sm text-secondary" numberOfLines={3}>
                    {synopsisPlain}
                  </Text>
                  {synopsisNeedsTruncation && (
                    <Pressable onPress={() => setSynopsisExpanded(true)} className="mt-1">
                      <Text className="text-accent text-sm font-medium">Show more</Text>
                    </Pressable>
                  )}
                </>
              )}
            </MetadataSection>
          )}

          {/* Genres */}
          {metadata.genres.length > 0 && (
            <MetadataSection label="Genres">
              <View className="flex-row flex-wrap">
                {metadata.genres.map((g) => <Chip key={g} label={g} />)}
              </View>
            </MetadataSection>
          )}

          {/* Tags */}
          {metadata.tags.length > 0 && (
            <MetadataSection label="Tags">
              <View className="flex-row flex-wrap">
                {metadata.tags.map((t) => <Chip key={t} label={t} />)}
              </View>
            </MetadataSection>
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
        </View>
      )}
    </ScrollView>
  );
}

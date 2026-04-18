import React, { useEffect, useMemo, useState } from 'react';
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
import {
  BookOpen,
  CalendarDays,
  Download,
  Languages,
  Shield,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SectionCard } from '@/components/SectionCard';
import { InfoPill } from '@/components/InfoPill';
import { KeyFact } from '@/components/KeyFact';
import { PeopleChips } from '@/components/PeopleChips';
import { CollapsibleChipSection } from '@/components/CollapsibleChipSection';
import type { DetailedMetadata } from '@/providers';

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

const SYNOPSIS_BASE_STYLES = {
  body: {
    color: '#000000',
    fontSize: 14,
    lineHeight: 24,
  },
  p: {
    marginTop: 0,
    marginBottom: 12,
  },
  a: {
    color: '#0ea5e9',
  },
};

function ActionTile({
  label,
  icon,
  onPress,
  primary = false,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center rounded-2xl px-4 py-4 ${
        primary ? 'bg-secondary' : 'bg-surface border border-border'
      }`}
    >
      <View className="mr-2">{icon}</View>
      <Text className={`text-sm font-semibold ${primary ? 'text-primary' : 'text-secondary'}`}>
        {label}
      </Text>
    </Pressable>
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
  const { width } = useWindowDimensions();

  const [metadata, setMetadata] = useState<DetailedMetadata | null>(null);
  const [book, setBook] = useState<{ pagesTotal: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  useEffect(() => {
    if (!provider?.getDetailedMetadata) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    Promise.all([
      provider.getDetailedMetadata(seriesId),
      provider.getBookDetail?.(chapterId) ?? Promise.resolve(null),
    ]).then(
      ([metadataResult, bookResult]) => {
        if (!cancelled) {
          setMetadata(metadataResult);
          setBook(bookResult ? { pagesTotal: bookResult.pagesTotal } : null);
          setLoading(false);
        }
      },
      (err) => {
        if (!cancelled) {
          setError(err?.message ?? 'Failed to load metadata');
          setLoading(false);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [seriesId, chapterId, provider]);

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

  function getCoverUri(): string | null {
    if (!provider) return null;
    return provider.getChapterCoverUrl?.(chapterId) ?? provider.getCoverUrl(seriesId);
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
    Linking.openURL(url).catch(() => {
      Alert.alert('Download', 'Could not open the download link.');
    });
  }

  if (loading) {
    return <LoadingScreen />;
  }

  const ageLabel = metadata ? AGE_RATING_LABELS[metadata.ageRating] ?? null : null;
  const contentWidth = width - 64;
  const synopsisNeedsTruncation = synopsisPlain.length > 180;
  const heroFacts = [
    book?.pagesTotal ? { label: 'Pages', value: `${book.pagesTotal}` } : null,
    metadata?.releaseYear ? { label: 'Year', value: `${metadata.releaseYear}` } : null,
    metadata?.language ? { label: 'Language', value: metadata.language.toUpperCase() } : null,
    ageLabel && ageLabel !== 'Unknown' ? { label: 'Rating', value: ageLabel } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));
  const creatorNames = metadata?.writers?.map((writer) => writer.name).join(', ');

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <View className="px-4 pt-4">
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
          <View className="absolute -top-12 -right-10 h-36 w-36 rounded-full bg-primary-100" />
          <View className="absolute top-24 -left-12 h-28 w-28 rounded-full bg-primary-50" />

          <View className="items-center">
            <View className="h-64 w-44 overflow-hidden rounded-[28px] border border-border bg-border shadow-lg">
              <CoverImage uri={getCoverUri()} className="h-full w-full" resizeMode="cover" />
            </View>

            <View className="mt-5 items-center">
              <Text className="text-center text-3xl font-bold text-secondary" numberOfLines={3}>
                {title}
              </Text>
              {creatorNames ? (
                <Text className="mt-2 text-center text-sm text-tertiary" numberOfLines={2}>
                  by {creatorNames}
                </Text>
              ) : null}
            </View>

            {heroFacts.length > 0 && (
              <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2">
                {metadata?.releaseYear ? (
                  <InfoPill
                    icon={<CalendarDays size={14} color="#6b7280" />}
                    label={`${metadata.releaseYear}`}
                  />
                ) : null}
                {book?.pagesTotal ? (
                  <InfoPill
                    icon={<BookOpen size={14} color="#6b7280" />}
                    label={`${book.pagesTotal} pages`}
                  />
                ) : null}
                {metadata?.language ? (
                  <InfoPill
                    icon={<Languages size={14} color="#6b7280" />}
                    label={metadata.language.toUpperCase()}
                  />
                ) : null}
                {ageLabel && ageLabel !== 'Unknown' ? (
                  <InfoPill icon={<Shield size={14} color="#6b7280" />} label={ageLabel} />
                ) : null}
              </View>
            )}
          </View>

          <View className="mt-6 flex-row gap-3">
            <ActionTile
              label="Read Now"
              primary
              onPress={handleReadNow}
              icon={<BookOpen size={18} color="#ffffff" />}
            />
            <ActionTile
              label="Download"
              onPress={handleDownload}
              icon={<Download size={18} color="#000000" />}
            />
          </View>

          {heroFacts.length > 0 && (
            <View className="mt-5 flex-row flex-wrap gap-3">
              {heroFacts.map((fact) => (
                <KeyFact key={fact.label} label={fact.label} value={fact.value} />
              ))}
            </View>
          )}
        </View>
      </View>

      {error ? (
        <View className="px-4 pt-4">
          <View className="rounded-2xl border border-danger bg-surface px-4 py-3">
            <Text className="text-sm text-danger">{error}</Text>
          </View>
        </View>
      ) : null}

      {metadata ? (
        <View className="px-4 pt-4">
          {synopsisHtml ? (
            <SectionCard title="Synopsis">
              {synopsisExpanded ? (
                <>
                  <RenderHtml
                    contentWidth={contentWidth}
                    source={synopsisHtml}
                    tagsStyles={SYNOPSIS_BASE_STYLES}
                  />
                  {synopsisNeedsTruncation ? (
                    <Pressable onPress={() => setSynopsisExpanded(false)}>
                      <Text className="text-accent text-sm font-medium">Show less</Text>
                    </Pressable>
                  ) : null}
                </>
              ) : (
                <>
                  <Text className="text-sm leading-6 text-secondary" numberOfLines={5}>
                    {synopsisPlain}
                  </Text>
                  {synopsisNeedsTruncation ? (
                    <Pressable onPress={() => setSynopsisExpanded(true)} className="mt-2">
                      <Text className="text-accent text-sm font-medium">Read full synopsis</Text>
                    </Pressable>
                  ) : null}
                </>
              )}
            </SectionCard>
          ) : null}

          {(metadata.genres.length > 0 || metadata.tags.length > 0) && (
            <SectionCard>
              <CollapsibleChipSection label="Genres" items={metadata.genres} />
              <CollapsibleChipSection label="Tags" items={metadata.tags} />
            </SectionCard>
          )}

          <SectionCard>
            <PeopleChips label="Author(s)" people={metadata.writers} />
            <PeopleChips label="Penciller(s)" people={metadata.pencillers} />
            <PeopleChips label="Inker(s)" people={metadata.inkers} />
            <PeopleChips label="Colorist(s)" people={metadata.colorists} />
            <PeopleChips label="Letterer(s)" people={metadata.letterers} />
            <PeopleChips label="Cover Artist(s)" people={metadata.coverArtists} />
            <PeopleChips label="Editor(s)" people={metadata.editors} />
            <PeopleChips label="Publisher(s)" people={metadata.publishers} />
            <PeopleChips label="Translator(s)" people={metadata.translators} />
            <PeopleChips label="Character(s)" people={metadata.characters} />
          </SectionCard>
        </View>
      ) : null}
    </ScrollView>
  );
}

import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import RenderHtml from 'react-native-render-html';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { MetadataSection } from '@/components/MetadataSection';
import { Chip } from '@/components/Chip';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import type { Volume, DetailedMetadata, PersonInfo } from '@/providers';

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

function PeopleChips({ label, people }: { label: string; people: PersonInfo[] }) {
  if (people.length === 0) return null;
  return (
    <MetadataSection label={label}>
      <View className="flex-row flex-wrap">
        {people.map((p) => <Chip key={p.name} label={p.name} />)}
      </View>
    </MetadataSection>
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

// A volume with a single chapter whose number is <= 0 represents a whole book (epub/pdf).
function isBookVolume(volume: Volume): boolean {
  return volume.chapters.length === 1 && Number(volume.chapters[0].number) <= 0;
}

function bookLabel(name: string | null | undefined, number: number): string {
  if (name && isNaN(Number(name))) return name;
  const n = Number(name);
  if (!isNaN(n) && n > 0) return `Book ${n}`;
  if (number > 0) return `Book ${number}`;
  return 'Book';
}

function volumeLabel(name: string | null | undefined, number: number): string {
  if (name) return name;
  if (number === 0) return 'Chapters';
  if (number < 0) return 'Specials';
  return `Volume ${number}`;
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

export default function SeriesDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { seriesId, title } = route.params as { seriesId: string; title: string };
  const { provider } = useAuthStore();
  const { volumes, loadingVolumes, fetchVolumes } = useLibraryStore();
  const { width } = useWindowDimensions();

  const [metadata, setMetadata] = useState<DetailedMetadata | null>(null);
  const [metaLoading, setMetaLoading] = useState(true);
  const [synopsisExpanded, setSynopsisExpanded] = useState(false);

  const bookVolumes = volumes[seriesId] ?? [];

  useProviderFetch((p) => fetchVolumes(p, seriesId), [seriesId]);

  useEffect(() => {
    if (!provider?.getDetailedMetadata) {
      setMetaLoading(false);
      return;
    }
    let cancelled = false;
    provider.getDetailedMetadata(seriesId).then(
      (data) => { if (!cancelled) { setMetadata(data); setMetaLoading(false); } },
      () => { if (!cancelled) { setMetaLoading(false); } },
    );
    return () => { cancelled = true; };
  }, [seriesId, provider]);

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

  function getSeriesCoverUri(): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(seriesId);
  }

  function getVolumeCoverUri(volumeId: string): string | null {
    if (!provider) return null;
    return provider.getVolumeCoverUrl?.(volumeId)
      ?? provider.getCoverUrl(seriesId);
  }

  function handleReadChapter(chapterId: string, chapterTitle: string) {
    if (!provider) return;
    navigation.navigate('BookDetail', { chapterId, seriesId, title: chapterTitle });
  }

  if (loadingVolumes && bookVolumes.length === 0 && metaLoading) {
    return <LoadingScreen />;
  }

  const singleBooks = bookVolumes.filter(isBookVolume);
  const multiChapterVolumes = bookVolumes.filter((v) => !isBookVolume(v));
  const ageLabel = metadata ? AGE_RATING_LABELS[metadata.ageRating] ?? null : null;
  const contentWidth = width - 32;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-12">
      {/* Hero */}
      <View className="items-center pt-2 pb-6 px-4">
        <View className="w-40 h-56 bg-border rounded-2xl overflow-hidden shadow-lg">
          <CoverImage uri={getSeriesCoverUri()} className="w-full h-full" resizeMode="cover" />
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

      {/* Synopsis */}
      {metadata && (
        <View className="px-4">
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
        </View>
      )}

      {/* Book grid (epub/pdf series — each volume is one book) */}
      {singleBooks.length > 0 && (
        <View className="px-4">
          <MetadataSection label="Books">
            {chunkArray(singleBooks, 3).map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row gap-2 mb-4">
                {row.map((volume) => {
                  const chapter = volume.chapters[0];
                  const label = chapter.title || bookLabel(volume.name, volume.number);
                  return (
                    <TouchableOpacity
                      key={volume.id}
                      className="flex-1 items-center"
                      onPress={() => handleReadChapter(chapter.id, label)}
                    >
                      <View className="w-full aspect-[2/3] bg-border rounded-xl overflow-hidden mb-1">
                        <CoverImage
                          uri={getVolumeCoverUri(volume.id)}
                          className="w-full h-full"
                          resizeMode="cover"
                        />
                      </View>
                      <Text className="text-xs text-secondary text-center font-medium" numberOfLines={1}>
                        {label}
                      </Text>
                      {chapter.pagesTotal > 0 && (
                        <Text className="text-xs text-muted text-center">
                          {chapter.pagesRead}/{chapter.pagesTotal}p
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
                {row.length < 3 &&
                  Array(3 - row.length)
                    .fill(null)
                    .map((_, i) => <View key={`empty-${i}`} className="flex-1" />)}
              </View>
            ))}
          </MetadataSection>
        </View>
      )}

      {/* Multi-chapter volumes (manga/comics) */}
      {multiChapterVolumes.length > 0 && (
        <View className="px-4">
          {multiChapterVolumes.map((volume) => (
            <MetadataSection key={volume.id} label={volumeLabel(volume.name, volume.number)}>
              {volume.chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  className="flex-row items-center justify-between py-3 border-b border-border"
                  onPress={() => handleReadChapter(chapter.id, chapter.title)}
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base text-secondary" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    {chapter.pagesTotal > 0 && (
                      <Text className="text-xs text-muted mt-0.5">
                        {chapter.pagesRead}/{chapter.pagesTotal} pages
                      </Text>
                    )}
                  </View>
                  <Text className="text-accent text-sm font-medium">Read</Text>
                </TouchableOpacity>
              ))}
            </MetadataSection>
          ))}
        </View>
      )}

      {bookVolumes.length === 0 && !loadingVolumes && (
        <Text className="text-center text-muted mt-10">No chapters found.</Text>
      )}
    </ScrollView>
  );
}

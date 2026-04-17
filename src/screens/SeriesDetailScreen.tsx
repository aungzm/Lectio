import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  useWindowDimensions,
} from 'react-native';
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

function CollapsibleChipSection({
  label,
  items,
  collapsedCount = 8,
}: {
  label: string;
  items: string[];
  collapsedCount?: number;
}) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) return null;

  const visibleItems = expanded ? items : items.slice(0, collapsedCount);
  const hasHiddenItems = items.length > collapsedCount;

  return (
    <MetadataSection label={label}>
      <View className="flex-row flex-wrap">
        {visibleItems.map((item) => <Chip key={item} label={item} />)}
      </View>
      {hasHiddenItems && (
        <Pressable onPress={() => setExpanded((value) => !value)} className="mt-1">
          <Text className="text-accent text-sm font-medium">
            {expanded ? 'Show less' : 'Show more'}
          </Text>
        </Pressable>
      )}
    </MetadataSection>
  );
}

function isBookVolume(volume: Volume): boolean {
  return volume.chapters.length === 1;
}

function volumeLabel(name: string | null | undefined, number: number): string {
  if (name) return name;
  if (number === 0) return 'Chapters';
  if (number < 0) return 'Specials';
  return `Volume ${number}`;
}

function formatSeriesStatus(status: string | null | undefined): string | null {
  if (!status) return null;
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
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
      (data) => {
        if (!cancelled) {
          setMetadata(data);
          setMetaLoading(false);
        }
      },
      () => {
        if (!cancelled) {
          setMetaLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [seriesId, provider]);

  const synopsisPlain = useMemo(() => {
    if (!metadata?.summary) return '';
    return metadata.summary.replace(/<[^>]*>/g, '').trim();
  }, [metadata?.summary]);

  function getSeriesCoverUri(): string | null {
    if (!provider) return null;
    return provider.getCoverUrl(seriesId);
  }

  function getBookCoverUri(bookId: string): string | null {
    if (!provider) return null;
    return provider.getBookCoverUrl?.(bookId)
      ?? provider.getVolumeCoverUrl?.(bookId)
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
  const statusLabel = formatSeriesStatus(metadata?.seriesStatus);
  const bookCountLabel = `${bookVolumes.length} ${bookVolumes.length === 1 ? 'Book' : 'Books'}`;
  const numCols = width >= 600 ? 4 : 3;
  const bookRows = chunkArray(singleBooks, numCols);
  const genres = metadata?.genres ?? [];
  const tags = metadata?.tags ?? [];

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-12">
      <View className="px-4 pt-4 pb-6">
        <View className="flex-row items-start gap-4 mb-4">
          <View className="w-28 aspect-[2/3] bg-border rounded-2xl overflow-hidden shadow-lg shrink-0">
            <CoverImage uri={getSeriesCoverUri()} className="w-full h-full" resizeMode="cover" />
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-secondary" numberOfLines={3}>
              {title}
            </Text>
            {(metadata?.releaseYear || statusLabel || metadata?.language) && (
              <View className="flex-row flex-wrap items-center gap-2 mt-1">
                {metadata?.releaseYear && (
                  <Text className="text-sm text-tertiary">{metadata.releaseYear}</Text>
                )}
                {statusLabel && <Chip label={statusLabel} />}
                {metadata?.language && <Chip label={metadata.language.toUpperCase()} />}
              </View>
            )}
            <Text className="text-sm text-tertiary mt-2">{bookCountLabel}</Text>
          </View>
        </View>

        {synopsisPlain.length > 0 && (
          <MetadataSection label="Synopsis">
            <Text
              className="text-sm text-secondary leading-6"
              numberOfLines={synopsisExpanded ? undefined : 6}
            >
              {synopsisPlain}
            </Text>
            {synopsisPlain.length > 150 && (
              <Pressable onPress={() => setSynopsisExpanded((value) => !value)} className="mt-2">
                <Text className="text-accent text-sm font-medium">
                  {synopsisExpanded ? 'Show less' : 'Show more'}
                </Text>
              </Pressable>
            )}
          </MetadataSection>
        )}

        <CollapsibleChipSection label="Tags" items={tags} />
        <CollapsibleChipSection label="Genres" items={genres} />
      </View>

      {metadata && (
        <View className="px-4">
          <PeopleChips label="Author" people={metadata.writers} />
          <PeopleChips label="Penciller" people={metadata.pencillers} />
          <PeopleChips label="Inker" people={metadata.inkers} />
          <PeopleChips label="Colorist" people={metadata.colorists} />
          <PeopleChips label="Letterer" people={metadata.letterers} />
          <PeopleChips label="Cover Artist" people={metadata.coverArtists} />
          <PeopleChips label="Editor" people={metadata.editors} />
          <PeopleChips label="Publisher" people={metadata.publishers} />
          <PeopleChips label="Translator" people={metadata.translators} />
          <PeopleChips label="Character" people={metadata.characters} />
        </View>
      )}

      {singleBooks.length > 0 && (
        <View className='px-4'>
          <MetadataSection label="Books">
            <View>
              {bookRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} className="flex-row mb-4">
                  {row.map((volume) => {
                    const chapter = volume.chapters[0];
                    return (
                      <TouchableOpacity
                        key={volume.id}
                        className="items-center px-1"
                        style={{ width: `${100 / numCols}%` }}
                        onPress={() => handleReadChapter(chapter.id, chapter.title || volume.name)}
                      >
                        <View className="w-full aspect-[2/3] bg-border rounded-lg overflow-hidden mb-1">
                          <CoverImage
                            uri={getBookCoverUri(volume.id)}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        </View>
                        <Text className="text-xs text-secondary text-center" numberOfLines={2}>
                          {chapter.title || volume.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {row.length < numCols &&
                    Array.from({ length: numCols - row.length }).map((_, index) => (
                      <View
                        key={`spacer-${rowIndex}-${index}`}
                        className="px-1"
                        style={{ width: `${100 / numCols}%` }}
                      />
                    ))}
                </View>
              ))}
            </View>
          </MetadataSection>
        </View>
      )}

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

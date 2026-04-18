import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import type { DimensionValue } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  BookOpen,
  CalendarDays,
  Languages,
  Library,
  Shield,
  Sparkles,
} from 'lucide-react-native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { CoverImage } from '@/components/CoverImage';
import { LoadingScreen } from '@/components/LoadingScreen';
import { SectionCard } from '@/components/SectionCard';
import { InfoPill } from '@/components/InfoPill';
import { KeyFact } from '@/components/KeyFact';
import { PeopleChips } from '@/components/PeopleChips';
import { CollapsibleChipSection } from '@/components/CollapsibleChipSection';
import { useProviderFetch } from '@/hooks/useProviderFetch';
import { useResponsiveGrid } from '@/hooks/useResponsiveGrid';
import type { Volume, DetailedMetadata } from '@/providers';

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

function BookGridCard({
  title,
  subtitle,
  coverUri,
  onPress,
}: {
  title: string;
  subtitle?: string | null;
  coverUri: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} className="px-1">
      <View className="overflow-hidden rounded-2xl border border-border bg-surface">
        <View className="aspect-[2/3] bg-background p-2">
          <View className="h-full w-full overflow-hidden rounded-xl bg-border">
            <CoverImage uri={coverUri} className="h-full w-full" resizeMode="contain" />
          </View>
        </View>
        <View className="min-h-[88px] justify-between px-3 py-3">
          <Text className="text-sm font-semibold leading-6 text-secondary" numberOfLines={2}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="mt-2 text-xs text-tertiary" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ChapterRow({
  title,
  pagesRead,
  pagesTotal,
  onPress,
}: {
  title: string;
  pagesRead: number;
  pagesTotal: number;
  onPress: () => void;
}) {
  const progressLabel =
    pagesTotal > 0 ? `${pagesRead}/${pagesTotal} pages` : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-3 rounded-2xl border border-border bg-background px-4 py-4"
    >
      <View className="flex-row items-center justify-between">
        <View className="mr-4 flex-1">
          <Text className="text-base font-semibold text-secondary" numberOfLines={1}>
            {title}
          </Text>
          {progressLabel ? (
            <Text className="mt-1 text-xs text-tertiary">{progressLabel}</Text>
          ) : null}
        </View>
        <View className="rounded-full bg-primary-50 px-3 py-2">
          <Text className="text-xs font-semibold text-accent">Read</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  const { numCols, itemWidth } = useResponsiveGrid();

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
  const multiChapterVolumes = bookVolumes.filter((volume) => !isBookVolume(volume));
  const ageLabel = metadata ? AGE_RATING_LABELS[metadata.ageRating] ?? null : null;
  const statusLabel = formatSeriesStatus(metadata?.seriesStatus);
  const bookCountLabel = `${bookVolumes.length} ${bookVolumes.length === 1 ? 'Book' : 'Books'}`;
  const cardWidth: DimensionValue = itemWidth;
  const bookRows = chunkArray(singleBooks, numCols);
  const heroFacts = [
    { label: 'Books', value: bookCountLabel },
    statusLabel ? { label: 'Status', value: statusLabel } : null,
    metadata?.releaseYear ? { label: 'Year', value: `${metadata.releaseYear}` } : null,
    metadata?.language ? { label: 'Language', value: metadata.language.toUpperCase() } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="pb-10">
      <View className="px-4 pt-4">
        <View className="relative overflow-hidden rounded-[32px] border border-border bg-surface px-5 pb-6 pt-5">
          <View className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-primary-100" />
          <View className="absolute -left-12 top-28 h-28 w-28 rounded-full bg-primary-50" />

          <View className="items-center">
            <View className="h-64 w-44 overflow-hidden rounded-[28px] border border-border bg-border shadow-lg">
              <CoverImage uri={getSeriesCoverUri()} className="h-full w-full" resizeMode="cover" />
            </View>

            <Text className="mt-5 text-center text-3xl font-bold text-secondary" numberOfLines={3}>
              {title}
            </Text>

            <View className="mt-4 flex-row flex-wrap items-center justify-center gap-2">
              <InfoPill
                icon={<Library size={14} color="#6b7280" />}
                label={bookCountLabel}
              />
              {metadata?.releaseYear ? (
                <InfoPill
                  icon={<CalendarDays size={14} color="#6b7280" />}
                  label={`${metadata.releaseYear}`}
                />
              ) : null}
              {metadata?.language ? (
                <InfoPill
                  icon={<Languages size={14} color="#6b7280" />}
                  label={metadata.language.toUpperCase()}
                />
              ) : null}
              {statusLabel ? (
                <InfoPill
                  icon={<Sparkles size={14} color="#6b7280" />}
                  label={statusLabel}
                />
              ) : null}
              {ageLabel && ageLabel !== 'Unknown' ? (
                <InfoPill icon={<Shield size={14} color="#6b7280" />} label={ageLabel} />
              ) : null}
            </View>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-3">
            {heroFacts.map((fact) => (
              <KeyFact key={`${fact.label}-${fact.value}`} label={fact.label} value={fact.value} />
            ))}
          </View>
        </View>
      </View>

      <View className="px-4 pt-4">
        {synopsisPlain.length > 0 ? (
          <SectionCard title="Synopsis">
            <Text
              className="text-sm leading-6 text-secondary"
              numberOfLines={synopsisExpanded ? undefined : 6}
            >
              {synopsisPlain}
            </Text>
            {synopsisPlain.length > 180 ? (
              <Pressable onPress={() => setSynopsisExpanded((value) => !value)} className="mt-2">
                <Text className="text-sm font-medium text-accent">
                  {synopsisExpanded ? 'Show less' : 'Read full synopsis'}
                </Text>
              </Pressable>
            ) : null}
          </SectionCard>
        ) : null}

        {(metadata?.genres.length || metadata?.tags.length) ? (
          <SectionCard>
            <CollapsibleChipSection label="Genres" items={metadata?.genres ?? []} />
            <CollapsibleChipSection label="Tags" items={metadata?.tags ?? []} />
          </SectionCard>
        ) : null}

        {metadata ? (
          <SectionCard>
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
          </SectionCard>
        ) : null}

        {singleBooks.length > 0 ? (
          <SectionCard title="Books">
            <View>
              {bookRows.map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} className="mb-3 flex-row">
                  {row.map((volume) => {
                    const chapter = volume.chapters[0];

                    return (
                      <View key={volume.id} style={{ width: cardWidth }}>
                        <BookGridCard
                          title={chapter.title || volume.name}
                          subtitle={null}
                          coverUri={getBookCoverUri(volume.id)}
                          onPress={() => handleReadChapter(chapter.id, chapter.title || volume.name)}
                        />
                      </View>
                    );
                  })}
                  {row.length < numCols
                    ? Array.from({ length: numCols - row.length }).map((_, index) => (
                        <View
                          key={`spacer-${rowIndex}-${index}`}
                          style={{ width: cardWidth }}
                        />
                      ))
                    : null}
                </View>
              ))}
            </View>
          </SectionCard>
        ) : null}

        {multiChapterVolumes.map((volume) => (
          <SectionCard key={volume.id} title={volumeLabel(volume.name, volume.number)}>
            {volume.chapters.map((chapter) => (
              <ChapterRow
                key={chapter.id}
                title={chapter.title}
                pagesRead={chapter.pagesRead}
                pagesTotal={chapter.pagesTotal}
                onPress={() => handleReadChapter(chapter.id, chapter.title)}
              />
            ))}
          </SectionCard>
        ))}

        {bookVolumes.length === 0 && !loadingVolumes ? (
          <View className="rounded-[28px] border border-border bg-surface px-5 py-8">
            <View className="items-center">
              <View className="rounded-full bg-primary-50 p-4">
                <BookOpen size={24} color="#0ea5e9" />
              </View>
              <Text className="mt-4 text-base font-semibold text-secondary">No books found</Text>
              <Text className="mt-1 text-center text-sm text-tertiary">
                This series does not have any readable entries yet.
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

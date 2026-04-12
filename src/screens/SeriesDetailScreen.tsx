import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import { useLibraryStore } from '@/store/libraryStore';
import { createProvider } from '@/store/authStore';
import { CoverImage } from '@/components/CoverImage';
import type { Volume } from '@/providers';

function isBookVolume(volume: Volume): boolean {
  return volume.chapters.length === 1 && Number(volume.chapters[0].number) <= 0;
}

function bookLabel(name: string | null | undefined, number: number): string {
  const parsed = name ? Number(name) : NaN;
  if (!isNaN(parsed) && parsed > 0) return `Book ${parsed}`;
  if (number > 0) return `Book ${number}`;
  return name || 'Book';
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

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center bg-white border border-gray-200 rounded-lg px-3 py-1.5 mr-2">
      <Text className="text-xs font-semibold text-gray-800">{value}</Text>
      <Text className="text-[10px] text-gray-400 mt-0.5">{label}</Text>
    </View>
  );
}

export default function SeriesDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { seriesId } = route.params as { seriesId: string; title: string };
  const { serverConfig, auth } = useAuthStore();
  const { volumes, isLoading, fetchVolumes, seriesDetails, fetchSeriesDetail } = useLibraryStore();
  const [summaryExpanded, setSummaryExpanded] = useState(false);

  const bookVolumes = volumes[seriesId] ?? [];
  const detail = seriesDetails[seriesId] ?? null;

useEffect(() => {
    if (serverConfig && auth) {
      fetchVolumes(serverConfig, auth.token, seriesId);
      fetchSeriesDetail(serverConfig, auth.token, seriesId);
    }
  }, [seriesId, serverConfig, auth]);

  const provider = serverConfig ? createProvider(serverConfig.providerType) : null;

  function getVolumeCoverUri(volumeId: string): string | null {
    if (!provider || !serverConfig || !auth) return null;
    return provider.getVolumeCoverUrl?.(serverConfig.serverUrl, volumeId, auth.apiKey)
      ?? provider.getCoverUrl(serverConfig.serverUrl, seriesId, auth.apiKey);
  }

  function handleReadChapter(chapterId: string, title: string) {
    if (!serverConfig || !auth || !provider) return;
    const epubUrl = provider.getEpubUrl(serverConfig.serverUrl, auth.token, chapterId);
    navigation.navigate('Reader', { chapterId, title, epubUrl });
  }

  if (isLoading && bookVolumes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const singleBooks = bookVolumes.filter(isBookVolume);
  const multiChapterVolumes = bookVolumes.filter((v) => !isBookVolume(v));
  const bookCount = singleBooks.length > 0
    ? singleBooks.length
    : multiChapterVolumes.reduce((n, v) => n + v.chapters.length, 0);

  const meta = detail?.metadata;
  const authors = meta?.authors ?? [];
  const publishers = meta?.publishers ?? [];
  const genres = meta?.genres ?? [];
  const summary = meta?.summary ?? null;
  const year = meta?.year ?? null;
  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="pb-10">

      {/* ── Info bar ───────────────────────────────────────────────── */}
      <View className="bg-gray-50 border-b border-gray-200 px-4 pt-4 pb-4">
        {/* Publisher + author */}
        <View className="mb-3">
          {publishers.length > 0 ? (
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {publishers[0]}
            </Text>
          ) : null}
          {authors.length > 0 && (
            <Text className="text-sm text-gray-500 mt-0.5">
              by {authors.join(', ')}
            </Text>
          )}
        </View>

        {/* Stat badges */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="flex-row"
        >
          {bookCount > 0 && (
            <StatBadge value={String(bookCount)} label={bookCount === 1 ? 'Book' : 'Books'} />
          )}
{year != null && year > 0 && (
            <StatBadge value={String(year)} label="Year" />
          )}
        </ScrollView>
      </View>

      {/* ── Overview ───────────────────────────────────────────────── */}
      {summary ? (
        <View className="px-4 pt-5 pb-4 border-b border-gray-100">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
            Overview
          </Text>
          <Pressable onPress={() => setSummaryExpanded((v) => !v)}>
            <Text
              className="text-sm text-gray-700 leading-[22px]"
              numberOfLines={summaryExpanded ? undefined : 4}
            >
              {summary}
            </Text>
            <Text className="text-xs text-gray-400 mt-1.5">
              {summaryExpanded ? 'Show less' : 'Show more'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {/* ── Genres ─────────────────────────────────────────────────── */}
      {genres.length > 0 && (
        <View className="px-4 pt-5 pb-4 border-b border-gray-100">
          <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Genres
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {genres.map((g) => (
              <View key={g} className="bg-gray-100 rounded-full px-3 py-1">
                <Text className="text-xs text-gray-600">{g}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* ── Books grid ─────────────────────────────────────────────── */}
      {singleBooks.length > 0 && (
        <View className="px-4 pt-5">
          <View className="flex-row items-baseline mb-4">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Books
            </Text>
            <Text className="text-xs text-gray-400 ml-2">{singleBooks.length}</Text>
          </View>
          {chunkArray(singleBooks, 3).map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row gap-3 mb-5">
              {row.map((volume) => {
                const chapter = volume.chapters[0];
                const label = bookLabel(volume.name, volume.number);
                return (
                  <TouchableOpacity
                    key={volume.id}
                    className="flex-1 items-center"
                    onPress={() => handleReadChapter(chapter.id, label)}
                  >
                    <View className="w-full aspect-[2/3] bg-gray-100 rounded-lg overflow-hidden mb-1.5">
                      <CoverImage
                        uri={getVolumeCoverUri(volume.id)}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <Text className="text-xs font-medium text-gray-800 text-center" numberOfLines={1}>
                      {label}
                    </Text>
                    {chapter.pagesTotal > 0 && (
                      <Text className="text-[10px] text-gray-400 text-center mt-0.5">
                        {chapter.pagesRead}/{chapter.pagesTotal} pages
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
        </View>
      )}

      {/* ── Multi-chapter volumes (manga / comics) ─────────────────── */}
      {multiChapterVolumes.length > 0 && (
        <View className="px-4 pt-5">
          <View className="flex-row items-baseline mb-4">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Volumes
            </Text>
            <Text className="text-xs text-gray-400 ml-2">{multiChapterVolumes.length}</Text>
          </View>
          {multiChapterVolumes.map((volume) => (
            <View key={volume.id} className="mb-6">
              <Text className="text-sm font-semibold text-gray-500 uppercase mb-2">
                {volumeLabel(volume.name, volume.number)}
              </Text>
              {volume.chapters.map((chapter) => (
                <TouchableOpacity
                  key={chapter.id}
                  className="flex-row items-center justify-between py-3 border-b border-gray-100"
                  onPress={() => handleReadChapter(chapter.id, chapter.title)}
                >
                  <View className="flex-1 mr-4">
                    <Text className="text-base text-gray-900" numberOfLines={1}>
                      {chapter.title}
                    </Text>
                    {chapter.pagesTotal > 0 && (
                      <Text className="text-xs text-gray-400 mt-0.5">
                        {chapter.pagesRead}/{chapter.pagesTotal} pages
                      </Text>
                    )}
                  </View>
                  <Text className="text-gray-400 text-sm">Read →</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      )}

      {bookVolumes.length === 0 && !isLoading && (
        <Text className="text-center text-gray-400 mt-10">No chapters found.</Text>
      )}
    </ScrollView>
  );
}

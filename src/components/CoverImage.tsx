import React, { useMemo } from 'react';
import { Image as ExpoImage, ImageStyle } from 'expo-image';
import { StyleProp } from 'react-native';
import { withUniwind } from 'uniwind';
import { useAuthStore } from '@/store/authStore';

interface CoverImageProps {
  uri: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  className?: string;
}

/**
 * Image component that automatically injects auth headers when required.
 * Uses expo-image for reliable header support on Android.
 * expo-image is a third-party component, so it needs withUniwind
 * for className styles like w-full/h-full to resolve correctly.
 */
const Image = withUniwind(ExpoImage);

export function CoverImage({ uri, style, resizeMode = 'cover', className }: CoverImageProps) {
  const auth = useAuthStore((s) => s.auth);

  const source = useMemo(() => {
    if (!uri) return null;
    if (auth?.apiKey) {
      return { uri, headers: { Authorization: `Basic ${auth.apiKey}` } };
    }
    return { uri };
  }, [uri, auth?.apiKey]);

  if (!source) return null;
  return (
    <Image
      source={source}
      style={style}
      contentFit={resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'none' : resizeMode as 'cover' | 'contain'}
      className={className}
    />
  );
}

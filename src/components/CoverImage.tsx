import React, { useMemo } from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';
import { useAuthStore } from '@/store/authStore';

interface CoverImageProps {
  uri: string | null;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  className?: string;
}

/**
 * Image component that automatically injects auth headers when required.
 * Komga requires an `Authorization: Basic <base64>` header (stored in auth.apiKey).
 */
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
  return <Image source={source} style={style} resizeMode={resizeMode} className={className} />;
}

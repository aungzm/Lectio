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
 * - Kavita: no headers needed (API key is embedded in the URL as a query param)
 * - Komga: requires `Authorization: Basic <base64>` header (stored in auth.apiKey)
 */
export function CoverImage({ uri, style, resizeMode = 'cover', className }: CoverImageProps) {
  const serverConfig = useAuthStore((s) => s.serverConfig);
  const auth = useAuthStore((s) => s.auth);

  const source = useMemo(() => {
    if (!uri) return null;
    if (serverConfig?.providerType === 'komga' && auth?.apiKey) {
      return { uri, headers: { Authorization: `Basic ${auth.apiKey}` } };
    }
    return { uri };
  }, [uri, serverConfig?.providerType, auth?.apiKey]);

  if (!source) return null;
  return <Image source={source} style={style} resizeMode={resizeMode} className={className} />;
}

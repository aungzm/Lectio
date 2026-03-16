import React, { useState } from 'react';
import { Image } from 'react-native';

interface ImageWithFallbackProps {
  uri: string | null;
  fallback: React.ReactNode;
}

/**
 * Renders an image from a URI with automatic fallback to a provided element
 * when the URI is null or the image fails to load.
 */
export function ImageWithFallback({ uri, fallback }: ImageWithFallbackProps) {
  const [errored, setErrored] = useState(false);

  if (!uri || errored) return <>{fallback}</>;

  return (
    <Image
      source={{ uri }}
      style={{ width: '100%', height: '100%' }}
      resizeMode="cover"
      onError={() => setErrored(true)}
    />
  );
}

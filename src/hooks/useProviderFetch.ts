import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { ILibraryProvider } from '@/providers/base/ILibraryProvider';

/**
 * Runs a fetch callback whenever the provider is available.
 * Replaces the repeated `useEffect(() => { if (provider) fetch(provider, ...) }, [provider, ...])` pattern.
 */
export function useProviderFetch(
  callback: (provider: ILibraryProvider) => void,
  deps: React.DependencyList = [],
) {
  const provider = useAuthStore((s) => s.provider);

  useEffect(() => {
    if (provider) callback(provider);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider, ...deps]);
}

import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { ILibraryProvider } from '@/providers';

type CoverMethod = keyof {
  [K in keyof ILibraryProvider as ILibraryProvider[K] extends ((id: string) => string) | undefined ? K : never]: true;
};

/**
 * Returns a function that builds a cover URL for a given item ID.
 *
 * - No argument: uses `provider.getCoverUrl(id)`
 * - With a method name (e.g. `'getBookCoverUrl'`): uses that method if it exists,
 *   otherwise returns null (does NOT fall back to getCoverUrl).
 */
export function useCoverUri(method?: CoverMethod) {
  const provider = useAuthStore((s) => s.provider);

  return useCallback(
    (id: string): string | null => {
      if (!provider) return null;
      if (method) {
        const fn = provider[method] as ((id: string) => string) | undefined;
        return fn ? fn.call(provider, id) : null;
      }
      return provider.getCoverUrl(id);
    },
    [provider, method],
  );
}

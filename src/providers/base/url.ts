/** Normalize a server URL once — strip trailing slash. */
export function normalizeUrl(serverUrl: string): string {
  return serverUrl.replace(/\/$/, '');
}

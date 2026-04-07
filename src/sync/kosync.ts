/**
 * KOReader kosync protocol client.
 *
 * KOReader syncs reading positions via a simple REST API (kosync).
 * Compatible servers: koreader-sync-server, KOReader's built-in sync.
 *
 * API reference: https://github.com/koreader/koreader-sync-server
 */

import axios from 'axios';

export interface KosyncCredentials {
  serverUrl: string;
  username: string;
  /** MD5 hash of the password, as required by kosync */
  passwordMd5: string;
}

export interface KosyncProgress {
  /** Unique document identifier — typically MD5 of the file */
  document: string;
  progress: string; // e.g. "/body/DocFragment[12]/body/p[1]/img.0"
  percentage: number; // 0.0 – 1.0
  device: string;
  device_id: string;
  timestamp: number; // Unix epoch seconds
}

export interface KosyncSyncResult {
  document: string;
  progress: string;
  percentage: number;
  device: string;
  device_id: string;
  timestamp: number;
}

async function kosyncClient(credentials: KosyncCredentials) {
  return axios.create({
    baseURL: credentials.serverUrl.replace(/\/$/, ''),
    headers: {
      'x-auth-user': credentials.username,
      'x-auth-key': credentials.passwordMd5,
    },
  });
}

/** Register a user on the kosync server (only needed once). */
export async function kosyncRegister(credentials: KosyncCredentials): Promise<boolean> {
  const client = await kosyncClient(credentials);
  const { data } = await client.post('/users/create', {
    username: credentials.username,
    password: credentials.passwordMd5,
  });
  return data?.username === credentials.username;
}

/** Push a reading position to the kosync server. */
export async function kosyncPushProgress(credentials: KosyncCredentials, progress: KosyncProgress): Promise<void> {
  const client = await kosyncClient(credentials);
  await client.put('/syncs/progress', progress);
}

/** Pull the last known position for a document from the kosync server. */
export async function kosyncPullProgress(
  credentials: KosyncCredentials,
  documentId: string,
): Promise<KosyncSyncResult | null> {
  try {
    const client = await kosyncClient(credentials);
    const { data } = await client.get<KosyncSyncResult>(`/syncs/progress/${documentId}`);
    return data;
  } catch {
    return null;
  }
}

/** Check whether the provided credentials are valid. */
export async function kosyncAuthorize(credentials: KosyncCredentials): Promise<boolean> {
  try {
    const client = await kosyncClient(credentials);
    const { data } = await client.get('/users/auth');
    return data?.authorized === 'OK';
  } catch {
    return false;
  }
}

import type { AuthResult } from '@/providers/base/ILibraryProvider';
import type { ServerConfig } from '@/store/authStore';

export function isDemoModeEnabled(): boolean {
  const value = process.env.EXPO_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

export function createDemoServerConfig(): ServerConfig {
  return {
    id: 'demo-library',
    name: 'Lektio Demo Library',
    serverUrl: 'demo://library',
    providerType: 'komga',
  };
}

export function createDemoAuth(): AuthResult {
  return {
    token: 'demo-session',
    username: 'demo@lektio.local',
    apiKey: 'demo-api-key',
  };
}

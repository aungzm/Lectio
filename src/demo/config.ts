import type { AuthResult } from '@/providers/base/ILibraryProvider';
import type { ServerConfig } from '@/store/authStore';

export function isBundledDemoModeEnabled(): boolean {
  const value = process.env.EXPO_PUBLIC_DEMO_MODE?.trim().toLowerCase();
  return value === 'true' || value === '1' || value === 'yes' || value === 'on';
}

export function isDemoServerConfig(config: ServerConfig | null | undefined): boolean {
  return config?.serverUrl === 'demo://library';
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

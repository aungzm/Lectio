import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KavitaProvider } from '@/providers';
import type { ILibraryProvider, AuthResult } from '@/providers';

export type ProviderType = 'kavita'; // extend as new providers are added

export interface ServerConfig {
  id: string;
  name: string;
  serverUrl: string;
  providerType: ProviderType;
}

interface AuthState {
  serverConfig: ServerConfig | null;
  auth: AuthResult | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (config: ServerConfig, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

function getProvider(type: ProviderType): ILibraryProvider {
  switch (type) {
    case 'kavita':
      return new KavitaProvider();
  }
}

const SESSION_KEY = 'lektio:session';

export const useAuthStore = create<AuthState>((set, get) => ({
  serverConfig: null,
  auth: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (config, username, password) => {
    set({ isLoading: true, error: null });
    try {
      const provider = getProvider(config.providerType);
      const auth = await provider.login(config.serverUrl, username, password);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ config, auth }));
      set({ serverConfig: config, auth, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Login failed' });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    set({ serverConfig: null, auth: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const { config, auth } = JSON.parse(raw) as { config: ServerConfig; auth: AuthResult };
      const provider = getProvider(config.providerType);
      const valid = await provider.validateToken(config.serverUrl, auth.token);
      if (valid) {
        set({ serverConfig: config, auth, isAuthenticated: true });
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // silently ignore — user will be prompted to log in
    }
  },
}));

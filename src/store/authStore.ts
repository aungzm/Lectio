import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  KavitaProvider,
  kavitaLogin,
  kavitaValidateToken,
  KomgaProvider,
  komgaLogin,
  komgaValidateToken,
} from '@/providers';
import type { ILibraryProvider, AuthResult } from '@/providers';

export type ProviderType = 'kavita' | 'komga';

export interface ServerConfig {
  id: string;
  name: string;
  serverUrl: string;
  providerType: ProviderType;
}

interface AuthState {
  serverConfig: ServerConfig | null;
  auth: AuthResult | null;
  provider: ILibraryProvider | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (config: ServerConfig, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

function createProvider(config: ServerConfig, auth: AuthResult): ILibraryProvider {
  switch (config.providerType) {
    case 'kavita':
      return new KavitaProvider(config.serverUrl, auth.token, auth.apiKey);
    case 'komga':
      return new KomgaProvider(config.serverUrl, auth.token);
  }
}

const SESSION_KEY = 'lektio:session';

export const useAuthStore = create<AuthState>((set) => ({
  serverConfig: null,
  auth: null,
  provider: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (config, username, password) => {
    set({ isLoading: true, error: null });
    try {
      let auth: AuthResult;
      if (config.providerType === 'kavita') {
        const user = await kavitaLogin(config.serverUrl, { username, password });
        auth = { token: user.token, username: user.username, apiKey: user.apiKey };
      } else {
        const { user, sessionToken, basicAuth } = await komgaLogin(config.serverUrl, username, password);
        auth = { token: sessionToken, username: user.email, apiKey: basicAuth };
      }
      const provider = createProvider(config, auth);
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify({ config, auth }));
      set({ serverConfig: config, auth, provider, isAuthenticated: true, isLoading: false });
    } catch (e: any) {
      set({ isLoading: false, error: e?.message ?? 'Login failed' });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem(SESSION_KEY);
    set({ serverConfig: null, auth: null, provider: null, isAuthenticated: false, error: null });
  },

  restoreSession: async () => {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const { config, auth } = JSON.parse(raw) as { config: ServerConfig; auth: AuthResult };
      let valid: boolean;
      if (config.providerType === 'kavita') {
        valid = await kavitaValidateToken(config.serverUrl, auth.token);
      } else {
        valid = await komgaValidateToken(config.serverUrl, auth.token);
      }
      if (valid) {
        const provider = createProvider(config, auth);
        set({ serverConfig: config, auth, provider, isAuthenticated: true });
      } else {
        await AsyncStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // silently ignore — user will be prompted to log in
    }
  },
}));

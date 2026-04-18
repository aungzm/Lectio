import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Uniwind } from 'uniwind';
import { APP_THEME_NAMES, DEFAULT_THEME } from '@/theme/themes';
import type { AppThemeName } from '@/theme/themes';

interface ThemeState {
  currentTheme: AppThemeName;
  isReady: boolean;
  setTheme: (theme: AppThemeName) => Promise<void>;
  restoreTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'lektio:theme';

function applyTheme(theme: AppThemeName) {
  Uniwind.setTheme(theme);
}

function isAppThemeName(value: string | null): value is AppThemeName {
  return value != null && APP_THEME_NAMES.includes(value as AppThemeName);
}

export const useThemeStore = create<ThemeState>((set) => ({
  currentTheme: DEFAULT_THEME,
  isReady: false,

  setTheme: async (theme) => {
    applyTheme(theme);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    set({ currentTheme: theme, isReady: true });
  },

  restoreTheme: async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      const theme = isAppThemeName(storedTheme) ? storedTheme : DEFAULT_THEME;
      applyTheme(theme);
      set({ currentTheme: theme, isReady: true });
    } catch {
      applyTheme(DEFAULT_THEME);
      set({ currentTheme: DEFAULT_THEME, isReady: true });
    }
  },
}));

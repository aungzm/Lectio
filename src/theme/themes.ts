import type { StatusBarStyle } from 'expo-status-bar';

export const APP_THEME_NAMES = ['light', 'dark', 'sepia', 'ocean', 'forest'] as const;

export type AppThemeName = (typeof APP_THEME_NAMES)[number];

export const DEFAULT_THEME: AppThemeName = 'light';

export interface AppThemeDefinition {
  label: string;
  description: string;
  statusBarStyle: StatusBarStyle;
  isDark: boolean;
  preview: {
    background: string;
    surface: string;
    accent: string;
    text: string;
  };
}

export const APP_THEMES: Record<AppThemeName, AppThemeDefinition> = {
  light: {
    label: 'Light',
    description: 'Bright and crisp for everyday browsing.',
    statusBarStyle: 'dark',
    isDark: false,
    preview: {
      background: 'bg-[#f4f6fb]',
      surface: 'bg-[#ffffff]',
      accent: 'bg-[#1d72f3]',
      text: 'bg-[#172033]',
    },
  },
  dark: {
    label: 'Dark',
    description: 'Low glare nighttime reading.',
    statusBarStyle: 'light',
    isDark: true,
    preview: {
      background: 'bg-[#07111f]',
      surface: 'bg-[#0f1b2d]',
      accent: 'bg-[#60a5fa]',
      text: 'bg-[#f8fafc]',
    },
  },
  sepia: {
    label: 'Sepia',
    description: 'Warm paper tones with softer contrast.',
    statusBarStyle: 'dark',
    isDark: false,
    preview: {
      background: 'bg-[#f2e8d5]',
      surface: 'bg-[#fbf5e8]',
      accent: 'bg-[#b46a28]',
      text: 'bg-[#4a3728]',
    },
  },
  ocean: {
    label: 'Ocean',
    description: 'Cool blue-greens with a fresh, airy feel.',
    statusBarStyle: 'dark',
    isDark: false,
    preview: {
      background: 'bg-[#e6f4f7]',
      surface: 'bg-[#f7fcfd]',
      accent: 'bg-[#0f93a8]',
      text: 'bg-[#12384b]',
    },
  },
  forest: {
    label: 'Forest',
    description: 'Muted greens with a grounded, cozy tone.',
    statusBarStyle: 'dark',
    isDark: false,
    preview: {
      background: 'bg-[#ecf3ea]',
      surface: 'bg-[#f9fcf7]',
      accent: 'bg-[#4f7a51]',
      text: 'bg-[#243328]',
    },
  },
};

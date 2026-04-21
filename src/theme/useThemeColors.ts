import { useCSSVariable } from 'uniwind';
import { useThemeStore } from '@/store/themeStore';
import { APP_THEMES } from '@/theme/themes';

function asColor(value: string | number | undefined, fallback: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return `${value}`;
  return fallback;
}

export function useThemeColors() {
  const currentTheme = useThemeStore((state) => state.currentTheme);
  const [
    primary,
    secondary,
    tertiary,
    background,
    surface,
    border,
    muted,
    accent,
    accentDark,
    accentSoft,
    accentSoftStrong,
    accentContrast,
    danger,
  ] = useCSSVariable([
    '--color-primary',
    '--color-secondary',
    '--color-tertiary',
    '--color-background',
    '--color-surface',
    '--color-border',
    '--color-muted',
    '--color-accent',
    '--color-accent-dark',
    '--color-accent-soft',
    '--color-accent-soft-strong',
    '--color-accent-contrast',
    '--color-danger',
  ]);

  return {
    currentTheme,
    isDark: APP_THEMES[currentTheme].isDark,
    statusBarStyle: APP_THEMES[currentTheme].statusBarStyle,
    primary: asColor(primary, '#ffffff'),
    secondary: asColor(secondary, '#111827'),
    tertiary: asColor(tertiary, '#6b7280'),
    background: asColor(background, '#f9fafb'),
    surface: asColor(surface, '#ffffff'),
    border: asColor(border, '#e5e7eb'),
    muted: asColor(muted, '#9ca3af'),
    accent: asColor(accent, '#0ea5e9'),
    accentDark: asColor(accentDark, '#0284c7'),
    accentSoft: asColor(accentSoft, '#e0f2fe'),
    accentSoftStrong: asColor(accentSoftStrong, '#bae6fd'),
    accentContrast: asColor(accentContrast, '#ffffff'),
    danger: asColor(danger, '#dc2626'),
  };
}

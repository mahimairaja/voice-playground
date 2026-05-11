'use client';

import { useTheme as useNextTheme } from 'next-themes';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'dark', 'system'] as const;

export interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  systemTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export function useTheme(): UseThemeReturn {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();
  const safeTheme = (theme ?? 'system') as Theme;
  const safeResolved = (resolvedTheme ?? 'light') as ResolvedTheme;
  const safeSystem = (systemTheme ?? 'light') as ResolvedTheme;

  return {
    theme: safeTheme,
    resolvedTheme: safeResolved,
    systemTheme: safeSystem,
    setTheme: (next) => setTheme(next),
    toggleTheme: () => setTheme(safeResolved === 'dark' ? 'light' : 'dark'),
  };
}

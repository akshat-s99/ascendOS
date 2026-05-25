'use client';

import { useEffect } from 'react';
import type { ThemePreference } from '@/lib/types/ascend';

export function useThemeSync(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement;
    const classes: ThemePreference[] = ['deep-midnight', 'aurora-blue', 'crimson-gradient', 'arctic-light', 'system'];
    const applyTheme = () => {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved: Exclude<ThemePreference, 'system'> =
        theme === 'system'
          ? systemDark
            ? 'deep-midnight'
            : 'arctic-light'
          : theme;

      classes.forEach((className) => root.classList.remove(className));
      root.classList.add(resolved);
      root.classList.toggle('dark', resolved !== 'arctic-light');
      root.style.colorScheme = resolved === 'arctic-light' ? 'light' : 'dark';
    };

    applyTheme();
    if (theme !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);
}

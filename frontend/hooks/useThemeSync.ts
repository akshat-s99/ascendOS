'use client';

import { useEffect } from 'react';
import type { ThemePreference } from '@/lib/types/ascend';

export function useThemeSync(theme: ThemePreference) {
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const resolved =
        theme === 'system'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : theme;
      root.classList.toggle('dark', resolved === 'dark');
      root.style.colorScheme = resolved;
    };

    applyTheme();
    if (theme !== 'system') return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', applyTheme);
    return () => media.removeEventListener('change', applyTheme);
  }, [theme]);
}

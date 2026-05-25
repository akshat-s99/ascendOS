'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AscendAppShell from '@/components/layouts/AscendAppShell';
import { useAscend } from '@/hooks/useAscend';

export default function Page() {
  const router = useRouter();
  const api = useAscend();
  const { state, ready } = api;

  useEffect(() => {
    if (ready && !state.profile?.onboardingComplete) {
      router.replace('/onboarding');
    }
  }, [ready, state.profile?.onboardingComplete, router]);

  if (!ready) return null;
  if (!state.profile?.onboardingComplete) return null;

  return <AscendAppShell api={api} />;
}

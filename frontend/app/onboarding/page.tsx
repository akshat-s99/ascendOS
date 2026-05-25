'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { useAscend } from '@/hooks/useAscend';

function OnboardingGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get('edit') === '1';
  const { state, ready } = useAscend();

  useEffect(() => {
    if (ready && state.profile?.onboardingComplete && !isEdit) {
      router.replace('/');
    }
  }, [ready, state.profile?.onboardingComplete, isEdit, router]);

  if (!ready) return null;
  if (state.profile?.onboardingComplete && !isEdit) return null;

  return <OnboardingFlow isEdit={isEdit} initialProfile={state.profile ?? undefined} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingGate />
    </Suspense>
  );
}

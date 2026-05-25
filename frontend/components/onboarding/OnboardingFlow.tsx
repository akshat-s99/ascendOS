'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { APP_NAME, APP_VERSION } from '@/lib/constants/branding';
import type { UserProfile } from '@/lib/types/ascend';
import { EVOLUTION_FOCUS_SUGGESTIONS } from '@/data/defaults';
import { useAscend } from '@/hooks/useAscend';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const STEPS = ['boot', 'welcome', 'profile', 'path'] as const;
type Step = (typeof STEPS)[number];

const BOOT_LINES = [
  'ASCENDOS KERNEL v3.0 — INITIALIZING',
  'Loading adaptive evolution engine...',
  'Calibrating behavioral analysis modules...',
  'Mounting local state persistence layer...',
  'Evolution scoring system online.',
  'System ready. Awaiting operator.',
];

function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= BOOT_LINES.length) {
        clearInterval(interval);
        setTimeout(onComplete, 600);
      }
    }, 280);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-background os-canvas flex items-center justify-center px-6">
      <div className="w-full max-w-lg space-y-1.5">
        <p className="text-xs font-mono text-primary/40 mb-6 tracking-widest uppercase">
          {APP_NAME} {APP_VERSION}
        </p>
        {BOOT_LINES.map((line, i) => (
          <p
            key={i}
            className={`text-sm font-mono transition-all duration-200 ${
              i < visibleLines ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1'
            } ${
              i === 0
                ? 'text-primary font-medium'
                : i === visibleLines - 1
                ? 'text-foreground'
                : 'text-muted-foreground'
            }`}
          >
            {i < visibleLines - 1 ? (
              <span className="text-primary/40 mr-2">✓</span>
            ) : i === visibleLines - 1 ? (
              <span className="text-primary mr-2">›</span>
            ) : null}
            {line}
          </p>
        ))}
        <div className={`mt-4 h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent transition-opacity duration-300 ${visibleLines > 0 ? 'opacity-100' : 'opacity-0'}`} />
      </div>
    </div>
  );
}

export default function OnboardingFlow({
  isEdit = false,
  initialProfile,
}: {
  isEdit?: boolean;
  initialProfile?: UserProfile;
}) {
  const router = useRouter();
  const { completeOnboarding, updateProfile } = useAscend();
  const [step, setStep] = useState<Step>(isEdit ? 'profile' : 'boot');

  const [name, setName] = useState(initialProfile?.name ?? '');
  const [evolutionFocus, setEvolutionFocus] = useState(
    initialProfile?.evolutionFocus ?? EVOLUTION_FOCUS_SUGGESTIONS[0]
  );
  const [dailyMinutes, setDailyMinutes] = useState(
    String(initialProfile?.dailyTargetMinutes ?? 240)
  );

  const contentSteps = ['welcome', 'profile', 'path'] as const;
  const stepIndex = contentSteps.indexOf(step as typeof contentSteps[number]);
  const progress = step === 'boot' ? 0 : ((stepIndex + 1) / contentSteps.length) * 100;

  const canContinue = () => {
    if (step === 'welcome') return true;
    if (step === 'profile') return name.trim().length >= 2;
    if (step === 'path') return Number(dailyMinutes) > 0;
    return false;
  };

  const finish = () => {
    const profile: UserProfile = {
      name: name.trim(),
      evolutionFocus: evolutionFocus.trim() || undefined,
      dailyTargetMinutes: Math.max(30, Number(dailyMinutes) || 240),
      onboardingComplete: true,
      createdAt: initialProfile?.createdAt ?? new Date().toISOString(),
    };
    if (isEdit) updateProfile(profile);
    else completeOnboarding(profile);
    router.replace('/');
  };

  const next = () => {
    const i = contentSteps.indexOf(step as typeof contentSteps[number]);
    if (i < contentSteps.length - 1) setStep(contentSteps[i + 1]);
    else finish();
  };

  const back = () => {
    const i = contentSteps.indexOf(step as typeof contentSteps[number]);
    if (i > 0) setStep(contentSteps[i - 1]);
  };

  if (step === 'boot') {
    return <BootSequence onComplete={() => setStep('welcome')} />;
  }

  return (
    <main className="min-h-screen bg-background os-canvas flex flex-col">
      {/* Header */}
      <header className="border-b border-primary/10 bg-background/90 backdrop-blur-md relative z-10">
        <div className="max-w-lg mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-label mb-1">// INITIALIZATION SEQUENCE</p>
              <h1 className="text-sm font-mono text-foreground tracking-wide">{APP_NAME}</h1>
            </div>
            <span className="tier-badge">{APP_VERSION}</span>
          </div>
          <div className="h-px bg-border/50 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary/60 to-primary transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {contentSteps.map((s, i) => (
              <span
                key={s}
                className={`text-[10px] font-mono uppercase tracking-widest transition-colors ${
                  i <= stepIndex ? 'text-primary' : 'text-muted-foreground/40'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-lg panel panel-accent">
          {step === 'welcome' && (
            <div key="welcome" className="space-y-7 fade-in">
              <div>
                <p className="section-label mb-3">// SYSTEM OVERVIEW</p>
                <h2 className="text-xl font-mono holo-text leading-tight">
                  Personal Evolution<br />Operating System
                </h2>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  AscendOS does not assign tasks or define your path. You log activities,
                  set goals, and build routines — the system tracks, analyzes, and
                  evolves with your behavior.
                </p>
              </div>
              <div className="space-y-2.5 border border-border/40 p-4 bg-background/40">
                {[
                  ['Log', 'Any activity you choose — coding, gym, sleep, reading'],
                  ['Define', 'Personal goals on your own timeline'],
                  ['Analyze', 'Adaptive evolution scoring across 5 dimensions'],
                  ['Evolve', 'Life analytics and behavioral pattern insights'],
                ].map(([label, desc]) => (
                  <div key={label} className="flex gap-3 text-sm">
                    <span className="text-primary font-mono shrink-0 w-14">{label}</span>
                    <span className="text-muted-foreground">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div key="profile" className="space-y-6 fade-in">
              <div>
                <p className="section-label mb-3">// OPERATOR IDENTITY</p>
                <h2 className="text-lg font-mono text-foreground">Identify yourself</h2>
                <p className="text-xs text-muted-foreground mt-2">
                  This is how the system will address you.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Operator name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="font-mono"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 'path' && (
            <div key="path" className="space-y-6 fade-in">
              <div>
                <p className="section-label mb-3">// EVOLUTION PATH</p>
                <h2 className="text-lg font-mono text-foreground">Configure your direction</h2>
                <p className="text-xs text-muted-foreground mt-2">
                  An optional focus label — not a preset curriculum. Adjust anytime.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="focus" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Evolution focus
                </Label>
                <Input
                  id="focus"
                  value={evolutionFocus}
                  onChange={(e) => setEvolutionFocus(e.target.value)}
                  list="focus-suggestions"
                  className="font-mono"
                />
                <datalist id="focus-suggestions">
                  {EVOLUTION_FOCUS_SUGGESTIONS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="minutes" className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Daily active target (minutes)
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min={30}
                  max={960}
                  value={dailyMinutes}
                  onChange={(e) => setDailyMinutes(e.target.value)}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground font-mono">
                  Used for focus scoring — reconfigurable at any time.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-border/40">
            <Button
              variant="outline"
              onClick={back}
              disabled={step === 'welcome'}
              className="font-mono text-xs"
            >
              Back
            </Button>
            <Button
              onClick={next}
              disabled={!canContinue()}
              className="font-mono text-xs"
            >
              {step === 'path'
                ? isEdit
                  ? 'Save configuration'
                  : 'Initialize AscendOS'
                : 'Continue →'}
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 text-center pb-6">
        <p className="text-xs font-mono text-muted-foreground/40">
          {APP_NAME} · Local evolution engine · No backend
        </p>
      </div>
    </main>
  );
}

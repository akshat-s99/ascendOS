'use client';

import { Lock, Trophy } from 'lucide-react';
import type { AscendState } from '@/lib/types/ascend';

interface Props {
  state: AscendState;
}

const MILESTONE_HINTS: Record<string, string> = {
  'm-1': 'Log your first activity',
  'm-2': 'Maintain a 7-day streak',
  'm-3': 'Complete 10 activities',
  'm-4': 'Balance ≥60 & Focus ≥50',
  'm-5': 'Reach 3,500 evolution pts',
  'm-6': 'Evolution index ≥85',
};

export default function MilestonesPanel({ state }: Props) {
  const unlocked = state.milestones.filter((m) => m.unlocked).length;
  const total = state.milestones.length;

  return (
    <div className="panel h-full fade-in">
      <div className="panel-header">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="section-label mb-2">// MILESTONES</p>
            <p className="text-xs text-muted-foreground">
              Evolution checkpoints
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
              Unlocked
            </p>
            <p className="font-mono">
              <span className="holo-text text-lg">{unlocked}</span>
              <span className="text-muted-foreground text-sm">/{total}</span>
            </p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-3 progress-bar">
          <div
            className="progress-fill transition-[width] duration-700 ease-out"
            style={{ width: `${(unlocked / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {state.milestones.map((m, idx) => (
          <div
            key={m.id}
            className={`border p-3 text-center transition-all ${
              m.unlocked
                ? 'border-primary/30 bg-primary/5'
                : 'border-border/40 bg-background/20 opacity-40'
            }`}
          >
            {m.unlocked ? (
              <>
                <Trophy className="w-3.5 h-3.5 mx-auto text-primary mb-2" />
                <p className="text-xs font-mono text-foreground leading-tight">{m.title}</p>
                {m.unlockedAt && (
                  <p className="text-[9px] text-muted-foreground font-mono mt-1">
                    {new Date(m.unlockedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-[9px] font-mono text-muted-foreground/50 leading-tight">
                  {MILESTONE_HINTS[m.id] ?? m.title}
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

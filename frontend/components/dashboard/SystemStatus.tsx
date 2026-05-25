'use client';

import type { AscendState, EvolutionScores } from '@/lib/types/ascend';
import { APP_NAME } from '@/lib/constants/branding';

interface Props {
  state: AscendState;
  scores: EvolutionScores;
}

export default function SystemStatus({ state, scores }: Props) {
  const profile = state.profile;

  const dimensions = [
    { label: 'Focus', value: scores.focus },
    { label: 'Discipline', value: scores.discipline },
    { label: 'Balance', value: scores.balance },
    { label: 'Consistency', value: scores.consistency },
  ];

  return (
    <div className="panel panel-accent h-full fade-in">
      <div className="panel-header">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="section-label mb-2">// SYSTEM STATUS</p>
            <p className="text-sm font-mono text-foreground">{APP_NAME}</p>
          </div>
          <span className="tier-badge shrink-0">{scores.tierLabel}</span>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">Operator</span>
          <span className="value-primary">{profile?.name ?? '—'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">Focus path</span>
          <span className="value-primary truncate max-w-[55%] text-right text-xs">
            {profile?.evolutionFocus ?? '—'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">Evolution pts</span>
          <span className="holo-text text-sm">{scores.evolutionPoints.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">Activities</span>
          <span className="value-primary">{state.activities.length}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-mono">Goals active</span>
          <span className="value-primary">{state.goals.length}</span>
        </div>
      </div>

      <div className="divider mb-5" />

      <div className="stat-grid">
        {dimensions.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-label text-[10px]">{stat.label}</div>
            <div className="stat-value-glow text-xl mt-2">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

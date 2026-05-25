'use client';

import type { EvolutionScores } from '@/lib/types/ascend';

interface Props {
  scores: EvolutionScores;
}

const TIER_ORDER = ['Initiate', 'Adaptive', 'Structured', 'Refined', 'Elevated', 'Transcendent'];

export default function EvolutionProgress({ scores }: Props) {
  const tierIndex = TIER_ORDER.indexOf(scores.tierLabel);

  const dimensions = [
    { label: 'Focus', value: scores.focus, desc: 'Productive time ratio' },
    { label: 'Discipline', value: scores.discipline, desc: 'Streak & goal adherence' },
    { label: 'Balance', value: scores.balance, desc: 'Category diversity' },
    { label: 'Consistency', value: scores.consistency, desc: 'Active days this week' },
    { label: 'Growth', value: scores.growth, desc: 'Weekly evolution gain' },
  ];

  return (
    <div className="panel h-full fade-in">
      <div className="panel-header">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="section-label mb-2">// EVOLUTION CORE</p>
            <div className="flex items-baseline gap-2">
              <span className="holo-text text-2xl font-mono">
                {scores.evolutionPoints.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground font-mono">evolution pts</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1">
              Index
            </p>
            <p className="text-3xl font-mono holo-text leading-none">{scores.evolutionIndex}</p>
          </div>
        </div>
      </div>

      {/* Tier progression */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="label-secondary">Tier progression</span>
          <span className="text-xs font-mono text-muted-foreground">
            {scores.pointsToNextTier.toLocaleString()} pts to next
          </span>
        </div>
        <div className="progress-bar h-1.5 mb-3">
          <div
            className="progress-fill transition-[width] duration-700 ease-out"
            style={{ width: `${scores.tierProgressPct}%` }}
          />
        </div>
        {/* Tier markers */}
        <div className="flex justify-between">
          {TIER_ORDER.map((tier, i) => (
            <span
              key={tier}
              className={`text-[9px] font-mono uppercase tracking-wider transition-colors ${
                i <= tierIndex ? 'text-primary' : 'text-muted-foreground/30'
              }`}
            >
              {tier.slice(0, 3)}
            </span>
          ))}
        </div>
      </div>

      <div className="divider mb-5" />

      {/* 5 Dimensions */}
      <div className="grid grid-cols-5 gap-2">
        {dimensions.map((dim) => (
          <div key={dim.label} className="text-center group">
            <div className="stat-item py-3 px-1">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider mb-2">
                {dim.label}
              </p>
              <p className="stat-value-glow text-base">{dim.value}</p>
              <div className="mt-2 progress-bar h-0.5">
                <div
                  className="progress-fill transition-[width] duration-700 ease-out"
                  style={{ width: `${dim.value}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

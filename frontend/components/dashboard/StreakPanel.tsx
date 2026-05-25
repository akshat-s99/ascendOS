'use client';

import type { AscendState, EvolutionScores } from '@/lib/types/ascend';

interface Props {
  state: AscendState;
  scores: EvolutionScores;
}

export default function StreakPanel({ state, scores }: Props) {
  const { streak, weeklyStats } = state;

  // Build last 7 days activity map
  const today = new Date();
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 1);
    return { key, label, active: streak.activeDates.includes(key) };
  });

  return (
    <div className="panel h-full fade-in">
      <div className="panel-header">
        <p className="section-label mb-2">// EVOLUTION STREAK</p>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-item">
          <p className="stat-label text-[10px]">Current</p>
          <p className="stat-value-glow text-xl mt-2">{streak.current}</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">days</p>
        </div>
        <div className="stat-item">
          <p className="stat-label text-[10px]">Longest</p>
          <p className="stat-value-glow text-xl mt-2">{streak.longest}</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">days</p>
        </div>
        <div className="stat-item">
          <p className="stat-label text-[10px]">Growth</p>
          <p className="stat-value-glow text-xl mt-2">{scores.growth}</p>
          <p className="text-[10px] text-muted-foreground font-mono mt-1">score</p>
        </div>
      </div>

      {/* 7-day activity grid */}
      <div className="mb-5">
        <p className="label-secondary mb-3">Last 7 days</p>
        <div className="flex gap-1.5">
          {last7.map((day) => (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className={`w-full h-8 rounded-sm transition-colors ${
                  day.active
                    ? 'bg-primary/70 shadow-[0_0_8px_rgba(79,168,232,0.3)]'
                    : 'bg-border/40'
                }`}
              />
              <span className="text-[9px] font-mono text-muted-foreground">{day.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="divider mb-4" />

      {/* Weekly summary */}
      <div className="grid grid-cols-2 gap-3 text-xs font-mono">
        <div>
          <p className="text-muted-foreground">Activities this week</p>
          <p className="text-foreground mt-0.5">{weeklyStats.activitiesLogged}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Minutes logged</p>
          <p className="text-foreground mt-0.5">{weeklyStats.minutesLogged}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Evolution gained</p>
          <p className="text-primary mt-0.5">+{weeklyStats.evolutionGained} pts</p>
        </div>
        <div>
          <p className="text-muted-foreground">Consistency</p>
          <p className="text-foreground mt-0.5">{scores.consistency}%</p>
        </div>
      </div>
    </div>
  );
}

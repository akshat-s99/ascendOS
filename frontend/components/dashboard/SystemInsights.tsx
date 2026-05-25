'use client';

import type { LifeAnalytics, SystemInsight } from '@/lib/types/ascend';

interface Props {
  insights: SystemInsight[];
  analytics: LifeAnalytics;
}

export default function SystemInsights({ insights, analytics }: Props) {
  const maxFocus = Math.max(...analytics.focusPattern.map((s) => s.minutes), 1);

  return (
    <div className="panel panel-accent h-full fade-in">
      <div className="panel-header">
        <p className="section-label mb-2">// SYSTEM INSIGHTS</p>
        <p className="text-xs text-muted-foreground">Adaptive analysis from your activity graph</p>
      </div>

      <ul className="space-y-3 mb-6">
        {insights.map((insight, idx) => (
          <li key={insight.id} className="flex gap-3 text-sm fade-in" style={{ animationDelay: `${idx * 0.07}s` }}>
            <span className="text-primary/50 font-mono shrink-0 mt-0.5">›</span>
            <span className="text-muted-foreground leading-relaxed font-mono text-xs">
              {insight.message}
            </span>
          </li>
        ))}
      </ul>

      <div className="divider mb-5" />

      <p className="label-secondary mb-4">Focus pattern</p>
      <div className="grid grid-cols-4 gap-2">
        {analytics.focusPattern.map((slot) => {
          const pct = (slot.minutes / maxFocus) * 100;
          return (
            <div key={slot.label} className="stat-item py-3">
              <p className="text-[9px] text-muted-foreground font-mono mb-2">{slot.label}</p>
              <div className="progress-bar h-0.5 mb-2">
                <div
                  className="progress-fill transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-primary font-mono">{slot.minutes}m</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

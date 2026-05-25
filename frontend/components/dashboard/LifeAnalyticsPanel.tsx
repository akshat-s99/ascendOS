'use client';

import type { LifeAnalytics } from '@/lib/types/ascend';

interface Props {
  analytics: LifeAnalytics;
}

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const BALANCE_COLORS = [
  'bg-blue-400/70',
  'bg-cyan-400/70',
  'bg-yellow-400/70',
  'bg-indigo-400/70',
];

export default function LifeAnalyticsPanel({ analytics }: Props) {
  const maxTrend = Math.max(...analytics.productivityTrend, 1);

  const balanceRows = [
    { label: 'Study',  minutes: analytics.studyMinutesThisWeek,  color: BALANCE_COLORS[0] },
    { label: 'Coding', minutes: analytics.codingMinutesThisWeek, color: BALANCE_COLORS[1] },
    { label: 'Gaming', minutes: analytics.gamingMinutesThisWeek, color: BALANCE_COLORS[2] },
    { label: 'Sleep',  minutes: analytics.sleepMinutesThisWeek,  color: BALANCE_COLORS[3] },
  ];
  const maxBalance = Math.max(...balanceRows.map((r) => r.minutes), 1);

  return (
    <div className="panel fade-in">
      <div className="panel-header">
        <p className="section-label mb-2">// LIFE ANALYTICS</p>
        <p className="text-xs text-muted-foreground">Behavior-derived patterns · current week</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
        {/* Productivity trend */}
        <div>
          <p className="label-secondary mb-4">Productivity trend</p>
          <div className="flex items-end gap-2 h-24">
            {analytics.productivityTrend.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div
                  className="w-full bg-primary/60 rounded-sm min-h-[3px] transition-[height] duration-700 ease-out"
                  style={{
                    height: `${Math.max(4, (val / maxTrend) * 100)}%`,
                    boxShadow: val > 0 ? '0 0 6px rgba(79,168,232,0.2)' : undefined,
                  }}
                />
                <span className="text-[9px] font-mono text-muted-foreground">{DAY_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category balance */}
        <div>
          <p className="label-secondary mb-4">Category balance</p>
          <div className="space-y-3">
            {balanceRows.map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="text-foreground">{row.minutes}m</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ease-out ${row.color}`}
                    style={{ width: `${(row.minutes / maxBalance) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="divider mb-5" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Balance score', value: `${analytics.balanceScore}%` },
          { label: 'Week minutes',  value: analytics.weeklySummary.totalMinutes },
          { label: 'Sessions',      value: analytics.weeklySummary.activitiesCount },
          { label: 'Top signal',    value: analytics.weeklySummary.topCategory },
        ].map((s) => (
          <div key={s.label} className="stat-item">
            <p className="stat-label text-[10px]">{s.label}</p>
            <p className="stat-value-glow text-sm mt-2 truncate">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

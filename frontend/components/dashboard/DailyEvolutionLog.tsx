'use client';

import type { AscendState } from '@/lib/types/ascend';

interface Props {
  state: AscendState;
}

const TYPE_CONFIG: Record<string, { color: string; dot: string; label: string }> = {
  activity:  { color: 'border-primary/30',  dot: 'bg-primary/70',    label: 'ACT' },
  goal:      { color: 'border-border/50',   dot: 'bg-muted-foreground/50', label: 'GOAL' },
  milestone: { color: 'border-amber-500/40', dot: 'bg-amber-400',    label: 'MILESTONE' },
  evolution: { color: 'border-border/40',   dot: 'bg-border',        label: 'SYS' },
};

export default function DailyEvolutionLog({ state }: Props) {
  const entries = state.evolutionLog.slice(0, 20);

  return (
    <div className="panel h-full fade-in">
      <div className="panel-header">
        <p className="section-label mb-2">// EVOLUTION LOG</p>
        <p className="text-xs text-muted-foreground">
          {entries.length > 0 ? `${entries.length} recent events` : 'No events recorded'}
        </p>
      </div>

      <div className="relative pl-5 border-l border-primary/15 space-y-3 max-h-80 overflow-y-auto pr-1">
        {entries.length === 0 ? (
          <div className="py-8">
            <p className="text-xs text-muted-foreground font-mono">
              Log empty. Actions you take will appear here.
            </p>
          </div>
        ) : (
          entries.map((entry, idx) => {
            const cfg = TYPE_CONFIG[entry.type] ?? TYPE_CONFIG.evolution;
            return (
              <div
                key={entry.id}
                className={`log-entry fade-in ${cfg.color}`}
                style={{ animationDelay: `${idx * 0.025}s` }}
              >
                <div
                  className={`absolute -left-[21px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${cfg.dot}`}
                  style={{ boxShadow: entry.type === 'milestone' ? '0 0 6px rgba(251,191,36,0.5)' : undefined }}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-mono text-foreground leading-snug">{entry.title}</p>
                    {entry.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
                    )}
                  </div>
                  <span className={`text-[9px] font-mono shrink-0 ${
                    entry.type === 'milestone' ? 'text-amber-400' : 'text-muted-foreground/50'
                  }`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground/50 font-mono mt-1">
                  {new Date(entry.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

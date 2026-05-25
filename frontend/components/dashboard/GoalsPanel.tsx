'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown } from 'lucide-react';
import { GOAL_UNITS } from '@/data/defaults';
import type { AscendState, Goal, GoalPeriod } from '@/lib/types/ascend';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
  state: AscendState;
  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) => void;
  updateGoal: (g: Goal) => void;
  deleteGoal: (id: string) => void;
}

const PERIODS: { id: GoalPeriod; label: string }[] = [
  { id: 'daily',   label: 'Daily' },
  { id: 'weekly',  label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly',  label: 'Yearly' },
];

const PERIOD_COLORS: Record<GoalPeriod, string> = {
  daily:   'text-cyan-400',
  weekly:  'text-blue-400',
  monthly: 'text-violet-400',
  yearly:  'text-amber-400',
};

export default function GoalsPanel({ state, addGoal, updateGoal, deleteGoal }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [target, setTarget] = useState('10');
  const [unit, setUnit] = useState('hours');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addGoal({
      title: title.trim(),
      period,
      targetValue: Math.max(1, Number(target) || 1),
      unit,
    });
    setTitle('');
    setTarget('10');
    setOpen(false);
  };

  return (
    <div className="panel panel-accent h-full fade-in">
      <div className="panel-header flex items-start justify-between gap-4">
        <div>
          <p className="section-label mb-2">// EVOLUTION GOALS</p>
          <p className="text-xs text-muted-foreground">
            {state.goals.length > 0
              ? `${state.goals.length} active goal${state.goals.length !== 1 ? 's' : ''}`
              : 'No goals defined'}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="font-mono text-xs shrink-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add goal
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <form
        onSubmit={handleAdd}
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0'} space-y-3`}
      >
        <div className="space-y-1.5">
          <Label htmlFor="goal-title" className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Goal
          </Label>
          <Input
            id="goal-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Complete 200 LeetCode problems"
            className="font-mono"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Period
            </Label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as GoalPeriod)}
              className="w-full h-9"
            >
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Target
            </Label>
            <Input
              type="number"
              min={1}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Unit
            </Label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full h-9"
            >
              {GOAL_UNITS.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>
        <Button type="submit" className="w-full font-mono text-xs">
          Create goal
        </Button>
      </form>

      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {state.goals.length === 0 ? (
          <div className="py-8 text-center border border-border/30 bg-background/30">
            <p className="text-xs text-muted-foreground font-mono">No goals defined.</p>
            <p className="text-xs text-muted-foreground/50 font-mono mt-1">
              Define what evolution means to you.
            </p>
          </div>
        ) : (
          state.goals.map((goal) => {
            const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
            const isComplete = pct >= 100;
            return (
              <div
                key={goal.id}
                className={`border p-4 transition-colors ${
                  isComplete
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-border/60 bg-background/30'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="min-w-0">
                    <p className={`text-sm font-mono ${isComplete ? 'text-primary' : 'text-foreground'}`}>
                      {goal.title}
                    </p>
                    <p className={`text-xs font-mono mt-0.5 ${PERIOD_COLORS[goal.period]}`}>
                      {goal.period}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-muted-foreground/40 hover:text-destructive transition-colors shrink-0"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="progress-bar mb-2">
                  <div
                    className="progress-fill transition-[width] duration-700 ease-out"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
                  <span>
                    {goal.currentValue} / {goal.targetValue} {goal.unit}
                  </span>
                  <span className={isComplete ? 'text-primary' : 'text-muted-foreground'}>
                    {pct}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={goal.targetValue}
                  value={goal.currentValue}
                  onChange={(e) => updateGoal({ ...goal, currentValue: Number(e.target.value) })}
                  className="w-full h-1 accent-primary cursor-pointer"
                  aria-label={`Progress for ${goal.title}`}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

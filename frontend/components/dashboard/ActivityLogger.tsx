'use client';

import { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ChevronDown } from 'lucide-react';
import { ACTIVITY_CATEGORIES } from '@/data/defaults';
import type { Activity, ActivityCategory, AscendState } from '@/lib/types/ascend';
import { categoryLabel, activitiesForDate } from '@/utils/evolution';
import { toDateKey } from '@/utils/dates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  state: AscendState;
  logActivity: (a: Omit<Activity, 'id' | 'loggedAt' | 'dateKey'>) => void;
  toggleActivity: (id: string) => void;
  deleteActivity: (id: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  studying:      'text-blue-400',
  coding:        'text-cyan-400',
  reading:       'text-violet-400',
  productivity:  'text-emerald-400',
  gym:           'text-orange-400',
  content:       'text-pink-400',
  sleep:         'text-indigo-400',
  gaming:        'text-yellow-400',
  social:        'text-rose-400',
  entertainment: 'text-amber-400',
};

export default function ActivityLogger({ state, logActivity, toggleActivity, deleteActivity }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ActivityCategory>('productivity');
  const [duration, setDuration] = useState('30');
  const [notes, setNotes] = useState('');

  const today = toDateKey();
  const todayActivities = activitiesForDate(state.activities, today);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    logActivity({
      title: title.trim(),
      category,
      durationMinutes: Math.max(1, Number(duration) || 30),
      notes: notes.trim() || undefined,
      completed: true,
    });
    setTitle('');
    setNotes('');
    setDuration('30');
    setOpen(false);
  };

  return (
    <div className="panel panel-accent h-full fade-in">
      <div className="panel-header flex items-start justify-between gap-4">
        <div>
          <p className="section-label mb-2">// ACTIVITY LOG</p>
          <p className="text-xs text-muted-foreground">
            {todayActivities.length > 0
              ? `${todayActivities.length} logged today`
              : 'No activities logged today'}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(!open)}
          className="font-mono text-xs shrink-0"
        >
          <Plus className="w-3 h-3 mr-1" />
          Log activity
          <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${open ? 'rotate-180' : ''}`} />
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100 mb-5' : 'max-h-0 opacity-0'} space-y-3`}
      >
        <div className="space-y-1.5">
          <Label htmlFor="act-title" className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Activity
          </Label>
          <Input
            id="act-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What did you do?"
            className="font-mono"
            autoFocus
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Category
            </Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ActivityCategory)}
              className="w-full h-9"
            >
              {ACTIVITY_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="act-dur" className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Duration (min)
            </Label>
            <Input
              id="act-dur"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="act-notes" className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
            Notes (optional)
          </Label>
          <Textarea
            id="act-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="resize-none font-mono text-sm"
          />
        </div>
        <Button type="submit" className="w-full font-mono text-xs">
          Record activity
        </Button>
      </form>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {todayActivities.length === 0 ? (
          <div className="py-8 text-center border border-border/30 bg-background/30">
            <p className="text-xs text-muted-foreground font-mono">
              No activities logged today.
            </p>
            <p className="text-xs text-muted-foreground/50 font-mono mt-1">
              The system adapts to what you define.
            </p>
          </div>
        ) : (
          todayActivities.map((act) => (
            <div
              key={act.id}
              className={`objective-item flex items-start justify-between gap-2 ${
                act.completed ? 'objective-item-completed' : 'objective-item-active'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleActivity(act.id)}
                className="flex items-start gap-3 flex-1 text-left"
              >
                {act.completed ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                )}
                <div className="min-w-0">
                  <p className={`text-sm font-mono ${act.completed ? 'line-through opacity-60' : ''}`}>
                    {act.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
                    <span className={CATEGORY_COLORS[act.category] ?? 'text-muted-foreground'}>
                      {categoryLabel(act.category)}
                    </span>
                    <span className="text-muted-foreground/40">·</span>
                    <span>{act.durationMinutes}m</span>
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => deleteActivity(act.id)}
                className="text-muted-foreground/40 hover:text-destructive transition-colors p-1 shrink-0"
                aria-label="Delete activity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

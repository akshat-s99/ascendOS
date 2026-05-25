import type { StreakState } from '@/lib/types/ascend';
import { toDateKey } from '@/utils/dates';

function dateFromKey(key: string): Date {
  return new Date(`${key}T12:00:00`);
}

function isConsecutive(prev: string, next: string): boolean {
  const a = dateFromKey(prev);
  const b = dateFromKey(next);
  const diff = (b.getTime() - a.getTime()) / 86400000;
  return diff === 1;
}

export function computeStreak(activeDates: string[]): { current: number; longest: number } {
  if (activeDates.length === 0) return { current: 0, longest: 0 };

  const sorted = [...new Set(activeDates)].sort();
  let longest = 1;
  let run = 1;

  for (let i = 1; i < sorted.length; i++) {
    if (isConsecutive(sorted[i - 1], sorted[i])) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const today = toDateKey();
  const yesterday = toDateKey(new Date(Date.now() - 86400000));
  const set = new Set(sorted);

  let current = 0;
  if (set.has(today)) {
    current = 1;
    let cursor = today;
    while (true) {
      const prev = toDateKey(new Date(dateFromKey(cursor).getTime() - 86400000));
      if (set.has(prev)) {
        current += 1;
        cursor = prev;
      } else break;
    }
  } else if (set.has(yesterday)) {
    current = 1;
    let cursor = yesterday;
    while (true) {
      const prev = toDateKey(new Date(dateFromKey(cursor).getTime() - 86400000));
      if (set.has(prev)) {
        current += 1;
        cursor = prev;
      } else break;
    }
  }

  return { current, longest: Math.max(longest, current) };
}

export function registerActiveDay(streak: StreakState): StreakState {
  const today = toDateKey();
  if (streak.activeDates.includes(today)) {
    const { current, longest } = computeStreak(streak.activeDates);
    return { ...streak, current, longest: Math.max(streak.longest, longest), lastActiveDate: today };
  }

  const activeDates = [...streak.activeDates, today];
  const { current, longest } = computeStreak(activeDates);
  return {
    current,
    longest: Math.max(streak.longest, longest),
    lastActiveDate: today,
    activeDates,
  };
}

export function weeklyCompletionPct(activeDates: string[], totalObjectives: number, completedThisWeek: number): number {
  if (totalObjectives === 0) return 0;
  const objectivePct = Math.round((completedThisWeek / totalObjectives) * 100);
  const activeDays = activeDates.filter((d) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return dateFromKey(d) >= start;
  }).length;
  const dayPct = Math.round((activeDays / 7) * 100);
  return Math.min(100, Math.round((objectivePct * 0.7 + dayPct * 0.3)));
}

import type { AscendState, EvolutionLogEntry, LegacyAscendState, UserProfile } from '@/lib/types/ascend';
import { LEGACY_STORAGE_KEY, STORAGE_KEY } from '@/lib/storage/keys';
import { DEFAULT_CATEGORIES, DEFAULT_DASHBOARD_WIDGETS, DEFAULT_PREFERENCES, createInitialState } from '@/data/defaults';
import { getWeekKey } from '@/utils/dates';
import { computeStreak } from '@/utils/streak';
import { recalculateStreak } from '@/utils/evolution';

const MAX_LOG_ENTRIES = 200;

export function loadState(): AscendState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AscendState;
      return hydrateState(parsed);
    }
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      return migrateLegacy(JSON.parse(legacy) as LegacyAscendState);
    }
    return null;
  } catch {
    return null;
  }
}

function migrateLegacy(legacy: LegacyAscendState): AscendState {
  const name = legacy.profile?.name ?? 'Operator';
  const dailyTargetMinutes = (legacy.profile?.dailyStudyGoalHours as number | undefined)
    ? (legacy.profile!.dailyStudyGoalHours as number) * 60
    : 240;
  const profile: UserProfile = {
    name,
    dailyTargetMinutes,
    evolutionFocus: 'Personal evolution path',
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  };
  return createInitialState(profile);
}

export function saveState(state: AscendState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function hydrateState(state: AscendState): AscendState {
  const weekKey = getWeekKey();
  const stored = state as Partial<AscendState>;
  let next: AscendState = {
    ...state,
    version: 2 as const,
    categories: hydrateCategories(stored.categories),
    preferences: { ...DEFAULT_PREFERENCES, ...(stored.preferences ?? {}) },
    dashboardWidgets: hydrateWidgets(stored.dashboardWidgets),
  };

  if (next.weeklyStats.weekKey !== weekKey) {
    next = {
      ...next,
      weeklyStats: { weekKey, activitiesLogged: 0, minutesLogged: 0, evolutionGained: 0 },
    };
  }

  next.streak = recalculateStreak(next);
  next.evolutionLog = trimLog(next.evolutionLog);

  return next;
}

function hydrateCategories(categories?: AscendState['categories']): AscendState['categories'] {
  const incoming = categories ?? [];
  const byId = new Map(incoming.map((c) => [c.id, c]));
  const merged = DEFAULT_CATEGORIES.map((category) => ({
    ...category,
    ...(byId.get(category.id) ?? {}),
  }));
  const custom = incoming.filter((category) => !DEFAULT_CATEGORIES.some((base) => base.id === category.id));
  return [...merged, ...custom]
    .map((category, index) => ({
      ...category,
      active: category.active ?? true,
      order: category.order ?? index,
      createdAt: category.createdAt ?? new Date().toISOString(),
    }))
    .sort((a, b) => a.order - b.order);
}

function hydrateWidgets(widgets?: AscendState['dashboardWidgets']): AscendState['dashboardWidgets'] {
  const incoming = widgets ?? [];
  const byId = new Map(incoming.map((w) => [w.id, w]));
  return DEFAULT_DASHBOARD_WIDGETS.map((widget) => ({
    ...widget,
    ...(byId.get(widget.id) ?? {}),
  })).sort((a, b) => a.order - b.order);
}

export function getDefaultState(): AscendState {
  return createInitialState();
}

export function trimLog(log: EvolutionLogEntry[]): EvolutionLogEntry[] {
  return log.slice(0, MAX_LOG_ENTRIES);
}

export function appendLog(
  log: EvolutionLogEntry[],
  entry: Omit<EvolutionLogEntry, 'id'>
): EvolutionLogEntry[] {
  const item: EvolutionLogEntry = { ...entry, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  return trimLog([item, ...log]);
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

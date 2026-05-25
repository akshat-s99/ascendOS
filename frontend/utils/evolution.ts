import type { Activity, ActivityCategory, AscendState, EvolutionScores } from '@/lib/types/ascend';
import { ACTIVITY_CATEGORIES } from '@/data/defaults';
import { getWeekKey, toDateKey } from '@/utils/dates';
import { computeStreak } from '@/utils/streak';

const PRODUCTIVE = new Set<ActivityCategory>([
  'studying',
  'study',
  'coding',
  'reading',
  'productivity',
  'gym',
  'fitness',
  'content',
  'finance',
  'personal-growth',
]);

const TIER_THRESHOLDS = [0, 500, 1500, 3500, 7000, 12000];
const TIER_LABELS = ['Initiate', 'Adaptive', 'Structured', 'Refined', 'Elevated', 'Transcendent'];

export function categoryLabel(cat: ActivityCategory): string {
  return ACTIVITY_CATEGORIES.find((c) => c.id === cat)?.label ?? cat;
}

export function completedActivities(activities: Activity[]): Activity[] {
  return activities.filter((a) => a.completed);
}

export function activitiesForDate(activities: Activity[], dateKey: string): Activity[] {
  return activities.filter((a) => a.dateKey === dateKey);
}

export function activitiesThisWeek(activities: Activity[]): Activity[] {
  const weekKey = getWeekKey();
  return activities.filter((a) => getWeekKey(new Date(a.loggedAt)) === weekKey && a.completed);
}

export function minutesByCategory(activities: Activity[]): Record<ActivityCategory, number> {
  const map = {} as Record<ActivityCategory, number>;
  for (const cat of ACTIVITY_CATEGORIES) map[cat.id] = 0;
  for (const a of completedActivities(activities)) {
    if (map[a.category] === undefined) map[a.category] = 0;
    map[a.category] += a.durationMinutes;
  }
  return map;
}

export function evolutionPointsForActivity(activity: Activity): number {
  const base = Math.max(5, Math.round(activity.durationMinutes * 0.8));
  const mult = PRODUCTIVE.has(activity.category) ? 1.2 : activity.category === 'sleep' ? 0.6 : 0.5;
  return Math.round(base * mult);
}

function getTierInfo(points: number) {
  let tier = 0;
  for (let i = 1; i < TIER_THRESHOLDS.length; i++) {
    if (points >= TIER_THRESHOLDS[i]) tier = i;
  }
  const base = TIER_THRESHOLDS[tier];
  const next = TIER_THRESHOLDS[tier + 1] ?? TIER_THRESHOLDS[TIER_THRESHOLDS.length - 1] + 5000;
  const pct = Math.min(100, Math.round(((points - base) / (next - base)) * 100));
  return {
    tierLabel: TIER_LABELS[tier] ?? TIER_LABELS[0],
    pointsToNextTier: next - points,
    tierProgressPct: pct,
  };
}

function categoryDiversityScore(byCat: Record<ActivityCategory, number>, total: number): number {
  if (total === 0) return 0;
  const used = Object.values(byCat).filter((v) => v > 0).length;
  const diversity = (used / ACTIVITY_CATEGORIES.length) * 100;
  const maxShare = Math.max(...Object.values(byCat)) / total;
  const balancePenalty = maxShare > 0.65 ? (maxShare - 0.65) * 120 : 0;
  return Math.max(0, Math.min(100, Math.round(diversity - balancePenalty)));
}

export function computeEvolutionScores(state: AscendState): EvolutionScores {
  const weekActs = activitiesThisWeek(state.activities);
  const totalMinutes = weekActs.reduce((s, a) => s + a.durationMinutes, 0);
  const productiveMinutes = weekActs
    .filter((a) => PRODUCTIVE.has(a.category))
    .reduce((s, a) => s + a.durationMinutes, 0);

  const focus =
    totalMinutes > 0 ? Math.min(100, Math.round((productiveMinutes / totalMinutes) * 100)) : 0;

  const completedGoals = state.goals.filter(
    (g) => g.targetValue > 0 && g.currentValue >= g.targetValue
  ).length;
  const avgGoalProgress =
    state.goals.length > 0
      ? state.goals.reduce((s, g) => s + Math.min(100, (g.currentValue / g.targetValue) * 100), 0) /
        state.goals.length
      : 0;

  const discipline = Math.min(
    100,
    Math.round(state.streak.current * 8 + avgGoalProgress * 0.4 + (weekActs.length > 0 ? 25 : 0))
  );

  const byCat = minutesByCategory(weekActs);
  const balance = categoryDiversityScore(byCat, totalMinutes);

  const today = toDateKey();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const activeThisWeek = state.streak.activeDates.filter((d) => {
    const dt = new Date(`${d}T12:00:00`);
    return dt >= weekStart;
  }).length;
  const consistency = Math.min(100, Math.round((activeThisWeek / 7) * 100));

  const growth = Math.min(
    100,
    Math.round(
      state.weeklyStats.evolutionGained / 30 +
        completedGoals * 15 +
        Math.min(40, weekActs.length * 4)
    )
  );

  const evolutionIndex = Math.round(
    focus * 0.22 + discipline * 0.22 + balance * 0.18 + consistency * 0.2 + growth * 0.18
  );

  const tier = getTierInfo(state.evolutionPoints);

  return {
    focus,
    discipline,
    balance,
    consistency,
    growth,
    evolutionIndex,
    evolutionPoints: state.evolutionPoints,
    ...tier,
  };
}

export function recalculateStreak(state: AscendState): AscendState['streak'] {
  const { current, longest } = computeStreak(state.streak.activeDates);
  return { ...state.streak, current, longest: Math.max(state.streak.longest, longest) };
}

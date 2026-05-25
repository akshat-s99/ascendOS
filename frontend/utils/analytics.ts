import type { Activity, ActivityCategory, AscendState, LifeAnalytics } from '@/lib/types/ascend';
import { categoryLabel, completedActivities, minutesByCategory } from '@/utils/evolution';
import { getWeekKey } from '@/utils/dates';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function weekActivities(activities: Activity[]): Activity[] {
  const weekKey = getWeekKey();
  return completedActivities(activities).filter(
    (a) => getWeekKey(new Date(a.loggedAt)) === weekKey
  );
}

export function computeLifeAnalytics(state: AscendState): LifeAnalytics {
  const week = weekActivities(state.activities);
  const byCat = minutesByCategory(week);

  const productiveCategoryIds = state.categories
    .filter((category) => category.group === 'productive')
    .map((category) => category.id);

  const productivityTrend = DAY_LABELS.map((_, dayIndex) => {
    return week
      .filter((a) => new Date(a.loggedAt).getDay() === dayIndex)
      .filter((a) => productiveCategoryIds.includes(a.category))
      .reduce((s, a) => s + a.durationMinutes, 0);
  });

  const topCategoryEntry = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  const topCategory = topCategoryEntry?.[1]
    ? categoryLabel(topCategoryEntry[0] as ActivityCategory)
    : '—';

  const totalMinutes = week.reduce((s, a) => s + a.durationMinutes, 0);
  const productive = week
    .filter((a) => state.categories.find((c) => c.id === a.category)?.group === 'productive')
    .reduce((s, a) => s + a.durationMinutes, 0);
  const leisure = week
    .filter((a) => state.categories.find((c) => c.id === a.category)?.group === 'leisure')
    .reduce((s, a) => s + a.durationMinutes, 0);

  const balanceScore =
    totalMinutes > 0 ? Math.min(100, Math.round(100 - Math.abs(productive - leisure) / 2)) : 50;

  const focusPattern = ['Morning', 'Afternoon', 'Evening', 'Night'].map((label, i) => {
    const hours = [6, 12, 18, 22];
    const start = hours[i];
    const end = i < 3 ? hours[i + 1] : 24;
    const minutes = week
      .filter((a) => {
        const h = new Date(a.loggedAt).getHours();
        return h >= start && h < end;
      })
      .reduce((s, a) => s + a.durationMinutes, 0);
    return { label, minutes };
  });

  const categoryBreakdown = state.categories
    .map((category) => ({
      id: category.id,
      label: category.label,
      minutes: byCat[category.id] ?? 0,
      color: category.color,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  const today = new Date();
  const heatmap = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (27 - index));
    const dateKey = date.toISOString().slice(0, 10);
    const minutes = completedActivities(state.activities)
      .filter((activity) => activity.dateKey === dateKey)
      .reduce((sum, activity) => sum + activity.durationMinutes, 0);
    return {
      dateKey,
      minutes,
      intensity: minutes === 0 ? 0 : Math.min(4, Math.ceil(minutes / 60)),
    };
  });

  return {
    productivityTrend,
    sleepMinutesThisWeek: byCat.sleep ?? 0,
    codingMinutesThisWeek: byCat.coding ?? 0,
    gamingMinutesThisWeek: byCat.gaming ?? 0,
    studyMinutesThisWeek: (byCat.studying ?? 0) + (byCat.reading ?? 0) + (byCat.study ?? 0),
    balanceScore,
    focusPattern,
    categoryBreakdown,
    heatmap,
    weeklySummary: {
      totalMinutes,
      activitiesCount: week.length,
      topCategory,
      evolutionGained: state.weeklyStats.evolutionGained,
    },
  };
}

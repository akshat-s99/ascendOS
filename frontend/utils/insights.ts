import type { AscendState, SystemInsight } from '@/lib/types/ascend';
import { computeEvolutionScores, activitiesThisWeek } from '@/utils/evolution';
import { computeLifeAnalytics } from '@/utils/analytics';

export function generateInsights(state: AscendState): SystemInsight[] {
  const scores = computeEvolutionScores(state);
  const analytics = computeLifeAnalytics(state);
  const insights: SystemInsight[] = [];
  const weekCount = activitiesThisWeek(state.activities).length;

  if (state.activities.length === 0) {
    insights.push({
      id: 'start',
      message: 'System idle. Log your first activity to begin evolution tracking.',
    });
    return insights;
  }

  if (scores.consistency >= 70) {
    insights.push({
      id: 'consistency',
      message: `Consistency at ${scores.consistency}% — rhythm is stabilizing across the week.`,
    });
  } else if (weekCount > 0) {
    insights.push({
      id: 'consistency-low',
      message: 'Logging gaps detected. A single completed activity today will reinforce your streak.',
    });
  }

  const peak = analytics.focusPattern.reduce(
    (best, p) => (p.minutes > best.minutes ? p : best),
    analytics.focusPattern[0]
  );
  if (peak.minutes > 0) {
    insights.push({
      id: 'peak',
      message: `Peak activity window: ${peak.label.toLowerCase()} sessions (${peak.minutes} min this week).`,
    });
  }

  if (analytics.balanceScore >= 65) {
    insights.push({
      id: 'balance',
      message: `Life balance index at ${analytics.balanceScore}% — productive and leisure time are aligned.`,
    });
  } else if (analytics.gamingMinutesThisWeek > analytics.studyMinutesThisWeek) {
    insights.push({
      id: 'balance-shift',
      message: 'Gaming time exceeds study time this week. Consider rebalancing tomorrow.',
    });
  }

  if (scores.growth >= 60) {
    insights.push({
      id: 'growth',
      message: `Growth trajectory positive — evolution index ${scores.evolutionIndex}.`,
    });
  }

  if (state.goals.length === 0) {
    insights.push({
      id: 'goals',
      message: 'No active goals defined. Create a personal goal to give the engine a target.',
    });
  }

  return insights.slice(0, 4);
}

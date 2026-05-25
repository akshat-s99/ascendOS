'use client';

import { useEffect, useState } from 'react';
import { createInitialState } from '@/data/defaults';
import {
  appendLog,
  getDefaultState,
  hydrateState,
  loadState,
  newId,
  saveState,
} from '@/lib/storage/persist';
import type {
  Activity,
  AscendState,
  EvolutionScores,
  Goal,
  LifeCategory,
  UserPreferences,
  UserProfile,
} from '@/lib/types/ascend';
import { computeLifeAnalytics } from '@/utils/analytics';
import { generateInsights } from '@/utils/insights';
import {
  computeEvolutionScores,
  evolutionPointsForActivity,
  recalculateStreak,
} from '@/utils/evolution';
import { registerActiveDay } from '@/utils/streak';
import { toDateKey } from '@/utils/dates';

function unlockMilestones(state: AscendState, scores: EvolutionScores): AscendState {
  const milestones = state.milestones.map((m) => ({ ...m }));
  let evolutionLog = state.evolutionLog;

  const unlock = (id: string, title: string) => {
    const m = milestones.find((x) => x.id === id);
    if (m && !m.unlocked) {
      m.unlocked = true;
      m.unlockedAt = new Date().toISOString();
      evolutionLog = appendLog(evolutionLog, {
        type: 'milestone',
        title: `Milestone: ${title}`,
        timestamp: new Date().toISOString(),
        dateKey: toDateKey(),
      });
    }
  };

  if (state.activities.length >= 1) unlock('m-1', 'First Signal');
  if (state.streak.current >= 7) unlock('m-2', 'Rhythm Found');
  if (state.activities.filter((a) => a.completed).length >= 10) unlock('m-3', 'Pattern Stable');
  if (scores.balance >= 60 && scores.focus >= 50) unlock('m-4', 'Balanced State');
  if (state.evolutionPoints >= 3500) unlock('m-5', 'Evolution Surge');
  if (scores.evolutionIndex >= 85) unlock('m-6', 'Transcendent');

  return { ...state, milestones, evolutionLog };
}

function applyActivityComplete(state: AscendState, activity: Activity, completing: boolean): AscendState {
  const points = evolutionPointsForActivity(activity);
  let evolutionPoints = state.evolutionPoints;
  let weeklyStats = { ...state.weeklyStats };
  let streak = { ...state.streak };
  let evolutionLog = state.evolutionLog;

  if (completing) {
    evolutionPoints += points;
    weeklyStats = {
      ...weeklyStats,
      activitiesLogged: weeklyStats.activitiesLogged + 1,
      minutesLogged: weeklyStats.minutesLogged + activity.durationMinutes,
      evolutionGained: weeklyStats.evolutionGained + points,
    };
    streak = registerActiveDay(streak);
    evolutionLog = appendLog(evolutionLog, {
      type: 'activity',
      title: activity.title,
      detail: `${activity.durationMinutes}m · ${activity.category}`,
      timestamp: new Date().toISOString(),
      dateKey: activity.dateKey,
    });
  } else {
    evolutionPoints = Math.max(0, evolutionPoints - points);
    weeklyStats = {
      ...weeklyStats,
      activitiesLogged: Math.max(0, weeklyStats.activitiesLogged - 1),
      minutesLogged: Math.max(0, weeklyStats.minutesLogged - activity.durationMinutes),
      evolutionGained: Math.max(0, weeklyStats.evolutionGained - points),
    };
  }

  streak = recalculateStreak({ ...state, streak });

  let next: AscendState = {
    ...state,
    evolutionPoints,
    weeklyStats,
    streak,
    evolutionLog,
  };
  const scores = computeEvolutionScores(next);
  next = unlockMilestones(next, scores);
  return next;
}

export function useAscend() {
  const [state, setState] = useState<AscendState>(getDefaultState);
  const [ready, setReady] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadState();
    setState(stored ? hydrateState(stored) : getDefaultState());
    setReady(true);
  }, []);

  // Save to localStorage on every state change, guarded by ready
  useEffect(() => {
    if (!ready) return;
    saveState(state);
  }, [state, ready]);

  function logActivity(payload: Omit<Activity, 'id' | 'loggedAt' | 'dateKey'>) {
    setState(prev => {
      const now = new Date().toISOString();
      const dateKey = toDateKey();
      const activity: Activity = { ...payload, id: newId('act'), loggedAt: now, dateKey };
      let next: AscendState = { ...prev, activities: [activity, ...prev.activities] };
      if (activity.completed) {
        next = applyActivityComplete(next, activity, true);
      }
      return next;
    });
  }

  function toggleActivity(id: string) {
    setState(prev => {
      const activity = prev.activities.find(a => a.id === id);
      if (!activity) return prev;
      const completing = !activity.completed;
      const activities = prev.activities.map(a => a.id === id ? { ...a, completed: completing } : a);
      return applyActivityComplete({ ...prev, activities }, { ...activity, completed: completing }, completing);
    });
  }

  function deleteActivity(id: string) {
    setState(prev => {
      const activity = prev.activities.find(a => a.id === id);
      let next = { ...prev, activities: prev.activities.filter(a => a.id !== id) };
      if (activity?.completed) {
        next = applyActivityComplete(next, activity, false);
      }
      return next;
    });
  }

  function addGoal(payload: Omit<Goal, 'id' | 'createdAt' | 'currentValue'>) {
    setState(prev => {
      const goal: Goal = { ...payload, id: newId('goal'), createdAt: new Date().toISOString(), currentValue: 0 };
      return {
        ...prev,
        goals: [goal, ...prev.goals],
        evolutionLog: appendLog(prev.evolutionLog, {
          type: 'goal',
          title: `Goal created: ${goal.title}`,
          detail: goal.period,
          timestamp: new Date().toISOString(),
          dateKey: toDateKey(),
        }),
      };
    });
  }

  function updateGoal(goal: Goal) {
    setState(prev => {
      const prevGoal = prev.goals.find(g => g.id === goal.id);
      const goals = prev.goals.map(g => g.id === goal.id ? goal : g);
      let evolutionLog = prev.evolutionLog;
      if (prevGoal && prevGoal.currentValue < prevGoal.targetValue && goal.currentValue >= goal.targetValue) {
        evolutionLog = appendLog(evolutionLog, {
          type: 'goal',
          title: `Goal reached: ${goal.title}`,
          timestamp: new Date().toISOString(),
          dateKey: toDateKey(),
        });
      }
      return { ...prev, goals, evolutionLog };
    });
  }

  function deleteGoal(id: string) {
    setState(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
  }

  function addCategory(payload: Omit<LifeCategory, 'id' | 'order' | 'createdAt' | 'active'> & { id?: string }) {
    setState(prev => {
      const id = payload.id ?? payload.label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      if (!id || prev.categories.some((category) => category.id === id)) return prev;
      const category: LifeCategory = {
        ...payload,
        id,
        active: true,
        order: prev.categories.length,
        createdAt: new Date().toISOString(),
      };
      return { ...prev, categories: [...prev.categories, category] };
    });
  }

  function updateCategory(category: LifeCategory) {
    setState(prev => ({
      ...prev,
      categories: prev.categories
        .map((item) => (item.id === category.id ? category : item))
        .sort((a, b) => a.order - b.order),
    }));
  }

  function deleteCategory(id: string) {
    setState(prev => ({
      ...prev,
      categories: prev.categories.filter((category) => category.id !== id),
    }));
  }

  function moveCategory(id: string, direction: -1 | 1) {
    setState(prev => {
      const categories = [...prev.categories].sort((a, b) => a.order - b.order);
      const index = categories.findIndex((category) => category.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= categories.length) return prev;
      const [item] = categories.splice(index, 1);
      categories.splice(targetIndex, 0, item);
      return {
        ...prev,
        categories: categories.map((category, order) => ({ ...category, order })),
      };
    });
  }

  function updatePreferences(preferences: Partial<UserPreferences>) {
    setState(prev => ({ ...prev, preferences: { ...prev.preferences, ...preferences } }));
  }

  function toggleWidget(id: string) {
    setState(prev => ({
      ...prev,
      dashboardWidgets: prev.dashboardWidgets.map((widget) =>
        widget.id === id ? { ...widget, visible: !widget.visible } : widget
      ),
    }));
  }

  function moveDashboardWidget(id: string, direction: -1 | 1) {
    setState(prev => {
      const widgets = [...prev.dashboardWidgets].sort((a, b) => a.order - b.order);
      const index = widgets.findIndex((widget) => widget.id === id);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= widgets.length) return prev;
      const [item] = widgets.splice(index, 1);
      widgets.splice(targetIndex, 0, item);
      return {
        ...prev,
        dashboardWidgets: widgets.map((widget, order) => ({ ...widget, order })),
      };
    });
  }

  function reorderActivities(sourceId: string, targetId: string) {
    if (sourceId === targetId) return;
    setState(prev => {
      const activities = [...prev.activities];
      const sourceIndex = activities.findIndex((activity) => activity.id === sourceId);
      const targetIndex = activities.findIndex((activity) => activity.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return prev;
      const [item] = activities.splice(sourceIndex, 1);
      activities.splice(targetIndex, 0, item);
      return { ...prev, activities };
    });
  }

  function completeOnboarding(profile: UserProfile) {
    setState(createInitialState({ ...profile, onboardingComplete: true }));
  }

  function updateProfile(profile: UserProfile) {
    setState(prev => hydrateState({ ...prev, profile }));
  }

  function resetAll() {
    setState(getDefaultState());
  }

  // Derived values — plain calls, no useMemo
  const scores = computeEvolutionScores(state);
  const analytics = computeLifeAnalytics(state);
  const insights = generateInsights(state);

  return {
    state,
    ready,
    scores,
    analytics,
    insights,
    logActivity,
    toggleActivity,
    deleteActivity,
    addGoal,
    updateGoal,
    deleteGoal,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    updatePreferences,
    toggleWidget,
    moveDashboardWidget,
    reorderActivities,
    completeOnboarding,
    updateProfile,
    resetAll,
  };
}

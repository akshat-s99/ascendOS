import type {
  AscendState,
  DashboardWidget,
  LifeCategory,
  Milestone,
  UserPreferences,
  UserProfile,
} from '@/lib/types/ascend';
import { getWeekKey } from '@/utils/dates';

export const DEFAULT_CATEGORIES: LifeCategory[] = [
  {
    id: 'coding',
    label: 'Coding',
    group: 'productive',
    color: '#2f80ed',
    icon: 'Code2',
    description: 'Engineering, problem solving, and systems work.',
    active: true,
    order: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'gym',
    label: 'Fitness',
    group: 'productive',
    color: '#1f9d72',
    icon: 'Activity',
    description: 'Training, movement, recovery, and body metrics.',
    active: true,
    order: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'studying',
    label: 'Study',
    group: 'productive',
    color: '#7c6cf2',
    icon: 'BookOpen',
    description: 'Learning blocks, courses, reading, and research.',
    active: true,
    order: 2,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'content',
    label: 'Content Creation',
    group: 'productive',
    color: '#c95f8f',
    icon: 'Clapperboard',
    description: 'Editing, publishing, writing, and creative output.',
    active: true,
    order: 3,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'sleep',
    label: 'Sleep',
    group: 'rest',
    color: '#4f6fa8',
    icon: 'Moon',
    description: 'Sleep quality, rest windows, and recharge rituals.',
    active: true,
    order: 4,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'reading',
    label: 'Reading',
    group: 'productive',
    color: '#6e7bd9',
    icon: 'Library',
    description: 'Books, notes, research, and long-form learning.',
    active: true,
    order: 5,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'gaming',
    label: 'Gaming',
    group: 'leisure',
    color: '#d1843f',
    icon: 'Gamepad2',
    description: 'Intentional entertainment, decompression, and play.',
    active: true,
    order: 6,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'productivity',
    label: 'Personal Growth',
    group: 'productive',
    color: '#2f9db3',
    icon: 'Sparkles',
    description: 'Reflection, planning, habits, and self-mastery.',
    active: true,
    order: 7,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'finance',
    label: 'Finance',
    group: 'productive',
    color: '#b38b2e',
    icon: 'Wallet',
    description: 'Budget reviews, investing, income, and planning.',
    active: true,
    order: 8,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'social',
    label: 'Social',
    group: 'leisure',
    color: '#b76a76',
    icon: 'Users',
    description: 'Community, messages, and social windows.',
    active: true,
    order: 9,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    group: 'leisure',
    color: '#94764d',
    icon: 'Film',
    description: 'Shows, music, and intentional downtime.',
    active: true,
    order: 10,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const ACTIVITY_CATEGORIES = DEFAULT_CATEGORIES;

export const GOAL_UNITS = ['hours', 'sessions', 'days', 'count', '%'];

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  density: 'calm',
  motion: 'full',
  productivityStyle: 'balanced',
  defaultActivityMinutes: 45,
  notificationsEnabled: true,
};

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidget[] = [
  { id: 'mission-control', title: 'Mission Control', visible: true, size: 'lg', order: 0 },
  { id: 'category-balance', title: 'Category Balance', visible: true, size: 'md', order: 1 },
  { id: 'focus-rhythm', title: 'Focus Rhythm', visible: true, size: 'md', order: 2 },
  { id: 'activity-snapshot', title: 'Activity Snapshot', visible: true, size: 'md', order: 3 },
  { id: 'evolution-graph', title: 'Evolution Graph', visible: true, size: 'lg', order: 4 },
  { id: 'insights', title: 'Insights', visible: true, size: 'md', order: 5 },
];

export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm-1', title: 'First Signal', unlocked: false },
  { id: 'm-2', title: 'Rhythm Found', unlocked: false },
  { id: 'm-3', title: 'Pattern Stable', unlocked: false },
  { id: 'm-4', title: 'Balanced State', unlocked: false },
  { id: 'm-5', title: 'Evolution Surge', unlocked: false },
  { id: 'm-6', title: 'Transcendent', unlocked: false },
];

export function createInitialState(profile?: UserProfile): AscendState {
  return {
    version: 2,
    profile: profile ?? null,
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    preferences: { ...DEFAULT_PREFERENCES },
    dashboardWidgets: DEFAULT_DASHBOARD_WIDGETS.map((w) => ({ ...w })),
    evolutionPoints: 0,
    activities: [],
    goals: [],
    streak: { current: 0, longest: 0, lastActiveDate: null, activeDates: [] },
    milestones: DEFAULT_MILESTONES.map((m) => ({ ...m })),
    evolutionLog: [],
    weeklyStats: {
      weekKey: getWeekKey(),
      activitiesLogged: 0,
      minutesLogged: 0,
      evolutionGained: 0,
    },
  };
}

export const EVOLUTION_FOCUS_SUGGESTIONS = [
  'Build discipline across work and rest',
  'Balance coding with physical health',
  'Reduce distraction, increase deep focus',
  'Grow consistently without burnout',
  'Custom path — define as you evolve',
];

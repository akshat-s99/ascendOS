export type ActivityCategory = string;
export type CategoryGroup = 'productive' | 'rest' | 'leisure';
export type ThemePreference = 'deep-midnight' | 'aurora-blue' | 'crimson-gradient' | 'arctic-light' | 'system';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface UserProfile {
  name: string;
  evolutionFocus?: string;
  dailyTargetMinutes: number;
  onboardingComplete: boolean;
  createdAt: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  focusWindow?: string;
  lifestyleCategories?: string[];
}

export interface LifeCategory {
  id: ActivityCategory;
  label: string;
  group: CategoryGroup;
  color: string;
  icon: string;
  description?: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface UserPreferences {
  theme: ThemePreference;
  density: 'calm' | 'compact';
  motion: 'full' | 'reduced';
  productivityStyle: 'deep-work' | 'balanced' | 'recovery-first';
  defaultActivityMinutes: number;
  notificationsEnabled: boolean;
}

export interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  size: 'sm' | 'md' | 'lg';
  order: number;
}

export interface Activity {
  id: string;
  title: string;
  category: ActivityCategory;
  durationMinutes: number;
  notes?: string;
  completed: boolean;
  loggedAt: string;
  dateKey: string;
}

export interface Goal {
  id: string;
  title: string;
  period: GoalPeriod;
  targetValue: number;
  currentValue: number;
  unit: string;
  createdAt: string;
  deadline?: string;
}

export interface Milestone {
  id: string;
  title: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StreakState {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  activeDates: string[];
}

export interface WeeklyStats {
  weekKey: string;
  activitiesLogged: number;
  minutesLogged: number;
  evolutionGained: number;
}

export interface EvolutionLogEntry {
  id: string;
  type: 'activity' | 'milestone' | 'evolution' | 'goal';
  title: string;
  detail?: string;
  timestamp: string;
  dateKey: string;
}

export interface EvolutionScores {
  focus: number;
  discipline: number;
  balance: number;
  consistency: number;
  growth: number;
  evolutionIndex: number;
  tierLabel: string;
  evolutionPoints: number;
  pointsToNextTier: number;
  tierProgressPct: number;
}

export interface LifeAnalytics {
  productivityTrend: number[];
  sleepMinutesThisWeek: number;
  codingMinutesThisWeek: number;
  gamingMinutesThisWeek: number;
  studyMinutesThisWeek: number;
  balanceScore: number;
  focusPattern: { label: string; minutes: number }[];
  categoryBreakdown: { id: string; label: string; minutes: number; color: string }[];
  heatmap: { dateKey: string; minutes: number; intensity: number }[];
  weeklySummary: {
    totalMinutes: number;
    activitiesCount: number;
    topCategory: string;
    evolutionGained: number;
  };
}

export interface SystemInsight {
  id: string;
  message: string;
}

export interface AscendState {
  version: 2;
  profile: UserProfile | null;
  categories: LifeCategory[];
  preferences: UserPreferences;
  dashboardWidgets: DashboardWidget[];
  evolutionPoints: number;
  activities: Activity[];
  goals: Goal[];
  streak: StreakState;
  milestones: Milestone[];
  evolutionLog: EvolutionLogEntry[];
  weeklyStats: WeeklyStats;
}

/** @deprecated v1 shape — used only for migration */
export interface LegacyAscendState {
  version?: number;
  profile?: { name?: string; dailyStudyGoalHours?: number; [key: string]: unknown };
  [key: string]: unknown;
}

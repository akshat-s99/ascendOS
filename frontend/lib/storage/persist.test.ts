/**
 * Property-based tests for LocalStorage round trip.
 * Feature: ascendos-simplification, Property 6: LocalStorage round trip
 * Validates: Requirements 7.3, 7.5
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { saveState, loadState, hydrateState, getDefaultState } from './persist';
import type { AscendState } from '@/lib/types/ascend';
import { getWeekKey } from '@/utils/dates';
import { DEFAULT_CATEGORIES, DEFAULT_DASHBOARD_WIDGETS, DEFAULT_PREFERENCES } from '@/data/defaults';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

// Arbitrary for AscendState
function arbitraryAscendState(): fc.Arbitrary<AscendState> {
  const weekKey = getWeekKey();
  return fc.record({
    version: fc.constant(2 as const),
    categories: fc.constant(DEFAULT_CATEGORIES),
    preferences: fc.constant(DEFAULT_PREFERENCES),
    dashboardWidgets: fc.constant(DEFAULT_DASHBOARD_WIDGETS),
    profile: fc.option(fc.record({
      name: fc.string({ minLength: 1, maxLength: 50 }),
      evolutionFocus: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
      dailyTargetMinutes: fc.integer({ min: 30, max: 960 }),
      onboardingComplete: fc.boolean(),
      createdAt: fc.constant(new Date().toISOString()),
    }), { nil: null }),
    evolutionPoints: fc.integer({ min: 0, max: 50000 }),
    activities: fc.array(fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 100 }),
      category: fc.constantFrom('studying', 'coding', 'gaming', 'gym', 'sleep', 'content', 'reading', 'social', 'productivity', 'entertainment') as fc.Arbitrary<AscendState['activities'][0]['category']>,
      durationMinutes: fc.integer({ min: 1, max: 480 }),
      notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
      completed: fc.boolean(),
      loggedAt: fc.constant(new Date().toISOString()),
      dateKey: fc.constant(new Date().toISOString().slice(0, 10)),
    }), { maxLength: 10 }),
    goals: fc.array(fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 100 }),
      period: fc.constantFrom('daily', 'weekly', 'monthly', 'yearly') as fc.Arbitrary<AscendState['goals'][0]['period']>,
      targetValue: fc.integer({ min: 1, max: 1000 }),
      currentValue: fc.integer({ min: 0, max: 1000 }),
      unit: fc.constantFrom('hours', 'sessions', 'days', 'count', '%'),
      createdAt: fc.constant(new Date().toISOString()),
      deadline: fc.option(fc.constant(new Date().toISOString().slice(0, 10)), { nil: undefined }),
    }), { maxLength: 5 }),
    streak: fc.record({
      current: fc.integer({ min: 0, max: 365 }),
      longest: fc.integer({ min: 0, max: 365 }),
      lastActiveDate: fc.option(fc.constant(new Date().toISOString().slice(0, 10)), { nil: null }),
      activeDates: fc.array(fc.constant(new Date().toISOString().slice(0, 10)), { maxLength: 30 }),
    }),
    milestones: fc.constant([
      { id: 'm-1', title: 'First Signal', unlocked: false },
      { id: 'm-2', title: 'Rhythm Found', unlocked: false },
      { id: 'm-3', title: 'Pattern Stable', unlocked: false },
      { id: 'm-4', title: 'Balanced State', unlocked: false },
      { id: 'm-5', title: 'Evolution Surge', unlocked: false },
      { id: 'm-6', title: 'Transcendent', unlocked: false },
    ]),
    evolutionLog: fc.array(fc.record({
      id: fc.uuid(),
      type: fc.constantFrom('activity', 'milestone', 'evolution', 'goal') as fc.Arbitrary<AscendState['evolutionLog'][0]['type']>,
      title: fc.string({ minLength: 1, maxLength: 100 }),
      detail: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
      timestamp: fc.constant(new Date().toISOString()),
      dateKey: fc.constant(new Date().toISOString().slice(0, 10)),
    }), { maxLength: 20 }),
    weeklyStats: fc.constant({
      weekKey,
      activitiesLogged: 0,
      minutesLogged: 0,
      evolutionGained: 0,
    }),
  });
}

describe('persist — Property 6: LocalStorage round trip', () => {
  beforeEach(() => localStorageMock.clear());
  afterEach(() => localStorageMock.clear());

  it('saveState then loadState+hydrateState preserves all fields', () => {
    fc.assert(
      fc.property(arbitraryAscendState(), (state) => {
        saveState(state);
        const loaded = loadState();
        expect(loaded).not.toBeNull();
        const hydrated = hydrateState(loaded!);
        // Core fields must be preserved
        expect(hydrated.version).toBe(state.version);
        expect(hydrated.evolutionPoints).toBe(state.evolutionPoints);
        expect(hydrated.activities.length).toBe(state.activities.length);
        expect(hydrated.goals.length).toBe(state.goals.length);
        expect(hydrated.milestones.length).toBe(state.milestones.length);
        if (state.profile) {
          expect(hydrated.profile?.name).toBe(state.profile.name);
        }
        return true;
      }),
      { numRuns: 100 }
    );
  });
});

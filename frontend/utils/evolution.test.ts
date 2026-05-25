/**
 * Property-based tests for evolution score bounds.
 * Feature: ascendos-simplification, Property 10: Evolution scores are bounded
 * Validates: Requirements 4.1, 4.2
 */
import { describe, it } from 'vitest';
import * as fc from 'fast-check';
import { computeEvolutionScores } from './evolution';
import type { AscendState } from '@/lib/types/ascend';
import { getWeekKey } from '@/utils/dates';
import { DEFAULT_CATEGORIES, DEFAULT_DASHBOARD_WIDGETS, DEFAULT_PREFERENCES } from '@/data/defaults';

function arbitraryAscendState(): fc.Arbitrary<AscendState> {
  const weekKey = getWeekKey();
  return fc.record({
    version: fc.constant(2 as const),
    categories: fc.constant(DEFAULT_CATEGORIES),
    preferences: fc.constant(DEFAULT_PREFERENCES),
    dashboardWidgets: fc.constant(DEFAULT_DASHBOARD_WIDGETS),
    profile: fc.constant(null),
    evolutionPoints: fc.integer({ min: 0, max: 50000 }),
    activities: fc.array(fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      category: fc.constantFrom('studying', 'coding', 'gaming', 'gym', 'sleep', 'content', 'reading', 'social', 'productivity', 'entertainment') as fc.Arbitrary<AscendState['activities'][0]['category']>,
      durationMinutes: fc.integer({ min: 1, max: 480 }),
      notes: fc.constant(undefined),
      completed: fc.boolean(),
      loggedAt: fc.constant(new Date().toISOString()),
      dateKey: fc.constant(new Date().toISOString().slice(0, 10)),
    }), { maxLength: 20 }),
    goals: fc.array(fc.record({
      id: fc.uuid(),
      title: fc.string({ minLength: 1, maxLength: 50 }),
      period: fc.constantFrom('daily', 'weekly', 'monthly', 'yearly') as fc.Arbitrary<AscendState['goals'][0]['period']>,
      targetValue: fc.integer({ min: 1, max: 1000 }),
      currentValue: fc.integer({ min: 0, max: 1000 }),
      unit: fc.constant('hours'),
      createdAt: fc.constant(new Date().toISOString()),
      deadline: fc.constant(undefined),
    }), { maxLength: 5 }),
    streak: fc.record({
      current: fc.integer({ min: 0, max: 365 }),
      longest: fc.integer({ min: 0, max: 365 }),
      lastActiveDate: fc.constant(null),
      activeDates: fc.array(fc.constant(new Date().toISOString().slice(0, 10)), { maxLength: 30 }),
    }),
    milestones: fc.constant([]),
    evolutionLog: fc.constant([]),
    weeklyStats: fc.record({
      weekKey: fc.constant(weekKey),
      activitiesLogged: fc.integer({ min: 0, max: 100 }),
      minutesLogged: fc.integer({ min: 0, max: 10000 }),
      evolutionGained: fc.integer({ min: 0, max: 50000 }),
    }),
  });
}

describe('evolution — Property 10: Evolution scores are bounded', () => {
  it('all score fields are in [0, 100] for any AscendState', () => {
    fc.assert(
      fc.property(arbitraryAscendState(), (state) => {
        const scores = computeEvolutionScores(state);
        const inRange = (v: number) => v >= 0 && v <= 100;
        return (
          inRange(scores.focus) &&
          inRange(scores.discipline) &&
          inRange(scores.balance) &&
          inRange(scores.consistency) &&
          inRange(scores.growth) &&
          inRange(scores.evolutionIndex)
        );
      }),
      { numRuns: 100 }
    );
  });
});

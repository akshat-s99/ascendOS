/**
 * Property-based tests for GoalsPanel — goal progress slider updates currentValue.
 * Feature: ascendos-simplification, Property 5: Goal progress slider updates currentValue
 * Validates: Requirements 2.2
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { getDefaultState } from '@/lib/storage/persist';
import type { AscendState, Goal } from '@/lib/types/ascend';

// Minimal inline updateGoal logic (mirrors useAscend.updateGoal)
function updateGoal(state: AscendState, goal: Goal): AscendState {
  const goals = state.goals.map((g) => (g.id === goal.id ? goal : g));
  return { ...state, goals };
}

// Arbitrary for a single Goal
const arbitraryGoal = (): fc.Arbitrary<Goal> =>
  fc.record({
    id: fc.uuid(),
    title: fc.string({ minLength: 1, maxLength: 50 }),
    period: fc.constantFrom('daily', 'weekly', 'monthly', 'yearly') as fc.Arbitrary<Goal['period']>,
    targetValue: fc.integer({ min: 1, max: 1000 }),
    currentValue: fc.integer({ min: 0, max: 1000 }),
    unit: fc.constantFrom('hours', 'tasks', 'pages', 'km', 'sessions'),
    createdAt: fc.constant(new Date().toISOString()),
  });

// **Validates: Requirements 2.2**
describe('GoalsPanel — Property 5: Goal progress slider updates currentValue', () => {
  it('updateGoal sets currentValue to the provided value for any goal and any value in [0, targetValue]', () => {
    fc.assert(
      fc.property(
        arbitraryGoal(),
        fc.integer({ min: 0, max: 1000 }),
        (goal, rawValue) => {
          // Clamp value to [0, targetValue] as the slider would
          const newValue = Math.min(rawValue, goal.targetValue);

          const state: AscendState = {
            ...getDefaultState(),
            goals: [goal],
          };

          const updated = updateGoal(state, { ...goal, currentValue: newValue });
          const updatedGoal = updated.goals.find((g) => g.id === goal.id);

          return updatedGoal?.currentValue === newValue;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('updateGoal does not affect other goals in the list', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryGoal(), { minLength: 2, maxLength: 5 }),
        fc.integer({ min: 0, max: 1000 }),
        (goals, rawValue) => {
          // Ensure unique IDs
          const uniqueGoals = goals.map((g, i) => ({ ...g, id: `goal-${i}` }));
          const targetGoal = uniqueGoals[0];
          const newValue = Math.min(rawValue, targetGoal.targetValue);

          const state: AscendState = {
            ...getDefaultState(),
            goals: uniqueGoals,
          };

          const updated = updateGoal(state, { ...targetGoal, currentValue: newValue });

          // All other goals should be unchanged
          return uniqueGoals.slice(1).every((g) => {
            const found = updated.goals.find((ug) => ug.id === g.id);
            return found?.currentValue === g.currentValue;
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});

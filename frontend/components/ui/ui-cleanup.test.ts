/**
 * Static analysis test: only 4 ui files remain.
 * Feature: ascendos-simplification
 * Validates: Requirements 11.1
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const UI_DIR = path.resolve(__dirname);
const EXPECTED_FILES = new Set(['button.tsx', 'input.tsx', 'label.tsx', 'textarea.tsx']);

describe('components/ui — only 4 files remain', () => {
  it('contains exactly button.tsx, input.tsx, label.tsx, textarea.tsx', () => {
    const entries = fs.readdirSync(UI_DIR).filter((f) => {
      // Exclude test files themselves
      return !f.endsWith('.test.ts') && !f.endsWith('.test.tsx');
    });

    const fileSet = new Set(entries);

    // Every file present must be in the expected set
    for (const file of fileSet) {
      expect(EXPECTED_FILES.has(file), `Unexpected file found: ${file}`).toBe(true);
    }

    // Every expected file must be present
    for (const expected of EXPECTED_FILES) {
      expect(fileSet.has(expected), `Expected file missing: ${expected}`).toBe(true);
    }

    // Exactly 4 files
    expect(entries.length).toBe(4);
  });
});

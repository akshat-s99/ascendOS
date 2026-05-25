/**
 * Static analysis tests.
 * Property 8: No framer-motion imports anywhere
 * Property 9: Panel components do not call useAscend
 * Validates: Requirements 9.1, 12.3
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

function getAllTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      results.push(...getAllTsFiles(fullPath));
    } else if (
      entry.isFile() &&
      (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.test.tsx')
    ) {
      results.push(fullPath);
    }
  }
  return results;
}

const FRONTEND_DIR = path.resolve(__dirname);

describe('Static analysis — Property 8: No framer-motion imports', () => {
  it('no .ts/.tsx file imports from framer-motion', () => {
    const files = getAllTsFiles(FRONTEND_DIR);
    const violations: string[] = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      if (content.includes("from 'framer-motion'") || content.includes('from "framer-motion"')) {
        violations.push(path.relative(FRONTEND_DIR, file));
      }
    }
    expect(violations, `Files importing framer-motion: ${violations.join(', ')}`).toHaveLength(0);
  });
});

describe('Static analysis — Property 9: Panel components do not call useAscend', () => {
  const PANEL_FILES = [
    'components/dashboard/SystemStatus.tsx',
    'components/dashboard/EvolutionProgress.tsx',
    'components/dashboard/ActivityLogger.tsx',
    'components/dashboard/GoalsPanel.tsx',
    'components/dashboard/StreakPanel.tsx',
    'components/dashboard/DailyEvolutionLog.tsx',
    'components/dashboard/LifeAnalyticsPanel.tsx',
    'components/dashboard/SystemInsights.tsx',
    'components/dashboard/MilestonesPanel.tsx',
  ];

  it('no panel component calls useAscend()', () => {
    const violations: string[] = [];
    for (const relPath of PANEL_FILES) {
      const fullPath = path.join(FRONTEND_DIR, relPath);
      if (!fs.existsSync(fullPath)) continue;
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('useAscend()')) {
        violations.push(relPath);
      }
    }
    expect(violations, `Panels calling useAscend(): ${violations.join(', ')}`).toHaveLength(0);
  });
});

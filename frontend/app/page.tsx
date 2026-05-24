'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SystemStatus from '@/components/dashboard/SystemStatus';
import ExpProgressBar from '@/components/dashboard/ExpProgressBar';
import DailyObjectives from '@/components/dashboard/DailyObjectives';
import EvolutionMetrics from '@/components/dashboard/EvolutionMetrics';
import PriorityObjective from '@/components/dashboard/PriorityObjective';
import AchievementArchive from '@/components/dashboard/AchievementArchive';
import { APP_NAME, APP_TAGLINE } from '@/lib/constants/branding';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b border-border bg-background"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <p className="section-label mb-2">// {APP_NAME.toUpperCase()}</p>
              <h1 className="text-sm font-mono font-medium text-foreground tracking-wide">
                {APP_NAME}
              </h1>
              <p className="section-subtitle">{APP_TAGLINE}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 shrink-0"
            >
              <div className="hidden sm:block text-right text-xs font-mono">
                <p className="text-muted-foreground">Status:</p>
                <p className="text-primary">OPERATIONAL</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary soft-pulse" />
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.div
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <SystemStatus />
          <div className="lg:col-span-2">
            <ExpProgressBar />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <PriorityObjective />
          <DailyObjectives />
        </div>

        <EvolutionMetrics />

        <div className="mt-6">
          <AchievementArchive />
        </div>
      </motion.div>
    </main>
  );
}

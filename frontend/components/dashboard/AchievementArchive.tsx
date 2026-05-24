'use client';

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const achievements = [
  { id: 1, title: 'Ignition', unlocked: true },
  { id: 2, title: 'Momentum', unlocked: true },
  { id: 3, title: 'Deep Diver', unlocked: true },
  { id: 4, title: 'Capstone', unlocked: false },
  { id: 5, title: 'Sprint Master', unlocked: true },
  { id: 6, title: 'Perfected', unlocked: false },
];

export default function AchievementArchive() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="panel"
    >
      <div className="mb-6">
        <h2 className="section-label mb-2">// MILESTONES</h2>
        <p className="text-sm text-foreground">
          <span className="text-primary font-mono">{unlockedCount}</span>
          <span className="text-muted-foreground">/{achievements.length} unlocked</span>
        </p>
      </div>

      <div className="divider mb-6" />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {achievements.map((achievement, idx) => (
          <motion.div
            key={achievement.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className={`border rounded-sm p-3 text-center text-xs cursor-pointer transition-colors ${
              achievement.unlocked
                ? 'border-primary/50 bg-primary/5'
                : 'border-border bg-card/30 opacity-50'
            }`}
          >
            <p className={achievement.unlocked ? 'text-foreground font-mono' : 'text-muted-foreground'}>
              {achievement.unlocked ? achievement.title : <Lock className="w-3 h-3 mx-auto" />}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

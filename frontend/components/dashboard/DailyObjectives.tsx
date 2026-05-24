'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

const objectives = [
  { id: 1, title: 'Solve 3 LeetCode Problems', completed: true, points: 150 },
  { id: 2, title: 'Deep Work Session (4hrs)', completed: true, points: 200 },
  { id: 3, title: 'Code Review 2 PRs', completed: false, points: 100 },
  { id: 4, title: 'Algorithm Study Session', completed: false, points: 120 },
];

export default function DailyObjectives() {
  const completed = objectives.filter((o) => o.completed).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="panel"
    >
      <div className="mb-6">
        <h2 className="section-label mb-2">// DAILY OBJECTIVES</h2>
        <div className="flex justify-between items-center">
          <p className="text-sm text-foreground">
            <span className="text-primary font-mono">{completed}</span>
            <span className="text-muted-foreground">/{objectives.length} Complete</span>
          </p>
        </div>
      </div>

      <div className="divider mb-4" />

      <div className="space-y-3">
        {objectives.map((obj, idx) => (
          <motion.div
            key={obj.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + idx * 0.05 }}
            className={`objective-item ${
              obj.completed ? 'objective-item-completed' : 'objective-item-active'
            }`}
          >
            <div className="flex items-start gap-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 + idx * 0.05, type: 'spring' }}
              >
                <CheckCircle2
                  className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    obj.completed ? 'text-muted-foreground' : 'text-primary'
                  }`}
                />
              </motion.div>
              <div className="flex-1">
                <p className={obj.completed ? 'line-through' : ''}>{obj.title}</p>
                <p className="text-xs text-muted-foreground mt-1">+{obj.points} points</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

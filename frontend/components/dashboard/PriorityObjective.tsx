'use client';

import { motion } from 'framer-motion';

export default function PriorityObjective() {
  const priority = {
    title: 'Master Binary Search Patterns',
    description: 'Complete the binary search algorithm deep-dive course and solve 10 related problems.',
    deadline: '5 days',
    progress: 65,
    status: 'IN_PROGRESS',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="panel border-primary/40"
    >
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="section-label text-primary mb-2">// PRIMARY OBJECTIVE</p>
            <p className="section-title">{priority.title}</p>
          </div>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 border border-primary/30 whitespace-nowrap">
            {priority.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'PENDING'}
          </span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-4">{priority.description}</p>

      <div className="divider mb-4" />

      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="label-secondary">COMPLETION</span>
          <span className="value-primary">{priority.progress}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${priority.progress}%` }}
            transition={{ delay: 0.4, duration: 1 }}
            className="progress-fill"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <span className="label-secondary">DEADLINE</span>
        <span className="text-primary font-mono text-sm">{priority.deadline}</span>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

export default function ExpProgressBar() {
  const exp = 7250;
  const maxExp = 10000;
  const percentage = (exp / maxExp) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 }}
      className="panel"
    >
      <div className="mb-6">
        <h2 className="section-label mb-2">// SKILL PROGRESS</h2>
        <p className="text-sm text-foreground">
          <span className="text-primary font-mono">{percentage.toFixed(0)}%</span>
          <span className="text-muted-foreground"> to next tier</span>
        </p>
      </div>

      <div className="divider mb-4" />

      <div className="space-y-4">
        <div className="flex justify-between items-center mb-2">
          <span className="label-secondary">Current</span>
          <span className="value-primary">{exp.toLocaleString()}</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="progress-fill"
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0</span>
          <span>{maxExp.toLocaleString()}</span>
        </div>
      </div>

      <div className="divider my-4" />

      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        {[
          { label: 'DAILY', value: '+250' },
          { label: 'OBJECTIVES', value: '+500' },
          { label: 'STREAK', value: '+150' },
        ].map((item) => (
          <div key={item.label} className="stat-item">
            <p className="stat-label">{item.label}</p>
            <p className="stat-value text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

const metrics = [
  {
    label: 'DAILY FOCUS',
    current: 340,
    target: 480,
    unit: 'min',
    fill: 71,
  },
  {
    label: 'PROBLEMS SOLVED',
    current: 12,
    target: 15,
    unit: '',
    fill: 80,
  },
  {
    label: 'CONCEPT MASTERY',
    current: 67,
    target: 100,
    unit: '%',
    fill: 67,
  },
  {
    label: 'CONSISTENCY',
    current: 94,
    target: 100,
    unit: '%',
    fill: 94,
  },
];

export default function EvolutionMetrics() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="panel"
    >
      <div className="mb-6">
        <p className="section-label mb-2">// PERFORMANCE METRICS</p>
        <p className="section-subtitle">Real-time progression tracking</p>
      </div>

      <div className="divider mb-6" />

      <div className="space-y-5">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 + idx * 0.08 }}
          >
            <div className="flex justify-between items-baseline mb-2">
              <span className="label-secondary">{metric.label}</span>
              <span className="value-primary">
                {metric.current}
                <span className="text-muted-foreground text-xs ml-1">{metric.unit}</span>
              </span>
            </div>
            <div className="progress-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${metric.fill}%` }}
                transition={{ delay: 0.3 + idx * 0.08, duration: 0.8 }}
                className="progress-fill"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Target: {metric.target}{metric.unit}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

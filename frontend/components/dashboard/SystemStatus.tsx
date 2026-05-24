'use client';

import { motion } from 'framer-motion';
import { APP_NAME, APP_VERSION } from '@/lib/constants/branding';

export default function SystemStatus() {
  const stats = [
    { label: 'FOCUS', value: '94' },
    { label: 'DEPTH', value: '87' },
    { label: 'VELOCITY', value: '76' },
    { label: 'RETENTION', value: '92' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 2 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="panel"
    >
      <div className="mb-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p className="section-label mb-2">// SYSTEM STATUS</p>
          <p className="section-title text-primary">{APP_NAME} {APP_VERSION}</p>
          <p className="section-subtitle">Status: Operational</p>
        </motion.div>
      </div>

      <div className="divider mb-6" />

      <div className="mb-6">
        <p className="label-secondary mb-4">CURRENT PROFILE</p>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Semester</span>
            <span className="value-primary">3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Track</span>
            <span className="value-primary">Algorithms</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Tier</span>
            <span className="value-primary">Advanced</span>
          </div>
        </div>
      </div>

      <div className="divider mb-6" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="stat-grid"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={itemVariants} className="stat-item">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

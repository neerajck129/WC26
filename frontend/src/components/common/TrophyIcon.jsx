import React from 'react';
import { motion } from 'framer-motion';

export default function TrophyIcon({ size = 120, animate = true }) {
  return (
    <motion.div
      className="trophy-glow inline-block"
      animate={animate ? { y: [0, -8, 0] } : {}}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Cup body */}
        <path
          d="M25 10 H75 V55 C75 78 62 90 50 95 C38 90 25 78 25 55 Z"
          fill="url(#trophyGrad)"
        />
        {/* Handles */}
        <path d="M25 25 Q10 25 10 40 Q10 55 25 52" stroke="url(#trophyGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <path d="M75 25 Q90 25 90 40 Q90 55 75 52" stroke="url(#trophyGrad)" strokeWidth="3" fill="none" strokeLinecap="round"/>
        {/* Stem */}
        <rect x="43" y="95" width="14" height="12" rx="2" fill="url(#trophyGrad)" />
        {/* Base */}
        <rect x="32" y="107" width="36" height="8" rx="4" fill="url(#trophyGrad)" />
        {/* Star on cup */}
        <path
          d="M50 30 L52.5 37 L60 37 L54 41.5 L56.5 48.5 L50 44 L43.5 48.5 L46 41.5 L40 37 L47.5 37 Z"
          fill="rgba(0,0,0,0.3)"
        />
        <defs>
          <linearGradient id="trophyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

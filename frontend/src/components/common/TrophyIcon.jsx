import React from 'react';
import { motion } from 'framer-motion';

export default function TrophyIcon({ size = 160 }) {
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Ball — behind trophy, 2D spinning in place */}
      <motion.img
        src="/images/wc-ball.png"
        alt="FIFA World Cup 2026 Ball"
        style={{
          position: 'absolute',
          width: size * 0.85,
          height: size * 0.85,
          objectFit: 'contain',
          zIndex: 1,
          filter: 'drop-shadow(0 0 12px rgba(0,0,0,0.6))',
          opacity: 0.9,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulsing gold glow behind everything */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.18) 0%, transparent 70%)',
          zIndex: 0,
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trophy — on top, floating */}
      <motion.img
        src="/images/wc-trophy.png"
        alt="FIFA World Cup Trophy"
        style={{
          width: size * 0.65,
          height: size * 0.65,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          filter:
            'drop-shadow(0 0 18px rgba(245,158,11,0.7)) drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Ground shadow synced to trophy float */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.45,
          height: 10,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.3) 0%, transparent 70%)',
          filter: 'blur(4px)',
          zIndex: 0,
        }}
        animate={{ scaleX: [1, 0.75, 1], opacity: [0.6, 0.25, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
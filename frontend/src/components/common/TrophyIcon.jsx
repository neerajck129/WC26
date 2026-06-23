import React from 'react';
import { motion } from 'framer-motion';

export default function TrophyIcon({ size = 120 }) {
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>

      {/* Outer slow rotating glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 60%, rgba(245,158,11,0.4) 80%, transparent 100%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Pulsing gold glow behind trophy */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trophy image — float up/down */}
      <motion.img
        src="/images/wc-trophy.png"
        alt="FIFA World Cup Trophy"
        style={{
          width: size * 0.82,
          height: size * 0.82,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 2,
          filter: 'drop-shadow(0 0 18px rgba(245,158,11,0.7)) drop-shadow(0 4px 24px rgba(0,0,0,0.6))',
        }}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Bottom reflection/shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: size * 0.5,
          height: 10,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.3) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
        animate={{ scaleX: [1, 0.8, 1], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

    </div>
  );
}
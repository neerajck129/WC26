import React from 'react';
import { motion } from 'framer-motion';

export default function TrophyIcon({ size = 160 }) {
  const orbitRadius = size * 0.62;
  const ballSize = size * 0.22;
  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Orbit path ring (faint dashed circle) */}
      <div
        className="absolute rounded-full"
        style={{
          width: orbitRadius * 2,
          height: orbitRadius * 2,
          top: center - orbitRadius,
          left: center - orbitRadius,
          border: '1px dashed rgba(245,158,11,0.15)',
          borderRadius: '50%',
        }}
      />

      {/* Orbiting football */}
      <motion.div
        className="absolute"
        style={{
          width: ballSize,
          height: ballSize,
          top: center - ballSize / 2,
          left: center - ballSize / 2,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
      >
        {/* Ball offset to orbit radius, counter-rotates to stay upright */}
        <motion.div
          style={{
            position: 'absolute',
            width: ballSize,
            height: ballSize,
            top: -orbitRadius,
            left: 0,
          }}
          animate={{ rotate: -360 }}
          transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}
        >
          <img
            src="/images/wc-ball.png"
            alt="FIFA World Cup 2026 Ball"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Pulsing gold glow behind trophy */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Trophy image — floats up and down */}
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

      {/* Bottom shadow synced to float */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        style={{
          width: size * 0.45,
          height: 10,
          background: 'radial-gradient(ellipse, rgba(245,158,11,0.3) 0%, transparent 70%)',
          filter: 'blur(4px)',
        }}
        animate={{ scaleX: [1, 0.75, 1], opacity: [0.6, 0.25, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const TimeUnit = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <motion.div
      key={value}
      initial={{ scale: 1.15, opacity: 0.6 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card gold-border rounded-xl w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
    >
      <span className="font-display text-3xl md:text-4xl gold-text">
        {String(value).padStart(2, '0')}
      </span>
    </motion.div>
    <span className="text-xs text-slate-500 mt-2 uppercase tracking-widest">{label}</span>
  </div>
);

export default function CountdownTimer({ targetDate, onExpired }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        onExpired?.();
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className="glass-card gold-border rounded-2xl px-6 py-4 inline-block">
        <p className="text-gold-400 font-semibold text-center">
          ⏰ Predictions are now closed — Final match has started!
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-slate-500 text-xs uppercase tracking-widest text-center mb-4">
        Final Kickoff In
      </p>
      <div className="flex items-start gap-3 md:gap-4 justify-center">
        <TimeUnit value={timeLeft.days} label="Days" />
        <span className="gold-text font-display text-3xl mt-3">:</span>
        <TimeUnit value={timeLeft.hours} label="Hours" />
        <span className="gold-text font-display text-3xl mt-3">:</span>
        <TimeUnit value={timeLeft.minutes} label="Mins" />
        <span className="gold-text font-display text-3xl mt-3">:</span>
        <TimeUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
}

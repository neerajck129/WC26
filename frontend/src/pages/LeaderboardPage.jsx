import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import TrophyIcon from '../components/common/TrophyIcon';
import Confetti from '../components/common/Confetti';

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(({ data }) => setData(data))
      .catch(() => setData({ success: false }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center stadium-bg" style={{ background: '#050a07' }}>
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-gold-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  const winner = data?.data?.[0];

  return (
    <div className="min-h-screen stadium-bg" style={{ background: 'linear-gradient(180deg, #050a07 0%, #0a0f0d 100%)' }}>
      {data?.published && <Confetti />}

      {/* Nav */}
      <nav className="border-b border-white/5 px-4 md:px-8 h-14 flex items-center gap-4">
        <Link to="/" className="text-slate-400 hover:text-gold-400 transition-colors text-sm">
          ← Back
        </Link>
        <span className="text-gold-500 font-display text-xl tracking-widest ml-auto">LEADERBOARD</span>
      </nav>

      <div className="px-4 max-w-2xl mx-auto py-16">
        {!data?.published ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <TrophyIcon size={100} />
            <h1 className="font-display text-4xl tracking-wider mt-6 mb-3">
              RESULTS <span className="gold-text">PENDING</span>
            </h1>
            <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
              {data?.message || 'Leaderboard will be published after the official result is confirmed.'}
            </p>
            {data?.announcementDate && (
              <div className="glass-card gold-border rounded-2xl px-6 py-4 inline-block mt-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Results expected on</p>
                <p className="text-gold-400 font-bold">
                  {new Date(data.announcementDate).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <>
            {/* Official Result */}
            {data.officialResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card gold-border rounded-2xl p-6 text-center mb-10"
              >
                <div className="text-xs text-gold-500 uppercase tracking-widest mb-2">Official Final Result</div>
                <div className="font-display text-3xl text-slate-100 mb-1">
                  {data.officialResult.winner}
                </div>
                <div className="font-display text-5xl gold-text">
                  {data.officialResult.winnerGoals} — {data.officialResult.opponentGoals}
                </div>
              </motion.div>
            )}

            {/* Winning Prediction — the only entry shown */}
            {winner && (
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                className="text-center"
              >
                <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-8">
                  🏆 <span className="gold-text">WINNING PREDICTION</span> 🏆
                </h2>

                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 30px 0px rgba(234, 179, 8, 0.25)',
                      '0 0 55px 8px rgba(234, 179, 8, 0.45)',
                      '0 0 30px 0px rgba(234, 179, 8, 0.25)',
                    ],
                  }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  className="glass-card gold-border rounded-3xl p-10 md:p-12 relative overflow-hidden"
                >
                  <div className="absolute -top-8 -right-8 text-[120px] opacity-10 select-none">🥇</div>

                  <div className="text-7xl mb-4">🥇</div>

                  <div className="font-display text-2xl md:text-3xl text-slate-100 mb-1">
                    {winner.name}
                  </div>
                  <div className="text-sm text-slate-500 font-mono mb-6">
                    {winner.predictionId}
                  </div>

                  <div className="text-xs text-gold-500 uppercase tracking-widest mb-2">Predicted</div>
                  <div className="font-display text-xl text-gold-400 mb-1">
                    {winner.predictedWinner}
                  </div>
                  <div className="font-display text-5xl md:text-6xl text-slate-100 mb-8">
                    {winner.yourGoals} - {winner.opponentGoals}
                  </div>

                  <span className="inline-block text-lg font-bold px-6 py-2 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/40">
                    {winner.points} pts
                  </span>
                </motion.div>
              </motion.div>
            )}

            {!winner && (
              <p className="text-center text-slate-500 text-sm">No predictions yet.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
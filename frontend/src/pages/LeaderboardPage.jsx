import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import TrophyIcon from '../components/common/TrophyIcon';
import Confetti from '../components/common/Confetti';

const MEDALS = ['🥇', '🥈', '🥉'];

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

      <div className="px-4 max-w-3xl mx-auto py-12">
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

            {/* Podium top 3 */}
            {data.data?.slice(0, 3).length > 0 && (
              <div className="mb-10">
                <h2 className="font-display text-3xl tracking-wider text-center mb-8">
                  🏆 <span className="gold-text">WINNERS</span> 🏆
                </h2>
                <div className="flex items-end justify-center gap-4">
                  {[data.data[1], data.data[0], data.data[2]].filter(Boolean).map((p, i) => {
                    const realIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
                    return (
                      <motion.div
                        key={p._id}
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: realIndex * 0.15 }}
                        className={`glass-card rounded-2xl p-4 text-center flex-1 max-w-[160px] ${
                          realIndex === 0 ? 'border border-gold-500/40 order-2' : 'border border-white/5'
                        }`}
                        style={realIndex === 0 ? { paddingTop: '24px', paddingBottom: '24px' } : {}}
                      >
                        <div className="text-3xl mb-2">{MEDALS[realIndex]}</div>
                        <div className="text-sm font-bold text-slate-100 truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 mt-1 font-mono">{p.predictionId}</div>
                        <div className="text-xs text-gold-400 mt-1">{p.predictedWinner}</div>
                        <div className="text-xs text-slate-400">{p.yourGoals} - {p.opponentGoals}</div>
                        <div className="mt-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded rank-${realIndex + 1}`}>
                            {p.points} pts
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Full table */}
            {data.data?.length > 0 && (
              <div>
                <h3 className="font-bold text-slate-300 mb-4">Top Rankings</h3>
                <div className="space-y-2">
                  {data.data.map((p, i) => (
                    <motion.div
                      key={p._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="glass-card rounded-xl px-4 py-3 flex items-center gap-4 border border-white/5"
                    >
                      <span className="text-sm font-mono w-6 text-slate-500 text-center">
                        {p.rank <= 3 ? MEDALS[p.rank - 1] : `#${p.rank}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-100 truncate">{p.name}</div>
                        <div className="text-xs text-slate-500 font-mono">{p.predictionId}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gold-400">{p.predictedWinner}</div>
                        <div className="text-xs text-slate-400">{p.yourGoals} - {p.opponentGoals}</div>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ml-2 ${
                        p.points === 15 ? 'bg-gold-500/20 text-gold-400' :
                        p.points >= 10 ? 'bg-green-500/10 text-green-400' :
                        p.points >= 5 ? 'bg-blue-500/10 text-blue-400' :
                        'bg-white/5 text-slate-400'
                      }`}>
                        {p.points} pts
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

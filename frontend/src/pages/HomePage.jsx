import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/common/CountdownTimer';
import TrophyIcon from '../components/common/TrophyIcon';
import PredictionForm from '../components/prediction/PredictionForm';
import PredictionTicket from '../components/prediction/PredictionTicket';
import { getPublicStats } from '../services/api';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function HomePage() {
  const [successData, setSuccessData] = useState(null);
  const [stats, setStats] = useState(null);
  const [submissionsOpen, setSubmissionsOpen] = useState(true);
  const [kickoffTime, setKickoffTime] = useState('2026-07-19T20:00:00.000Z');
  const [announcementDate, setAnnouncementDate] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    getPublicStats()
      .then(({ data }) => {
        if (data.success) {
          setStats(data.data);
          setSubmissionsOpen(data.data.submissionsOpen);
          setKickoffTime(data.data.finalKickoff || kickoffTime);
          setAnnouncementDate(data.data.announcementDate);
        }
      })
      .catch(() => {});
  }, []);

  const handleCountdownExpired = () => setSubmissionsOpen(false);

  return (
    <div className="min-h-screen relative hero-bg">

      {/* Dark overlay so text stays readable */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none z-0" />

      {/* All page content sits above overlay */}
      <div className="relative z-10">

        {/* Nav */}
        <nav className="border-b border-white/5 px-4 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gold-500 font-display text-xl tracking-widest">WC26</span>
            <span className="text-slate-600 text-xs uppercase tracking-widest hidden sm:block">DYFI Prediction Challenge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/leaderboard" className="text-sm text-slate-400 hover:text-gold-400 transition-colors">
              Leaderboard
            </Link>
            <Link
              to="/admin"
              className="text-xs px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:text-gold-400 hover:border-gold-500/20 transition-all"
            >
              Admin
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="relative px-4 pt-16 pb-12 text-center overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(245,158,11,0.06) 0%, transparent 70%)',
            }}
          />

          <motion.div {...fadeUp} className="relative">
            <TrophyIcon size={160} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6"
          >
            <div className="text-xs tracking-[0.4em] text-gold-500 uppercase mb-3">
              FIFA World Cup 2026
            </div>
            <h1
              className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider leading-none"
              style={{ color: '#f1f5f9' }}
            >
              DYFI
              <br />
              <span className="gold-text">PREDICTION CHALLENGE</span>
            </h1>
            <p className="text-slate-400 text-base md:text-lg mt-6 max-w-xl mx-auto leading-relaxed">
              Predict the FIFA World Cup Final winner and score before kickoff.
              Compete with football fans and see how accurate your prediction is.
            </p>
          </motion.div>

          {/* Stats row */}
          {stats && stats.total > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-8 mt-8"
            >
              <div className="text-center">
                <div className="font-display text-3xl gold-text">{stats.total.toLocaleString()}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider">Predictions</div>
              </div>
              {stats.teamCounts?.[0] && (
                <div className="text-center">
                  <div className="font-display text-3xl gold-text">{stats.teamCounts[0]._id}</div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider">Most Picked</div>
                </div>
              )}
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            {!showForm && !successData && (
              <button
                onClick={() => setShowForm(true)}
                className="btn-gold px-10 py-4 rounded-2xl text-lg font-bold tracking-wide inline-flex items-center gap-2"
              >
                ⚽ Predict Now
              </button>
            )}
          </motion.div>
        </section>

        {/* Prediction Form / Ticket */}
        {(showForm || successData) && (
          <section className="px-4 max-w-lg mx-auto pb-16">
            {successData ? (
              <PredictionTicket
                data={successData}
                onReset={() => { setSuccessData(null); setShowForm(false); }}
              />
            ) : (
              <PredictionForm
                onSuccess={(data) => setSuccessData(data)}
                disabled={!submissionsOpen}
              />
            )}
          </section>
        )}

        {/* Countdown */}
        <section className="px-4 py-10 text-center">
          <CountdownTimer targetDate={kickoffTime} onExpired={handleCountdownExpired} />
        </section>

        {/* Announcement Banner */}
        <section className="px-4 max-w-2xl mx-auto mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card gold-border rounded-2xl p-6 space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">🏆</span>
              <p className="text-slate-200 text-sm">
                Winners will be announced after the FIFA World Cup Final result is officially confirmed.
              </p>
            </div>
            {announcementDate && (
              <div className="flex items-start gap-3">
                <span className="text-2xl">📅</span>
                <p className="text-slate-200 text-sm">
                  Leaderboard and winners will be published on:{' '}
                  <span className="text-gold-400 font-semibold">
                    {new Date(announcementDate).toLocaleDateString('en-IN', {
                      day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </span>
                </p>
              </div>
            )}
            <div className="flex items-start gap-3">
              <span className="text-2xl">⏰</span>
              <p className="text-slate-200 text-sm">
                Prediction submissions close when the World Cup Final starts.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠</span>
              <p className="text-slate-400 text-sm">
                No submissions will be accepted after kickoff.
              </p>
            </div>
          </motion.div>
        </section>

        {/* How It Works */}
        <section className="px-4 max-w-3xl mx-auto py-12">
          <h2 className="font-display text-3xl tracking-wider text-center mb-10">
            HOW IT <span className="gold-text">WORKS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '01', icon: '📝', title: 'Submit', desc: 'Fill in your name, phone, predicted winner, and final score before kickoff.' },
              { step: '02', icon: '⚽', title: 'Watch', desc: 'Enjoy the FIFA World Cup Final and cheer for your predicted winner.' },
              { step: '03', icon: '🏆', title: 'Win', desc: 'Results and leaderboard published after the official final result is confirmed.' },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card gold-border rounded-2xl p-6"
              >
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs text-gold-600 font-mono mb-1">STEP {item.step}</div>
                <h3 className="font-bold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Scoring */}
        <section className="px-4 max-w-2xl mx-auto pb-16">
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <h3 className="font-bold text-center text-slate-100 mb-5">
              🎯 Scoring System
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Correct Winner', pts: '+5 pts' },
                { label: "Correct Winner's Goals", pts: '+5 pts' },
                { label: "Correct Opponent's Goals", pts: '+5 pts' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-300">{item.label}</span>
                  <span className="text-gold-400 font-bold text-sm font-mono">{item.pts}</span>
                </div>
              ))}
              <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-100">Maximum Points</span>
                <span className="text-gold-400 font-bold font-mono">15 pts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 px-4 py-6 text-center">
          <p className="text-xs text-slate-600">
            World Cup Prediction Challenge 2026 — Not a gambling platform. No real money involved.
          </p>
          <Link to="/leaderboard" className="text-xs text-gold-600 hover:text-gold-400 transition-colors mt-2 inline-block">
            View Leaderboard →
          </Link>
        </footer>

      </div> {/* closes relative z-10 */}
    </div> /* closes hero-bg */
  );
}
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import toast from 'react-hot-toast';
import { getDashboardStats, toggleSubmissions, updateSettings } from '../../services/api';

const CHART_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

const StatCard = ({ icon, label, value, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card gold-border rounded-2xl p-5"
  >
    <div className="text-2xl mb-2">{icon}</div>
    <div className="font-display text-3xl gold-text">{value}</div>
    <div className="text-sm font-semibold text-slate-300 mt-1">{label}</div>
    {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
  </motion.div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kickoffInput, setKickoffInput] = useState('');
  const [announcementInput, setAnnouncementInput] = useState('');

  const fetchStats = () => {
    getDashboardStats()
      .then(({ data }) => {
        setStats(data.data);
        setKickoffInput(data.data.finalKickoff?.slice(0, 16) || '');
        setAnnouncementInput(data.data.announcementDate?.slice(0, 10) || '');
      })
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStats(); }, []);

  const handleToggleSubmissions = async () => {
    try {
      await toggleSubmissions({ open: !stats.submissionsOpen });
      toast.success(stats.submissionsOpen ? 'Submissions closed' : 'Submissions opened');
      fetchStats();
    } catch { toast.error('Failed to update'); }
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        finalKickoff: kickoffInput ? new Date(kickoffInput).toISOString() : undefined,
        announcementDate: announcementInput ? new Date(announcementInput).toISOString() : undefined,
      });
      toast.success('Settings saved');
      fetchStats();
    } catch { toast.error('Failed to save'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-0.5">World Cup Prediction Challenge 2026</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="⚽" label="Total Predictions" value={stats.total.toLocaleString()} />
        <StatCard icon="🩸" label="Blood Donors" value={stats.totalDonors.toLocaleString()} />
        <StatCard icon="📅" label="Today's Entries" value={stats.todayCount.toLocaleString()} />
        <StatCard
          icon="🏆"
          label="Most Predicted"
          value={stats.mostPredicted?._id || '—'}
          sub={stats.mostPredicted ? `${stats.mostPredicted.count} picks` : ''}
        />
      </div>

      {/* Status toggles */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-200">Prediction Submissions</div>
          <div className={`text-xs mt-0.5 ${stats.submissionsOpen ? 'text-green-400' : 'text-red-400'}`}>
            {stats.submissionsOpen ? '🟢 Open' : '🔴 Closed'}
          </div>
        </div>
        <button
          onClick={handleToggleSubmissions}
          className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
            stats.submissionsOpen
              ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
              : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
          }`}
        >
          {stats.submissionsOpen ? 'Close Submissions' : 'Open Submissions'}
        </button>
      </div>

      {/* Settings */}
      <div className="glass-card rounded-2xl p-5 border border-white/5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">Competition Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
              Final Kickoff Date & Time
            </label>
            <input
              type="datetime-local"
              className="w-full input-dark rounded-xl px-4 py-2.5 text-sm"
              value={kickoffInput}
              onChange={(e) => setKickoffInput(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">
              Announcement Date
            </label>
            <input
              type="date"
              className="w-full input-dark rounded-xl px-4 py-2.5 text-sm"
              value={announcementInput}
              onChange={(e) => setAnnouncementInput(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={handleSaveSettings}
          className="mt-4 btn-gold px-6 py-2.5 rounded-xl text-sm font-bold"
        >
          Save Settings
        </button>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Team Distribution */}
        {stats.teamCounts?.length > 0 && (
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Team Distribution (Top 10)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.teamCounts.slice(0, 10)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0f1a14', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#f1f5f9' }}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Blood Group */}
        {stats.bloodGroupCounts?.length > 0 && (
          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Blood Group Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={stats.bloodGroupCounts}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#475569' }}
                >
                  {stats.bloodGroupCounts.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f1a14', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Daily Trend */}
        {stats.dailyTrend?.length > 1 && (
          <div className="glass-card rounded-2xl p-5 border border-white/5 md:col-span-2">
            <h3 className="text-sm font-semibold text-slate-200 mb-4">Daily Submission Trend</h3>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={stats.dailyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="_id" tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ background: '#0f1a14', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

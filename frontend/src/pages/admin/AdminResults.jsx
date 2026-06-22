import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  getDashboardStats,
  saveOfficialResult,
  calculateResults,
  toggleLeaderboard,
  resetCompetition,
  exportLeaderboardExcel,
  getLeaderboard,
} from '../../services/api';

const WC_TEAMS_2026 = [
  'Argentina', 'Brazil', 'France', 'England', 'Spain', 'Germany',
  'Portugal', 'Netherlands', 'Belgium', 'Italy', 'Uruguay', 'Colombia',
  'Mexico', 'USA', 'Canada', 'Morocco', 'Senegal', 'Nigeria',
  'Japan', 'South Korea', 'Australia', 'Croatia', 'Denmark',
  'Switzerland', 'Poland', 'Serbia', 'Ecuador', 'Peru',
];

export default function AdminResults() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [result, setResult] = useState({ winner: '', winnerGoals: '', opponentGoals: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculating, setCalculating] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, lbRes] = await Promise.all([getDashboardStats(), getLeaderboard()]);
      setStats(statsRes.data.data);
      if (statsRes.data.data.officialResult) {
        setResult(statsRes.data.data.officialResult);
      }
      setLeaderboard(lbRes.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSaveResult = async () => {
    if (!result.winner || result.winnerGoals === '' || result.opponentGoals === '') {
      toast.error('Fill all fields');
      return;
    }
    setSaving(true);
    try {
      await saveOfficialResult(result);
      toast.success('Official result saved!');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const handleCalculate = async () => {
    if (!window.confirm('Calculate points for all predictions? This will overwrite existing points.')) return;
    setCalculating(true);
    try {
      const { data } = await calculateResults();
      toast.success(data.message);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Calculation failed');
    } finally { setCalculating(false); }
  };

  const handleToggleLeaderboard = async () => {
    try {
      await toggleLeaderboard({ published: !stats.leaderboardPublished });
      toast.success(stats.leaderboardPublished ? 'Leaderboard hidden' : 'Leaderboard published!');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleReset = async () => {
    const confirm1 = window.confirm('DANGER: This will delete ALL predictions and reset the competition. Are you sure?');
    if (!confirm1) return;
    const confirm2 = window.confirm('Last chance: This is irreversible. Delete everything?');
    if (!confirm2) return;
    try {
      await resetCompetition();
      toast.success('Competition reset');
      fetchAll();
    } catch { toast.error('Reset failed'); }
  };

  const handleExportLeaderboard = async () => {
    const toastId = toast.loading('Exporting...');
    try {
      const { data } = await exportLeaderboardExcel();
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'leaderboard.xlsx';
      link.click();
      toast.success('Downloaded!', { id: toastId });
    } catch { toast.error('Export failed', { id: toastId }); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const officialResult = stats?.officialResult;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-100">Results & Points</h1>

      {/* Official Result Entry */}
      <div className="glass-card rounded-2xl p-6 border border-white/5">
        <h2 className="text-base font-semibold text-slate-100 mb-4">
          🏆 Official Final Result
        </h2>
        {officialResult && (
          <div className="mb-4 p-3 bg-gold-500/5 border border-gold-500/20 rounded-xl text-sm text-gold-300">
            Current: <strong>{officialResult.winner}</strong> {officialResult.winnerGoals} — {officialResult.opponentGoals}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Winner Team</label>
            <select
              className="w-full select-dark rounded-xl px-4 py-3 text-sm border border-white/10"
              value={result.winner}
              onChange={(e) => setResult({ ...result, winner: e.target.value })}
            >
              <option value="">Select winner...</option>
              {WC_TEAMS_2026.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Winner Goals</label>
            <input
              className="w-full input-dark rounded-xl px-4 py-3 text-sm text-center font-display text-2xl"
              type="number"
              min={0}
              max={20}
              placeholder="0"
              value={result.winnerGoals}
              onChange={(e) => setResult({ ...result, winnerGoals: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 uppercase tracking-wider block mb-2">Opponent Goals</label>
            <input
              className="w-full input-dark rounded-xl px-4 py-3 text-sm text-center font-display text-2xl"
              type="number"
              min={0}
              max={20}
              placeholder="0"
              value={result.opponentGoals}
              onChange={(e) => setResult({ ...result, opponentGoals: parseInt(e.target.value) })}
            />
          </div>
        </div>
        <button
          onClick={handleSaveResult}
          disabled={saving}
          className="mt-4 btn-gold px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Official Result'}
        </button>
      </div>

      {/* Calculate & Publish */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Calculate Points</h3>
          <p className="text-xs text-slate-500 mb-4">
            Run the scoring engine against the official result. Can be run multiple times.
          </p>
          <button
            onClick={handleCalculate}
            disabled={calculating || !officialResult}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-bold border border-green-500/30 text-green-400 hover:bg-green-500/10 disabled:opacity-30 transition-all"
          >
            {calculating ? '⏳ Calculating...' : '⚡ Calculate All Points'}
          </button>
          {!officialResult && (
            <p className="text-xs text-red-400 mt-2">Save official result first</p>
          )}
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5">
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Leaderboard Visibility</h3>
          <p className="text-xs text-slate-500 mb-4">
            Status: <span className={stats?.leaderboardPublished ? 'text-green-400' : 'text-slate-400'}>
              {stats?.leaderboardPublished ? '🟢 Published' : '⚫ Hidden'}
            </span>
          </p>
          <button
            onClick={handleToggleLeaderboard}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
              stats?.leaderboardPublished
                ? 'border-red-500/30 text-red-400 hover:bg-red-500/10'
                : 'border-gold-500/30 text-gold-400 hover:bg-gold-500/10'
            }`}
          >
            {stats?.leaderboardPublished ? 'Hide Leaderboard' : '🏆 Publish Leaderboard'}
          </button>
        </div>
      </div>

      {/* Leaderboard preview */}
      {leaderboard?.published && leaderboard?.data?.length > 0 && (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-slate-200">Leaderboard Preview (Top 20)</h3>
            <button
              onClick={handleExportLeaderboard}
              className="text-xs text-gold-400 hover:text-gold-300 transition-colors"
            >
              ⬇ Export Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-white/5">
                  <th className="text-left px-4 py-3">Rank</th>
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Winner</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Points</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.data.slice(0, 20).map((p) => (
                  <tr key={p._id} className="border-b border-white/5 hover:bg-white/2">
                    <td className="px-4 py-2.5 text-slate-400 text-xs">#{p.rank}</td>
                    <td className="px-4 py-2.5 font-mono text-gold-400 text-xs">{p.predictionId}</td>
                    <td className="px-4 py-2.5 text-slate-200 text-sm">{p.name}</td>
                    <td className="px-4 py-2.5 text-slate-300 text-xs">{p.predictedWinner}</td>
                    <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{p.yourGoals}-{p.opponentGoals}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        p.points === 15 ? 'bg-gold-500/20 text-gold-400' : 'bg-white/5 text-slate-300'
                      }`}>
                        {p.points}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Danger zone */}
      <div className="border border-red-500/20 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-red-400 mb-2">⚠ Danger Zone</h3>
        <p className="text-xs text-slate-500 mb-4">
          This will permanently delete all predictions and reset the entire competition.
        </p>
        <button
          onClick={handleReset}
          className="px-4 py-2.5 rounded-xl text-sm font-bold border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
        >
          Reset Competition
        </button>
      </div>
    </div>
  );
}

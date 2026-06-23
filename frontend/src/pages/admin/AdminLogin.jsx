import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) return;
    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      login(data.token, data.admin);
      toast.success('Welcome back!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 stadium-bg"
      style={{ background: '#050a07' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Back to home */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-gold-400 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="font-display text-4xl tracking-widest gold-text mb-1">WC26</div>
          <p className="text-slate-500 text-sm">Admin Control Panel</p>
        </div>

        {/* Session expired warning */}
        {sessionExpired && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2"
          >
            <span className="text-amber-400 text-sm mt-0.5">⏰</span>
            <p className="text-amber-300 text-sm">
              Your session expired due to inactivity. Please log in again.
            </p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="glass-card gold-border rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              className="w-full input-dark rounded-xl px-4 py-3 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <input
              className="w-full input-dark rounded-xl px-4 py-3 text-sm"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gold py-3.5 rounded-xl font-bold tracking-wide flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 mt-4">
          Session auto-expires after 30 minutes of inactivity
        </p>
      </motion.div>
    </div>
  );
}
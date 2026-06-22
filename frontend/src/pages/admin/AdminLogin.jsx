import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminLogin } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
        <div className="text-center mb-8">
          <div className="font-display text-4xl tracking-widest gold-text mb-1">WC26</div>
          <p className="text-slate-500 text-sm">Admin Control Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card gold-border rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Username</label>
            <input
              className="w-full input-dark rounded-xl px-4 py-3 text-sm"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="admin"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Password</label>
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
            ) : 'Login'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { submitPrediction } from '../../services/api';

const WC_TEAMS_2026 = [
  'Argentina', 'Brazil', 'France', 'England', 'Spain', 'Germany',
  'Portugal', 'Netherlands', 'Belgium', 'Italy', 'Uruguay', 'Colombia',
  'Mexico', 'USA', 'Canada', 'Morocco', 'Senegal', 'Nigeria',
  'Japan', 'South Korea', 'Australia', 'Croatia', 'Denmark',
  'Switzerland', 'Poland', 'Serbia', 'Ecuador', 'Peru', 'Chile',
  'Saudi Arabia', 'Iran', 'Qatar', 'Cameroon', 'Ghana', 'Tunisia',
  'Costa Rica', 'Panama', 'Honduras',
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function PredictionForm({ onSuccess, disabled }) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    predictedWinner: '',
    yourGoals: '',
    opponentGoals: '',
    isBloodDonor: false,
    bloodGroup: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Name must be at least 3 characters';
    if (!form.phone.trim() || !/^\+?[\d\s\-]{7,15}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    if (!form.predictedWinner) e.predictedWinner = 'Please select the predicted winner';
    if (form.yourGoals === '' || form.yourGoals === null) e.yourGoals = 'Required';
    if (form.opponentGoals === '' || form.opponentGoals === null) e.opponentGoals = 'Required';
    if (form.isBloodDonor && !form.bloodGroup) e.bloodGroup = 'Select your blood group';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please fix the errors below');
      return;
    }
    setLoading(true);
    try {
      const { data } = await submitPrediction({
        ...form,
        yourGoals: parseInt(form.yourGoals),
        opponentGoals: parseInt(form.opponentGoals),
      });
      onSuccess(data.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 409) {
        setErrors({ phone: msg });
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) =>
    `w-full input-dark rounded-xl px-4 py-3 text-sm transition-all ${
      errors[field] ? 'border-red-500/50 bg-red-500/5' : ''
    }`;

  if (disabled) {
    return (
      <div className="glass-card gold-border rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">⏰</div>
        <h3 className="text-gold-400 font-bold text-lg mb-2">Submissions Closed</h3>
        <p className="text-slate-400 text-sm">
          The World Cup Final has started. No more predictions can be accepted.
        </p>
      </div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card gold-border rounded-2xl p-6 md:p-8 space-y-5"
    >
      <h2 className="text-xl font-bold text-slate-100 mb-6">
        Make Your <span className="gold-text">Prediction</span>
      </h2>

      {/* Name */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Full Name <span className="text-gold-500">*</span>
        </label>
        <input
          className={inputClass('name')}
          placeholder="Enter your full name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          maxLength={100}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Phone Number <span className="text-gold-500">*</span>
        </label>
        <input
          className={inputClass('phone')}
          placeholder="+91 98765 43210"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          type="tel"
          maxLength={15}
        />
        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        <p className="text-slate-600 text-xs mt-1">One prediction per phone number</p>
      </div>

      {/* Winner Team */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Predicted Final Winner <span className="text-gold-500">*</span>
        </label>
        <select
          className={`w-full select-dark rounded-xl px-4 py-3 text-sm transition-all ${
            errors.predictedWinner ? 'border-red-500/50' : 'border border-white/10'
          }`}
          value={form.predictedWinner}
          onChange={(e) => set('predictedWinner', e.target.value)}
        >
          <option value="">Select a team...</option>
          {WC_TEAMS_2026.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {errors.predictedWinner && <p className="text-red-400 text-xs mt-1">{errors.predictedWinner}</p>}
      </div>

      {/* Score Prediction */}
      <div>
        <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
          Predicted Final Score <span className="text-gold-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block text-center">
              {form.predictedWinner || 'Winner'} Goals
            </label>
            <input
              className={`${inputClass('yourGoals')} text-center font-display text-2xl`}
              type="number"
              min={0}
              max={20}
              placeholder="0"
              value={form.yourGoals}
              onChange={(e) => set('yourGoals', e.target.value)}
            />
            {errors.yourGoals && <p className="text-red-400 text-xs mt-1 text-center">{errors.yourGoals}</p>}
          </div>
          <div className="text-gold-500 font-display text-3xl pb-5">—</div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block text-center">Opponent Goals</label>
            <input
              className={`${inputClass('opponentGoals')} text-center font-display text-2xl`}
              type="number"
              min={0}
              max={20}
              placeholder="0"
              value={form.opponentGoals}
              onChange={(e) => set('opponentGoals', e.target.value)}
            />
            {errors.opponentGoals && <p className="text-red-400 text-xs mt-1 text-center">{errors.opponentGoals}</p>}
          </div>
        </div>
      </div>

      {/* Blood Donor Section */}
      <div className="border border-red-500/10 rounded-xl p-4 bg-red-500/5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-red-500 cursor-pointer"
            checked={form.isBloodDonor}
            onChange={(e) => set('isBloodDonor', e.target.checked)}
          />
          <div>
            <span className="text-sm text-slate-200 font-medium">
              🩸 I am willing to donate blood if needed
            </span>
            <p className="text-xs text-slate-500 mt-0.5">Completely optional — helps save lives</p>
          </div>
        </label>

        {form.isBloodDonor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 pt-3 border-t border-red-500/10"
          >
            <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => set('bloodGroup', bg)}
                  className={`py-2 rounded-lg text-sm font-bold transition-all ${
                    form.bloodGroup === bg
                      ? 'bg-red-500 text-white border-transparent'
                      : 'border border-white/10 text-slate-300 hover:border-red-500/30 hover:text-red-300'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>
            {errors.bloodGroup && <p className="text-red-400 text-xs mt-2">{errors.bloodGroup}</p>}
          </motion.div>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full btn-gold py-4 rounded-xl text-base font-bold tracking-wide flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          '⚽ Submit My Prediction'
        )}
      </button>
    </motion.form>
  );
}

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';

export default function PredictionTicket({ data, onReset }) {
  const ticketRef = useRef(null);

  const downloadTicket = async () => {
    if (!ticketRef.current) return;
    const toastId = toast.loading('Generating your ticket...');
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#0a0f0d',
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const url = canvas.toDataURL('image/jpeg', 0.95);
      const link = document.createElement('a');
      link.href = url;
      link.download = `WC26-Ticket-${data.predictionId}.jpg`;
      link.click();
      toast.success('Ticket downloaded!', { id: toastId });
    } catch (err) {
      toast.error('Download failed. Please try again.', { id: toastId });
    }
  };

  const submittedDate = new Date(data.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md mx-auto"
    >
      {/* Success header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-16 h-16 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <span className="text-3xl">✅</span>
        </motion.div>
        <h2 className="text-xl font-bold text-slate-100">Prediction Submitted Successfully!</h2>
        <p className="text-slate-400 text-sm mt-1">Your prediction is locked in. Good luck!</p>
      </div>

      {/* Ticket */}
      <div
        ref={ticketRef}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #120a1a 0%, #0f1024 50%, #0a1a0f 100%)',
          border: '1px solid rgba(245,158,11,0.3)',
          boxShadow: '0 0 40px rgba(245,158,11,0.1)',
        }}
      >
        {/* Decorative background */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #f59e0b 0, #f59e0b 1px, transparent 0, transparent 50%)',
            backgroundSize: '10px 10px',
          }}
        />

        {/* Header */}
        <div
          className="relative px-6 py-4 text-center border-b"
          style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.06)' }}
        >
          <div className="text-xs tracking-[0.3em] text-gold-400 uppercase mb-1">DYFI BALUSSERY MC</div>
          <div
            className="font-display text-2xl tracking-widest"
            style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(245,158,11,0.5)' }}
          >
            WORLD CUP 2026
          </div>
          <div className="text-xs text-slate-400 tracking-widest uppercase mt-0.5">

            Prediction Challenge
          </div>
        </div>

        {/* Body */}
        <div className="relative px-6 py-5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Prediction ID</span>
            <span
              className="font-mono font-bold text-gold-400 text-sm"
              style={{ letterSpacing: '0.1em' }}
            >
              {data.predictionId}
            </span>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Name</span>
            <span className="text-slate-100 font-semibold text-sm">{data.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Predicted Winner</span>
            <span className="text-gold-500 font-bold text-sm">{data.predictedWinner}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Predicted Score</span>
            <div className="flex items-center gap-2">
              <span
                className="font-display text-2xl"
                style={{ color: '#fbbf24' }}
              >
                {data.yourGoals}
              </span>
              <span className="text-slate-500 font-display text-lg">-</span>
              <span className="font-display text-2xl text-slate-300">{data.opponentGoals}</span>
            </div>
          </div>

          {data.isBloodDonor && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500 uppercase tracking-wider">Blood Donor</span>
              <span className="text-red-400 text-sm font-medium">
                🩸 Yes — {data.bloodGroup}
              </span>
            </div>
          )}

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-500 uppercase tracking-wider">Submitted</span>
            <span className="text-slate-300 text-xs">{submittedDate}</span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-3 text-center text-xs text-slate-600"
          style={{ borderTop: '1px solid rgba(255,255,255,0.04)', background: 'rgba(0,0,0,0.2)' }}
        >
          Winners will be announced on 21 July 2026.
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={downloadTicket}
          className="flex-1 btn-gold py-3 rounded-xl text-sm font-bold"
        >
          ⬇ Download Ticket
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 rounded-xl text-sm text-slate-400 hover:text-slate-100 border border-white/10 hover:border-white/20 transition-all"
        >
          Back
        </button>
      </div>
    </motion.div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getAdminPredictions, deletePrediction, exportPredictionsExcel } from '../../services/api';

export default function AdminPredictions() {
  const [predictions, setPredictions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getAdminPredictions({ page, limit: 20, search });
      setPredictions(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load predictions'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleDelete = async (id, predId) => {
    if (!window.confirm(`Delete prediction ${predId}? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deletePrediction(id);
      toast.success('Prediction deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  const handleExport = async () => {
    const toastId = toast.loading('Exporting...');
    try {
      const { data } = await exportPredictionsExcel();
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'predictions.xlsx';
      link.click();
      toast.success('Downloaded!', { id: toastId });
    } catch { toast.error('Export failed', { id: toastId }); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Predictions</h1>
          {pagination.total && (
            <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total</p>
          )}
        </div>
        <button onClick={handleExport} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold">
          ⬇ Export Excel
        </button>
      </div>

      <input
        className="w-full md:w-72 input-dark rounded-xl px-4 py-2.5 text-sm"
        placeholder="Search by name, phone, ID, team..."
        value={search}
        onChange={handleSearch}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">ID</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Winner</th>
                  <th className="text-left px-4 py-3">Score</th>
                  <th className="text-left px-4 py-3">Donor</th>
                  <th className="text-left px-4 py-3">Points</th>
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {predictions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-500">No predictions found</td>
                  </tr>
                ) : (
                  predictions.map((p) => (
                    <tr key={p._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono text-gold-400 text-xs whitespace-nowrap">{p.predictionId}</td>
                      <td className="px-4 py-3 text-slate-200 font-medium whitespace-nowrap">{p.name}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs whitespace-nowrap">{p.phone}</td>
                      <td className="px-4 py-3 text-slate-200 whitespace-nowrap">{p.predictedWinner}</td>
                      <td className="px-4 py-3 text-slate-400 font-mono whitespace-nowrap">{p.yourGoals} - {p.opponentGoals}</td>
                      <td className="px-4 py-3">
                        {p.isBloodDonor ? (
                          <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-full">
                            🩸 {p.bloodGroup}
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.points !== null && p.points !== undefined ? (
                          <span className="text-xs font-bold text-gold-400">{p.points}</span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(p.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(p._id, p.predictionId)}
                          disabled={deleting === p._id}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-30"
                        >
                          {deleting === p._id ? '...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <span className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-400 hover:border-gold-500/30 disabled:opacity-30 transition-all"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages}
                  className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-slate-400 hover:border-gold-500/30 disabled:opacity-30 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

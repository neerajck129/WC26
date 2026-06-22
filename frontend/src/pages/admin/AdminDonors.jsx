import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getBloodDonors, exportDonorsExcel } from '../../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBloodDonors({ search, bloodGroup });
      setDonors(data.data);
    } catch { toast.error('Failed to load donors'); }
    finally { setLoading(false); }
  }, [search, bloodGroup]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleExport = async () => {
    const toastId = toast.loading('Exporting...');
    try {
      const { data } = await exportDonorsExcel();
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'blood-donors.xlsx';
      link.click();
      toast.success('Downloaded!', { id: toastId });
    } catch { toast.error('Export failed', { id: toastId }); }
  };

  // Group by blood group
  const grouped = BLOOD_GROUPS.reduce((acc, bg) => {
    const list = donors.filter((d) => d.bloodGroup === bg);
    if (list.length) acc[bg] = list;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Blood Donors</h1>
          <p className="text-slate-500 text-sm mt-0.5">{donors.length} registered donors</p>
        </div>
        <button onClick={handleExport} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-bold">
          ⬇ Export Excel
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="input-dark rounded-xl px-4 py-2.5 text-sm w-full md:w-56"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select-dark rounded-xl px-4 py-2.5 text-sm border border-white/10"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
        >
          <option value="">All Blood Groups</option>
          {BLOOD_GROUPS.map((bg) => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>

      {/* Blood group summary */}
      {!bloodGroup && !search && (
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {BLOOD_GROUPS.map((bg) => {
            const count = donors.filter((d) => d.bloodGroup === bg).length;
            return (
              <button
                key={bg}
                onClick={() => setBloodGroup(bg)}
                className={`glass-card rounded-xl py-2 text-center border transition-all ${
                  count > 0 ? 'border-red-500/20 hover:border-red-500/40' : 'border-white/5 opacity-40'
                }`}
              >
                <div className="text-sm font-bold text-red-400">{bg}</div>
                <div className="text-xs text-slate-500">{count}</div>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full" />
        </div>
      ) : donors.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center border border-white/5">
          <div className="text-4xl mb-3">🩸</div>
          <p className="text-slate-400">No donors found for this filter.</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3">Prediction ID</th>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Phone</th>
                  <th className="text-left px-4 py-3">Blood Group</th>
                  <th className="text-left px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {donors.map((d) => (
                  <tr key={d._id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                    <td className="px-4 py-3 font-mono text-gold-400 text-xs">{d.predictionId}</td>
                    <td className="px-4 py-3 text-slate-200 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{d.phone}</td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold px-3 py-1 rounded-full bg-red-500/10 text-red-400">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(d.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

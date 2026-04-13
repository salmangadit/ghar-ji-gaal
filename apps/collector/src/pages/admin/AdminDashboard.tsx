import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@ghar-ji-gaal/shared';
import type { RequestStatus } from '@ghar-ji-gaal/shared';

interface StatusCount {
  status: RequestStatus;
  count: number;
}

const STATUS_META: Record<RequestStatus, { label: string; emoji: string; color: string }> = {
  pending:      { label: 'Pending',      emoji: '⏳', color: 'text-gray-500 bg-gray-100' },
  responses_in: { label: 'Has responses', emoji: '📬', color: 'text-blue-600 bg-blue-50' },
  grouped:      { label: 'Ready to review', emoji: '🔍', color: 'text-amber-700 bg-amber-50' },
  verified:     { label: 'Verified',     emoji: '✅', color: 'text-green-700 bg-green-50' },
  rejected:     { label: 'Rejected',     emoji: '❌', color: 'text-red-600 bg-red-50' },
};

export function AdminDashboard() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Partial<Record<RequestStatus, number>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('vocabulary_requests')
      .select('status')
      .then(({ data }) => {
        if (!data) return;
        const c: Partial<Record<RequestStatus, number>> = {};
        for (const row of data) {
          const s = row.status as RequestStatus;
          c[s] = (c[s] ?? 0) + 1;
        }
        setCounts(c);
        setLoading(false);
      });
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-extrabold">Vocabulary Collector</h1>
          <p className="text-xs text-gray-400">Admin Panel · Ghar ji Ghaal</p>
        </div>
        <button onClick={handleSignOut} className="text-xs text-gray-400 underline">
          Sign out
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        {/* Status counts */}
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide">Overview</h2>

        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(Object.keys(STATUS_META) as RequestStatus[]).map((status) => {
              const meta = STATUS_META[status];
              const count = counts[status] ?? 0;
              return (
                <Link
                  key={status}
                  to={`/admin/requests?status=${status}`}
                  className={`rounded-2xl p-4 flex flex-col gap-1 border-2 border-transparent hover:border-primary transition-all ${meta.color}`}
                >
                  <div className="text-2xl">{meta.emoji}</div>
                  <div className="text-2xl font-extrabold">{count}</div>
                  <div className="text-xs font-medium">{meta.label}</div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Quick actions */}
        <h2 className="text-sm font-bold text-gray-600 uppercase tracking-wide pt-2">Actions</h2>
        <div className="flex flex-col gap-3">
          <Link
            to="/admin/new"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-primary transition-all"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-bold text-sm">New vocabulary request</p>
              <p className="text-xs text-gray-400">Create a new word to crowdsource</p>
            </div>
          </Link>
          <Link
            to="/admin/requests?status=grouped"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-primary transition-all"
          >
            <span className="text-2xl">🔍</span>
            <div>
              <p className="font-bold text-sm">Review grouped responses</p>
              <p className="text-xs text-gray-400">{counts.grouped ?? 0} ready to verify</p>
            </div>
          </Link>
          <Link
            to="/admin/export"
            className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-primary transition-all"
          >
            <span className="text-2xl">📤</span>
            <div>
              <p className="font-bold text-sm">Export verified vocabulary</p>
              <p className="text-xs text-gray-400">Download JSON for the teaching app</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

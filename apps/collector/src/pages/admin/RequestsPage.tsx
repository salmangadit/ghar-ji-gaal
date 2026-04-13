import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@ghar-ji-gaal/shared';
import type { VocabularyRequest, RequestStatus } from '@ghar-ji-gaal/shared';

const STATUS_BADGE: Record<RequestStatus, string> = {
  pending:      'bg-gray-100 text-gray-500',
  responses_in: 'bg-blue-50 text-blue-600',
  grouped:      'bg-amber-50 text-amber-700',
  verified:     'bg-green-50 text-green-700',
  rejected:     'bg-red-50 text-red-500',
};

export function RequestsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get('status') as RequestStatus | null);
  const [requests, setRequests] = useState<VocabularyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase.from('vocabulary_requests').select('*').order('created_at', { ascending: false });
    if (statusFilter) q = q.eq('status', statusFilter);

    q.then(({ data }) => {
      setRequests(data ?? []);
      setLoading(false);
    });
  }, [statusFilter]);

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link to="/admin" className="text-gray-400 text-sm">← Dashboard</Link>
        <h1 className="text-base font-bold flex-1">
          Vocabulary Requests
          {statusFilter && <span className="ml-2 text-gray-400 font-normal capitalize">· {statusFilter}</span>}
        </h1>
        <Link to="/admin/new" className="text-xs font-bold text-white px-3 py-1.5 rounded-xl" style={{ backgroundColor: 'var(--color-primary)' }}>
          + New
        </Link>
      </header>

      {/* Status filter tabs */}
      <div className="bg-white border-b border-gray-100 px-6 py-2 flex gap-2 overflow-x-auto">
        {(['', 'pending', 'responses_in', 'grouped', 'verified', 'rejected'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSearchParams(s ? { status: s } : {})}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              statusFilter === (s || null)
                ? 'text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
            style={(statusFilter === s || (!statusFilter && !s)) ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="max-w-2xl mx-auto px-6 py-4 space-y-3">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No requests found.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-bold">{req.english}</p>
                  {req.context && <p className="text-xs text-gray-400 mt-0.5 italic">{req.context}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize ${STATUS_BADGE[req.status]}`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    {req.category && (
                      <span className="text-xs text-gray-400">{req.category}</span>
                    )}
                    {req.request_type && (
                      <span className="text-xs text-gray-300">{req.request_type}</span>
                    )}
                  </div>
                  {req.verified_memoni && (
                    <p className="text-sm mt-1 font-semibold text-green-700">✓ {req.verified_memoni}</p>
                  )}
                </div>
                <Link
                  to={`/admin/review/${req.id}`}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-primary hover:text-white transition-colors whitespace-nowrap"
                >
                  Review →
                </Link>
              </div>

              {/* Share link */}
              <button
                onClick={() => navigator.clipboard.writeText(`${baseUrl}/contribute/${req.share_token}`)}
                className="mt-2 text-xs text-gray-300 hover:text-primary transition-colors"
                title="Copy share link"
              >
                🔗 Copy share link
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

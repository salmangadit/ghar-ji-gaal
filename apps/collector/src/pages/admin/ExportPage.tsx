import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@ghar-ji-gaal/shared';

interface ExportWord {
  id: string;
  english: string;
  memoni: string;
  category: string | null;
  audioUrl: string | null;
}

export function ExportPage() {
  const [words, setWords] = useState<ExportWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  async function fetchVerified() {
    setLoading(true);
    const { data } = await supabase
      .from('vocabulary_requests')
      .select('id, english, verified_memoni, category, verified_audio_url')
      .eq('status', 'verified')
      .order('category')
      .order('english');

    setWords(
      (data ?? [])
        .filter((r) => r.verified_memoni)
        .map((r) => ({
          id: r.id,
          english: r.english,
          memoni: r.verified_memoni!,
          category: r.category,
          audioUrl: r.verified_audio_url,
        }))
    );
    setFetched(true);
    setLoading(false);
  }

  function downloadJSON() {
    const json = JSON.stringify(words, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memoni-vocabulary-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link to="/admin" className="text-gray-400 text-sm">← Dashboard</Link>
        <h1 className="text-base font-bold">Export verified vocabulary</h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-4">
        <div className="bg-blue-50 rounded-2xl p-4 text-sm text-blue-700 border border-blue-100">
          <p>
            This exports all <strong>verified</strong> vocabulary as JSON. Paste the output into
            <code className="mx-1 px-1 bg-blue-100 rounded text-xs">apps/teaching/src/data/vocabulary.ts</code>
            to add the community-contributed words to the teaching app.
          </p>
        </div>

        <button
          onClick={fetchVerified}
          disabled={loading}
          className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {loading ? 'Loading…' : 'Load verified words'}
        </button>

        {fetched && (
          <>
            <p className="text-sm text-gray-600 font-medium">{words.length} verified words found</p>

            {words.length > 0 && (
              <button
                onClick={downloadJSON}
                className="w-full py-3 rounded-2xl font-bold bg-gray-800 text-white active:scale-95 transition-transform"
              >
                ⬇ Download JSON
              </button>
            )}

            {/* Preview table */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">English</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Memoni</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Category</th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-semibold">Audio</th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((w) => (
                    <tr key={w.id} className="border-b border-gray-50">
                      <td className="px-4 py-2">{w.english}</td>
                      <td className="px-4 py-2 font-semibold">{w.memoni}</td>
                      <td className="px-4 py-2 text-gray-400 text-xs">{w.category ?? '—'}</td>
                      <td className="px-4 py-2 text-xs">{w.audioUrl ? '🔊' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

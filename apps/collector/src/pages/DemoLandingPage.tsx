import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_REQUESTS, getDemoResponses } from '../lib/demoData';

const EMOJI: Record<string, string> = {
  'demo-water': '💧',
  'demo-hello': '👋',
  'demo-mother': '👩',
  'demo-red': '🔴',
  'demo-eat': '🍽️',
};

export function DemoLandingPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);
  const responses = getDemoResponses();

  const base = window.location.href.replace(/#.*$/, '');

  function linkFor(token: string) {
    return `${base}#/contribute/${token}`;
  }

  async function copyLink(token: string) {
    await navigator.clipboard.writeText(linkFor(token));
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-lg mx-auto px-5 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-xl font-extrabold">Ghar ji Ghaal</h1>
        <p className="text-sm text-gray-500">Vocabulary Collector</p>
      </div>

      {/* Demo banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
        <p className="font-bold mb-1">Demo mode</p>
        <p>Copy a link below and send it to a Memoni speaker. Their submission will be saved in the browser it's opened on. Visit this page on their device to see responses, or ask them what they submitted.</p>
      </div>

      {/* Requests */}
      <div className="flex flex-col gap-3">
        <h2 className="font-bold text-gray-700">Demo vocabulary requests</h2>
        {Object.values(DEMO_REQUESTS).map((req) => {
          const count = responses.filter((r) => r.request_id === req.id).length;
          return (
            <div
              key={req.share_token}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-3"
            >
              <span className="text-2xl">{EMOJI[req.share_token] ?? '📝'}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{req.english}</p>
                <p className="text-xs text-gray-400 capitalize">{req.category} · {req.request_type.replace('-', ' ')}</p>
                {count > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-0.5">{count} response{count !== 1 ? 's' : ''}</p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => copyLink(req.share_token)}
                  className="text-xs px-3 py-1.5 rounded-xl border-2 border-gray-200 font-semibold text-gray-600 active:scale-95 transition-transform"
                >
                  {copied === req.share_token ? '✓ Copied!' : 'Copy link'}
                </button>
                <button
                  onClick={() => navigate(`/contribute/${req.share_token}`)}
                  className="text-xs px-3 py-1.5 rounded-xl font-semibold text-white active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  Try it →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Responses link */}
      {responses.length > 0 && (
        <button
          onClick={() => navigate('/demo/responses')}
          className="w-full py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-700 text-sm active:scale-95 transition-transform"
        >
          View {responses.length} response{responses.length !== 1 ? 's' : ''} →
        </button>
      )}
    </div>
  );
}

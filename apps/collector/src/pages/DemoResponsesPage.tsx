import { useNavigate } from 'react-router-dom';
import { getDemoResponses } from '../lib/demoData';

export function DemoResponsesPage() {
  const navigate = useNavigate();
  const responses = getDemoResponses();

  // Group by english word
  const grouped = responses.reduce<Record<string, typeof responses>>((acc, r) => {
    const key = r.english;
    acc[key] = acc[key] ?? [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-lg mx-auto px-5 py-8 gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 text-lg">←</button>
        <h1 className="font-extrabold text-lg">Demo Responses</h1>
      </div>

      {responses.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-3">📭</p>
          <p>No responses yet.</p>
          <p className="text-sm mt-1">Send a link from the home page to collect some.</p>
        </div>
      ) : (
        Object.entries(grouped).map(([english, items]) => (
          <div key={english}>
            <h2 className="font-bold text-gray-500 text-sm uppercase tracking-wide mb-2">{english}</h2>
            <div className="flex flex-col gap-2">
              {items.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {r.memoni_text ? (
                        <p className="font-bold text-xl">{r.memoni_text}</p>
                      ) : (
                        <p className="text-gray-400 italic text-sm">Audio only</p>
                      )}
                      {r.has_audio && (
                        <p className="text-xs text-purple-600 font-semibold mt-0.5">🎙 Audio recorded</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500">{r.contributor_name ?? 'Anonymous'}</p>
                      <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

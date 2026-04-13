import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, clusterTexts } from '@ghar-ji-gaal/shared';
import type { VocabularyRequest, VocabularyResponse } from '@ghar-ji-gaal/shared';
import { TranscriptionBadge } from '../../components/TranscriptionBadge';

export function ReviewPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<VocabularyRequest | null>(null);
  const [responses, setResponses] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedMemoni, setVerifiedMemoni] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!requestId) return;
    Promise.all([
      supabase.from('vocabulary_requests').select('*').eq('id', requestId).single(),
      supabase.from('vocabulary_responses').select('*').eq('request_id', requestId).order('created_at'),
    ]).then(([{ data: req }, { data: resp }]) => {
      setRequest(req ?? null);
      setResponses(resp ?? []);
      if (req?.verified_memoni) setVerifiedMemoni(req.verified_memoni);
      setLoading(false);
    });
  }, [requestId]);

  // Compute clusters from text responses
  const textResponses = responses.filter((r) => r.memoni_text?.trim());
  const textCluster = clusterTexts(textResponses.map((r) => r.memoni_text!));

  async function handleVerify() {
    if (!request || !verifiedMemoni.trim()) return;
    setSaving(true);

    await supabase
      .from('vocabulary_requests')
      .update({ status: 'verified', verified_memoni: verifiedMemoni.trim() })
      .eq('id', request.id);

    setSaving(false);
    navigate('/admin/requests');
  }

  async function handleReject() {
    if (!request) return;
    await supabase.from('vocabulary_requests').update({ status: 'rejected' }).eq('id', request.id);
    navigate('/admin/requests');
  }

  async function setCanonicalAudio(audioUrl: string) {
    if (!request) return;
    await supabase
      .from('vocabulary_requests')
      .update({ verified_audio_url: audioUrl })
      .eq('id', request.id);
    setRequest((r) => r ? { ...r, verified_audio_url: audioUrl } : r);
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[100dvh] text-gray-400">Loading…</div>;
  }

  if (!request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-4 text-center">
        <p className="text-gray-400">Request not found.</p>
        <Link to="/admin/requests" className="text-primary underline">Back to requests</Link>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link to="/admin/requests" className="text-gray-400 text-sm">← Requests</Link>
        <h1 className="text-base font-bold flex-1">Review: <em>{request.english}</em></h1>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-6 space-y-6">
        {/* Request info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-2xl font-extrabold">{request.english}</p>
          {request.context && <p className="text-sm text-gray-500 mt-1 italic">{request.context}</p>}
          <p className="text-xs text-gray-400 mt-1">{request.request_type} · {request.category}</p>
          <p className="text-xs text-gray-400 mt-0.5">{responses.length} response{responses.length !== 1 ? 's' : ''} collected</p>
        </div>

        {/* Fuzzy clusters */}
        {textCluster.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-600 mb-2">
              Text response clusters
              <span className="text-gray-400 font-normal ml-1">(grouped by similarity, largest first)</span>
            </h2>
            <div className="space-y-2">
              {textCluster.map((group, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${
                    idx === 0 ? 'border-amber-300' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-lg">{group[0]}</p>
                      <p className="text-xs text-gray-400">
                        {group.length} response{group.length > 1 ? 's' : ''} in this cluster
                        {group.length > 1 && ` · variants: ${group.slice(1).join(', ')}`}
                      </p>
                    </div>
                    <button
                      onClick={() => setVerifiedMemoni(group[0]!)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${
                        verifiedMemoni === group[0]
                          ? 'text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white'
                      }`}
                      style={verifiedMemoni === group[0] ? { backgroundColor: 'var(--color-primary)' } : {}}
                    >
                      {verifiedMemoni === group[0] ? '✓ Selected' : 'Use this'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All responses with audio */}
        <div>
          <h2 className="text-sm font-bold text-gray-600 mb-2">All responses (audio)</h2>
          {responses.length === 0 ? (
            <p className="text-sm text-gray-400">No responses yet.</p>
          ) : (
            <div className="space-y-2">
              {responses.map((resp) => (
                <div key={resp.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      {resp.contributor_name && (
                        <p className="text-xs text-gray-400 mb-1">From: {resp.contributor_name}</p>
                      )}
                      {resp.memoni_text && (
                        <p className="font-bold">{resp.memoni_text}</p>
                      )}
                      {resp.audio_url && (
                        <div className="mt-2">
                          <audio src={resp.audio_url} controls className="w-full h-10" />
                          {resp.ai_transcription && (
                            <div className="mt-1.5 space-y-1">
                              <TranscriptionBadge />
                              <p className="text-xs text-gray-500">
                                AI (Whisper/{resp.ai_transcription_lang ?? 'ur'}):{' '}
                                <em>{resp.ai_transcription}</em>
                              </p>
                            </div>
                          )}
                          <button
                            onClick={() => setCanonicalAudio(resp.audio_url!)}
                            className={`mt-2 text-xs font-bold px-3 py-1 rounded-lg transition-colors ${
                              request.verified_audio_url === resp.audio_url
                                ? 'text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                            style={request.verified_audio_url === resp.audio_url ? { backgroundColor: 'var(--color-success)' } : {}}
                          >
                            {request.verified_audio_url === resp.audio_url ? '🔊 Canonical audio' : 'Set as canonical audio'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-300 mt-1">{new Date(resp.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Final decision */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-700 mb-3">Final Memoni spelling</h2>
          <input
            type="text"
            value={verifiedMemoni}
            onChange={(e) => setVerifiedMemoni(e.target.value)}
            placeholder="Type the verified Memoni word…"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-primary transition-colors"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <p className="text-xs text-gray-400 mt-1">
            Listen to all audio, look at the clusters, then type the final accepted spelling.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleVerify}
            disabled={!verifiedMemoni.trim() || saving}
            className="flex-1 py-3 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            {saving ? 'Saving…' : '✓ Verify'}
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-3 rounded-2xl font-bold bg-gray-100 text-gray-600 active:scale-95 transition-transform"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

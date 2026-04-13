import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@ghar-ji-gaal/shared';
import type { VocabularyRequest } from '@ghar-ji-gaal/shared';
import { AudioRecorder } from '../components/AudioRecorder';

type SubmitState = 'idle' | 'submitting' | 'done' | 'error';
type InputMode = 'text' | 'audio';

const CHAR_LIMIT_WORD = 50;
const CHAR_LIMIT_PHRASE = 120;

export function ContributePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<VocabularyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mode, setMode] = useState<InputMode>('text');
  const [text, setText] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [name, setName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [showPreview, setShowPreview] = useState(false);

  const charLimit = request?.request_type === 'single-word' ? CHAR_LIMIT_WORD : CHAR_LIMIT_PHRASE;

  useEffect(() => {
    if (!token) return;
    supabase
      .from('vocabulary_requests')
      .select('*')
      .eq('share_token', token)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setNotFound(true);
        } else {
          setRequest(data);
        }
        setLoading(false);
      });
  }, [token]);

  async function handleSubmit() {
    if (!request) return;
    if (!text.trim() && !audioBlob) return;

    setSubmitState('submitting');

    let audioUrl: string | null = null;

    // Upload audio to Supabase Storage if provided
    if (audioBlob) {
      const fileName = `${request.id}/${Date.now()}.webm`;
      const { error: uploadError } = await supabase.storage
        .from('response-audio')
        .upload(fileName, audioBlob, { contentType: 'audio/webm' });

      if (uploadError) {
        console.error('Audio upload failed:', uploadError);
        setSubmitState('error');
        return;
      }

      const { data: urlData } = supabase.storage
        .from('response-audio')
        .getPublicUrl(fileName);
      audioUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('vocabulary_responses').insert({
      request_id: request.id,
      contributor_name: name.trim() || null,
      memoni_text: text.trim() || null,
      audio_url: audioUrl,
    });

    if (error) {
      console.error('Submission error:', error);
      setSubmitState('error');
      return;
    }

    setSubmitState('done');
    navigate('/thank-you');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[100dvh]">
        <div className="text-gray-400 text-sm">Loading…</div>
      </div>
    );
  }

  if (notFound || !request) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6 gap-4 text-center">
        <div className="text-5xl">🔍</div>
        <h1 className="text-xl font-bold">Link not found</h1>
        <p className="text-gray-500 text-sm">This contribution link may have expired or been removed.</p>
      </div>
    );
  }

  const isTypeSingleWord = request.request_type === 'single-word';
  const canSubmit = (text.trim().length > 0 || audioBlob !== null) && submitState === 'idle';

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-lg mx-auto px-5 py-8 gap-6">
      {/* Header */}
      <div className="text-center">
        <div className="text-4xl mb-2">🏠</div>
        <h1 className="text-xl font-extrabold">Ghar ji Ghaal</h1>
        <p className="text-sm text-gray-500">Help us preserve the Memoni language</p>
      </div>

      {/* Request card */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            {isTypeSingleWord ? 'ONE WORD ONLY' : request.request_type === 'short-phrase' ? 'SHORT PHRASE' : 'SENTENCE'}
          </span>
          {request.category && (
            <span className="text-xs text-gray-400 capitalize">{request.category}</span>
          )}
        </div>
        <p className="text-3xl font-extrabold mt-2">{request.english}</p>
        {request.context && (
          <p className="text-sm text-gray-500 mt-2 italic">{request.context}</p>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 rounded-2xl p-4 text-sm text-amber-800 border border-amber-100">
        {isTypeSingleWord ? (
          <p>Please type or say <strong>just the one word</strong> — write it exactly how you'd pronounce it in Memoni.</p>
        ) : (
          <p>Type or say the <strong>full phrase or expression</strong> you'd naturally use in Memoni.</p>
        )}
      </div>

      {/* Mode toggle */}
      <div className="flex rounded-2xl overflow-hidden border-2 border-gray-200">
        {(['text', 'audio'] as InputMode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); setAudioBlob(null); }}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors capitalize ${
              mode === m ? 'text-white' : 'text-gray-500 bg-white'
            }`}
            style={mode === m ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            {m === 'text' ? '✏️ Type' : '🎙 Record'}
          </button>
        ))}
      </div>

      {/* Input */}
      {mode === 'text' ? (
        <div>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, charLimit))}
            placeholder={isTypeSingleWord ? 'e.g. Paani' : 'Type the phrase…'}
            className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none focus:border-primary transition-colors"
            autoFocus
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {/* Preview */}
          {text.trim() && (
            <div className="mt-2 p-3 bg-gray-50 rounded-xl">
              <p className="text-xs text-gray-400 mb-0.5">You wrote:</p>
              <p className="font-bold text-lg">{text.trim()}</p>
              <p className="text-xs text-gray-400 mt-0.5">Does that look right?</p>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-1 text-right">{text.length}/{charLimit}</p>
        </div>
      ) : (
        <AudioRecorder onBlob={(b) => { setAudioBlob(b); }} />
      )}

      {/* Optional name */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-1">
          Your name (optional)
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Nani Fatima"
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 active:scale-95 transition-all"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {submitState === 'submitting' ? 'Submitting…' : 'Submit my response →'}
      </button>

      {submitState === 'error' && (
        <p className="text-sm text-red-500 text-center">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}

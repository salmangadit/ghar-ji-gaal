import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { nanoid } from 'nanoid';
import { supabase } from '@ghar-ji-gaal/shared';
import type { RequestType } from '@ghar-ji-gaal/shared';

const CATEGORIES = ['greetings', 'family', 'numbers', 'colours', 'food-home', 'verbs', 'adjectives', 'other'];

const TYPE_META: Record<RequestType, { label: string; hint: string; placeholder: string }> = {
  'single-word': {
    label: 'Single word',
    hint: 'Best for nouns, numbers, colours. Responses cluster most reliably.',
    placeholder: 'e.g. water',
  },
  'short-phrase': {
    label: 'Short phrase',
    hint: 'For greetings and fixed expressions (2–6 words).',
    placeholder: 'e.g. thank you',
  },
  'sentence': {
    label: 'Sentence in context',
    hint: 'For verbs and grammar — include context so the contributor knows what register to use.',
    placeholder: "e.g. Let's eat (called from kitchen)",
  },
};

export function NewRequestPage() {
  const navigate = useNavigate();
  const [english, setEnglish] = useState('');
  const [context, setContext] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState<RequestType>('single-word');
  const [submitting, setSubmitting] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const baseUrl = window.location.origin;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!english.trim()) return;
    setSubmitting(true);

    const token = nanoid(12);

    const { error } = await supabase.from('vocabulary_requests').insert({
      english: english.trim(),
      context: context.trim() || null,
      category: category || null,
      request_type: type,
      share_token: token,
      status: 'pending',
    });

    if (error) {
      alert('Error creating request: ' + error.message);
      setSubmitting(false);
      return;
    }

    setCreatedLink(`${baseUrl}/contribute/${token}`);
    setSubmitting(false);
  }

  async function handleCopy() {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    if (!createdLink) return;
    if (navigator.share) {
      await navigator.share({
        title: `Help with "${english}" in Memoni`,
        text: `Do you speak Memoni? We need your help! What is the Memoni word/phrase for "${english}"?`,
        url: createdLink,
      });
    } else {
      handleCopy();
    }
  }

  if (createdLink) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center px-6 gap-6 max-w-lg mx-auto text-center">
        <div className="text-5xl">🔗</div>
        <div>
          <h2 className="text-xl font-extrabold">Link created!</h2>
          <p className="text-gray-500 text-sm mt-1">
            Share this with Memoni speakers to collect translations of "<strong>{english}</strong>"
          </p>
        </div>

        <div className="w-full bg-gray-100 rounded-2xl p-4 text-sm font-mono text-gray-700 break-all text-left">
          {createdLink}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleShare}
            className="w-full py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Share link
          </button>
          <button
            onClick={handleCopy}
            className="w-full py-3 rounded-2xl font-bold bg-gray-100 text-gray-700 active:scale-95 transition-transform"
          >
            {copied ? '✓ Copied!' : 'Copy link'}
          </button>
          <button
            onClick={() => { setCreatedLink(null); setEnglish(''); setContext(''); }}
            className="text-sm text-gray-400 underline"
          >
            Create another
          </button>
          <Link to="/admin" className="text-sm text-gray-400 underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-3">
        <Link to="/admin" className="text-gray-400">← Back</Link>
        <h1 className="text-base font-bold">New vocabulary request</h1>
      </header>

      <form onSubmit={handleCreate} className="max-w-lg mx-auto px-6 py-6 space-y-5">
        {/* Type */}
        <div>
          <p className="text-sm font-bold text-gray-700 mb-2">Request type</p>
          <div className="flex flex-col gap-2">
            {(Object.keys(TYPE_META) as RequestType[]).map((t) => {
              const meta = TYPE_META[t];
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`text-left p-3 rounded-xl border-2 transition-colors ${
                    type === t ? 'border-primary bg-primary/5' : 'border-gray-200 bg-white'
                  }`}
                >
                  <p className="font-semibold text-sm">{meta.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{meta.hint}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* English word */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">
            English word / phrase
          </label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            required
            placeholder={TYPE_META[type].placeholder}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Context hint */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">
            Context hint <span className="font-normal text-gray-400">(shown to contributor)</span>
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={2}
            placeholder="e.g. Just the standalone word — what you'd say if asked 'what is water in Memoni?'"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-bold text-gray-700 block mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors bg-white"
          >
            <option value="">— select category —</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={!english.trim() || submitting}
          className="w-full py-4 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {submitting ? 'Creating…' : 'Create & get link →'}
        </button>
      </form>
    </div>
  );
}

import { useState, useRef } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { TopBar } from '../components/layout/TopBar';
import { AudioButton } from '../components/lesson/AudioButton';
import { VOCAB_WORDS } from '../data/vocabulary';
import { TOPICS_BY_ID } from '../data/topics';
import { saveAudioBlob, deleteAudioBlob } from '../hooks/useAudio';
import { useAudioStore } from '../store/audioStore';
import type { VocabWord } from '../types/vocabulary';

type RecordingState = 'idle' | 'recording' | 'preview';

function AudioRecorder({ word, onSaved }: { word: VocabWord; onSaved: () => void }) {
  const [state, setState] = useState<RecordingState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setPreviewBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        setState('preview');
      };
      mr.start();
      mediaRef.current = mr;
      setState('recording');
    } catch {
      alert('Microphone access denied. Please allow mic permissions and try again.');
    }
  }

  function stopRecording() {
    mediaRef.current?.stop();
    mediaRef.current = null;
  }

  async function handleSave() {
    if (!previewBlob) return;
    await saveAudioBlob(word.id, previewBlob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setState('idle');
    onSaved();
  }

  function handleDiscard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setState('idle');
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      {state === 'idle' && (
        <button
          onClick={startRecording}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          🎙 Record
        </button>
      )}
      {state === 'recording' && (
        <button
          onClick={stopRecording}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-red-500 text-white animate-pulse"
        >
          ⏹ Stop
        </button>
      )}
      {state === 'preview' && previewUrl && (
        <div className="flex items-center gap-2">
          <audio src={previewUrl} controls className="h-7" />
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-white"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            Save
          </button>
          <button
            onClick={handleDiscard}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100"
          >
            Redo
          </button>
        </div>
      )}
    </div>
  );
}

function FileUploader({ word, onSaved }: { word: VocabWord; onSaved: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (mp3, wav, m4a, etc.)');
      return;
    }
    await saveAudioBlob(word.id, file);
    onSaved();
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFile}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600"
      >
        📁 Upload file
      </button>
    </>
  );
}

export function ParentPortalPage() {
  const audioManifest = useAudioStore((s) => s.audioManifest);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [savedBadge, setSavedBadge] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'recorded'>('all');

  const filteredWords = VOCAB_WORDS.filter((w) => {
    if (filter === 'missing') return !audioManifest[w.id];
    if (filter === 'recorded') return !!audioManifest[w.id];
    return true;
  });

  const recordedCount = VOCAB_WORDS.filter((w) => !!audioManifest[w.id]).length;

  function handleSaved(wordId: string) {
    setSavedBadge(wordId);
    setTimeout(() => setSavedBadge(null), 2000);
    setExpandedWord(null);
  }

  async function handleDelete(wordId: string) {
    if (!confirm('Delete this recording?')) return;
    await deleteAudioBlob(wordId);
  }

  const topicForWord = (w: VocabWord) => TOPICS_BY_ID[w.topicId];

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <TopBar showBack title="Parent Portal" />

      <div className="px-6 pt-4 pb-2">
        {/* Progress summary */}
        <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-3 mb-4">
          <div className="text-3xl">🎙</div>
          <div>
            <p className="font-bold text-sm">Audio Progress</p>
            <p className="text-xs text-gray-400">
              {recordedCount} / {VOCAB_WORDS.length} words recorded
            </p>
          </div>
          <div className="ml-auto">
            <div className="w-16 bg-gray-100 rounded-full h-2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(recordedCount / VOCAB_WORDS.length) * 100}%`,
                  backgroundColor: 'var(--color-success)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4">
          {(['all', 'missing', 'recorded'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filter === f ? 'text-white' : 'bg-gray-100 text-gray-500'
              }`}
              style={filter === f ? { backgroundColor: 'var(--color-primary)' } : {}}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto px-6 pb-safe pb-8 space-y-2">
        {filteredWords.map((word) => {
          const hasAudio = !!audioManifest[word.id];
          const isExpanded = expandedWord === word.id;
          const topic = topicForWord(word);

          return (
            <div
              key={word.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setExpandedWord(isExpanded ? null : word.id)}
                className="w-full flex items-center gap-3 p-3 text-left"
              >
                <span className="text-xl">{word.emoji}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{word.memoni}</p>
                  <p className="text-xs text-gray-400">{word.english}</p>
                </div>
                {/* Topic badge */}
                {topic && (
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white font-medium ${topic.color}`}>
                    {topic.name}
                  </span>
                )}
                {/* Audio status */}
                <span className={`text-xs font-semibold ${hasAudio ? 'text-green-500' : 'text-gray-300'}`}>
                  {hasAudio ? '🔊' : '○'}
                </span>
                {savedBadge === word.id && (
                  <span className="text-xs text-green-500 font-bold">Saved!</span>
                )}
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 flex flex-col gap-2 border-t border-gray-50 pt-3">
                      <div className="flex items-center gap-2">
                        <AudioButton wordId={word.id} size="sm" />
                        {hasAudio && (
                          <button
                            onClick={() => handleDelete(word.id)}
                            className="text-xs text-red-400 underline"
                          >
                            Delete recording
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <AudioRecorder word={word} onSaved={() => handleSaved(word.id)} />
                        <FileUploader word={word} onSaved={() => handleSaved(word.id)} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

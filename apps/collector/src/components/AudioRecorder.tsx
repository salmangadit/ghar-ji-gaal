import { useState, useRef } from 'react';

interface AudioRecorderProps {
  onBlob: (blob: Blob) => void;
  disabled?: boolean;
}

type State = 'idle' | 'recording' | 'preview';

/**
 * Mobile-optimised audio recorder.
 * Records via MediaRecorder API, shows a preview, then calls onBlob with the final blob.
 * Caller decides what to do with the blob (upload, transcribe, etc.)
 */
export function AudioRecorder({ onBlob, disabled }: AudioRecorderProps) {
  const [state, setState] = useState<State>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
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
      alert('Microphone access is required. Please allow mic permissions and try again.');
    }
  }

  function stop() {
    mediaRef.current?.stop();
    mediaRef.current = null;
  }

  function accept() {
    if (!previewBlob) return;
    onBlob(previewBlob);
    discard();
  }

  function discard() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewBlob(null);
    setState('idle');
  }

  if (state === 'idle') {
    return (
      <button
        type="button"
        onClick={start}
        disabled={disabled}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm border-2 border-dashed border-primary text-primary disabled:opacity-40 active:scale-95 transition-transform w-full justify-center"
      >
        🎙 Tap to record audio
      </button>
    );
  }

  if (state === 'recording') {
    return (
      <button
        type="button"
        onClick={stop}
        className="flex items-center gap-2 px-4 py-3 rounded-2xl font-semibold text-sm bg-red-500 text-white w-full justify-center animate-pulse active:scale-95"
      >
        ⏹ Recording… tap to stop
      </button>
    );
  }

  // preview
  return (
    <div className="flex flex-col gap-2 w-full">
      <p className="text-xs text-gray-500 font-medium">Preview your recording:</p>
      <audio src={previewUrl ?? ''} controls className="w-full h-10" />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={accept}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white"
          style={{ backgroundColor: 'var(--color-success)' }}
        >
          ✓ Use this
        </button>
        <button
          type="button"
          onClick={discard}
          className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

import { useCallback, useEffect } from 'react';
import { openDB } from 'idb';
import { useAudioStore } from '../store/audioStore';

const DB_NAME = 'gjg-audio';
const STORE_NAME = 'blobs';
const DB_VERSION = 1;

async function getAudioDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
}

/** Load all audio blobs from IndexedDB and register their object URLs. */
export async function loadAudioManifest() {
  const { registerAudio } = useAudioStore.getState();
  const db = await getAudioDB();
  const keys = await db.getAllKeys(STORE_NAME);
  for (const key of keys) {
    const blob: Blob | undefined = await db.get(STORE_NAME, key);
    if (blob) {
      const url = URL.createObjectURL(blob);
      registerAudio(String(key), url);
    }
  }
}

/** Save an audio blob to IndexedDB and register its object URL. */
export async function saveAudioBlob(wordId: string, blob: Blob): Promise<void> {
  const { registerAudio } = useAudioStore.getState();
  const db = await getAudioDB();
  await db.put(STORE_NAME, blob, wordId);
  const url = URL.createObjectURL(blob);
  registerAudio(wordId, url);
}

/** Delete an audio blob from IndexedDB and revoke its object URL. */
export async function deleteAudioBlob(wordId: string): Promise<void> {
  const { audioManifest, unregisterAudio } = useAudioStore.getState();
  const db = await getAudioDB();
  await db.delete(STORE_NAME, wordId);
  const url = audioManifest[wordId];
  if (url) URL.revokeObjectURL(url);
  unregisterAudio(wordId);
}

let activeAudio: HTMLAudioElement | null = null;

/**
 * Hook for playing word audio. Returns a play function that:
 * - Stops any currently playing audio
 * - Is a no-op (with visual feedback) if no audio exists for the wordId
 */
export function useAudio() {
  const { audioManifest, currentlyPlaying, setCurrentlyPlaying, hasAudio } = useAudioStore();

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (activeAudio) {
        activeAudio.pause();
        activeAudio = null;
        setCurrentlyPlaying(null);
      }
    };
  }, [setCurrentlyPlaying]);

  const play = useCallback(
    (wordId: string) => {
      if (!hasAudio(wordId)) return;

      // Stop current
      if (activeAudio) {
        activeAudio.pause();
        activeAudio.currentTime = 0;
        activeAudio = null;
        setCurrentlyPlaying(null);
      }

      const url = audioManifest[wordId];
      if (!url) return;

      const audio = new Audio(url);
      activeAudio = audio;
      setCurrentlyPlaying(wordId);

      audio.onended = () => {
        setCurrentlyPlaying(null);
        activeAudio = null;
      };
      audio.onerror = () => {
        setCurrentlyPlaying(null);
        activeAudio = null;
      };

      // iOS requires play() to be called from a user gesture — this hook is
      // always invoked from button click handlers, so it satisfies that requirement.
      audio.play().catch(() => {
        setCurrentlyPlaying(null);
        activeAudio = null;
      });
    },
    [audioManifest, hasAudio, setCurrentlyPlaying]
  );

  const stop = useCallback(() => {
    if (activeAudio) {
      activeAudio.pause();
      activeAudio.currentTime = 0;
      activeAudio = null;
      setCurrentlyPlaying(null);
    }
  }, [setCurrentlyPlaying]);

  return { play, stop, currentlyPlaying, hasAudio };
}

import { create } from 'zustand';

interface AudioStore {
  // wordId → object URL (created from IndexedDB blob)
  audioManifest: Record<string, string>;
  currentlyPlaying: string | null;
  // Actions
  registerAudio: (wordId: string, objectUrl: string) => void;
  unregisterAudio: (wordId: string) => void;
  setCurrentlyPlaying: (wordId: string | null) => void;
  hasAudio: (wordId: string) => boolean;
}

// NOT persisted — object URLs are ephemeral. Audio blobs live in IndexedDB (see useAudio.ts).
export const useAudioStore = create<AudioStore>()((set, get) => ({
  audioManifest: {},
  currentlyPlaying: null,

  registerAudio(wordId, objectUrl) {
    set((s) => ({ audioManifest: { ...s.audioManifest, [wordId]: objectUrl } }));
  },

  unregisterAudio(wordId) {
    set((s) => {
      const next = { ...s.audioManifest };
      delete next[wordId];
      return { audioManifest: next };
    });
  },

  setCurrentlyPlaying(wordId) {
    set({ currentlyPlaying: wordId });
  },

  hasAudio(wordId) {
    return wordId in get().audioManifest;
  },
}));

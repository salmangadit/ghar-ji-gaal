import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import type { Profile } from '../types/profile';
import type { AgeTrack } from '../types/vocabulary';

interface ProfileStore {
  profiles: Profile[];
  activeProfileId: string | null;
  // Actions
  createProfile: (name: string, avatarEmoji: string, ageTrack: AgeTrack) => Profile;
  deleteProfile: (id: string) => void;
  setActiveProfile: (id: string | null) => void;
  getActiveProfile: () => Profile | null;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: null,

      createProfile(name, avatarEmoji, ageTrack) {
        const profile: Profile = {
          id: nanoid(),
          name,
          avatarEmoji,
          ageTrack,
          createdAt: Date.now(),
        };
        set((s) => ({ profiles: [...s.profiles, profile] }));
        return profile;
      },

      deleteProfile(id) {
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        }));
      },

      setActiveProfile(id) {
        set({ activeProfileId: id });
      },

      getActiveProfile() {
        const { profiles, activeProfileId } = get();
        return profiles.find((p) => p.id === activeProfileId) ?? null;
      },
    }),
    {
      name: 'gjg-profiles',
      version: 1,
    }
  )
);

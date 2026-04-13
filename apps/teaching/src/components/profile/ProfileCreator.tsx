import { useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarPicker } from './AvatarPicker';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore } from '../../store/progressStore';
import type { AgeTrack } from '../../types/vocabulary';

const AGE_TRACKS: { id: AgeTrack; label: string; ages: string; emoji: string; desc: string }[] = [
  { id: 'tiny-tots',     label: 'Tiny Tots',      ages: '4–5',   emoji: '🐣', desc: 'Tap pictures & listen' },
  { id: 'young-learner', label: 'Young Learner',  ages: '6–8',   emoji: '📚', desc: 'Multiple choice' },
  { id: 'explorer',      label: 'Explorer',       ages: '9–11',  emoji: '🧭', desc: 'Fill in the blank' },
  { id: 'teen',          label: 'Teen',           ages: '12–14', emoji: '✏️', desc: 'Type the answer' },
];

interface ProfileCreatorProps {
  onDone: (profileId: string) => void;
  onCancel: () => void;
}

export function ProfileCreator({ onDone, onCancel }: ProfileCreatorProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦁');
  const [track, setTrack] = useState<AgeTrack>('young-learner');

  const createProfile = useProfileStore((s) => s.createProfile);
  const ensureProfileProgress = useProgressStore((s) => s.ensureProfileProgress);

  function handleCreate() {
    if (!name.trim()) return;
    const profile = createProfile(name.trim(), avatar, track);
    ensureProfileProgress(profile.id);
    onDone(profile.id);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="flex flex-col gap-6 p-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">New Profile</h2>
        <button onClick={onCancel} className="text-gray-400 text-2xl leading-none">×</button>
      </div>

      {/* Avatar */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">Choose an avatar</p>
        <AvatarPicker selected={avatar} onChange={setAvatar} />
      </div>

      {/* Name */}
      <div>
        <label className="text-sm font-semibold text-gray-600 block mb-1" htmlFor="profile-name">
          Name
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Zara"
          maxLength={20}
          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base font-medium focus:outline-none focus:border-primary transition-colors"
          style={{ '--tw-ring-color': 'var(--color-primary)' } as React.CSSProperties}
          autoFocus
        />
      </div>

      {/* Age Track */}
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">Learning level</p>
        <div className="flex flex-col gap-2">
          {AGE_TRACKS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTrack(t.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                track === t.id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <span className="text-2xl">{t.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm">
                  {t.label}
                  <span className="text-gray-400 font-normal ml-1">(ages {t.ages})</span>
                </div>
                <div className="text-xs text-gray-500">{t.desc}</div>
              </div>
              {track === t.id && (
                <span style={{ color: 'var(--color-primary)' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={!name.trim()}
        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        Let's go! {avatar}
      </button>
    </motion.div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ProfileCreator } from '../components/profile/ProfileCreator';
import { useProfileStore } from '../store/profileStore';
import { useProgressStore, getLevel } from '../store/progressStore';

export function ProfileSelectPage() {
  const navigate = useNavigate();
  const profiles = useProfileStore((s) => s.profiles);
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const deleteProfile = useProfileStore((s) => s.deleteProfile);
  const getProgress = useProgressStore((s) => s.getProgress);
  const [creating, setCreating] = useState(false);

  function handleSelect(id: string) {
    setActiveProfile(id);
    navigate('/dashboard');
  }

  function handleCreated(id: string) {
    setActiveProfile(id);
    navigate('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Header */}
      <div className="px-6 pt-safe pt-8 pb-4 text-center">
        <div className="text-5xl mb-3">🏠</div>
        <h1 className="text-2xl font-extrabold">Ghar ji Ghaal</h1>
        <p className="text-sm text-gray-500 mt-1">Learn Memoni at home</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {creating ? (
            <ProfileCreator
              key="creator"
              onDone={handleCreated}
              onCancel={() => setCreating(false)}
            />
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col gap-3"
            >
              {profiles.length > 0 && (
                <p className="text-sm font-semibold text-gray-500 mb-1">Who's learning?</p>
              )}

              {profiles.map((profile) => {
                const progress = getProgress(profile.id);
                const level = getLevel(progress.totalXP);
                return (
                  <motion.button
                    key={profile.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => handleSelect(profile.id)}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-98 transition-transform text-left w-full"
                  >
                    <span className="text-4xl">{profile.avatarEmoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-base">{profile.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        Level {level} · {progress.streak > 0 ? `🔥 ${progress.streak} day streak` : 'Just starting'}
                      </div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-300">
                      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                );
              })}

              {/* Add new profile */}
              <button
                onClick={() => setCreating(true)}
                className="flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 font-semibold active:scale-98 transition-transform"
              >
                <span className="text-xl">+</span>
                <span>Add profile</span>
              </button>

              {/* Parent portal link */}
              <button
                onClick={() => navigate('/parent')}
                className="mt-2 text-xs text-gray-400 underline text-center"
              >
                Parent Portal
              </button>

              {/* Delete profiles (long press in real app — here a simple trash button) */}
              {profiles.length > 0 && (
                <div className="mt-4 space-y-1">
                  {profiles.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs text-gray-300 px-1">
                      <span>{p.avatarEmoji} {p.name}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete ${p.name}'s profile?`)) deleteProfile(p.id);
                        }}
                        className="text-gray-300 hover:text-error transition-colors"
                        aria-label={`Delete ${p.name}`}
                      >
                        🗑
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useProfileStore } from '../../store/profileStore';
import { useProgressStore, getLevel } from '../../store/progressStore';

interface TopBarProps {
  showBack?: boolean;
  title?: string;
}

export function TopBar({ showBack = false, title }: TopBarProps) {
  const navigate = useNavigate();
  const activeProfile = useProfileStore((s) => s.getActiveProfile());
  const getProgress = useProgressStore((s) => s.getProgress);
  const progress = activeProfile ? getProgress(activeProfile.id) : null;
  const level = progress ? getLevel(progress.totalXP) : 0;
  const xpInLevel = progress ? progress.totalXP % 100 : 0;
  const streak = progress?.streak ?? 0;

  return (
    <header className="flex items-center gap-3 px-4 pt-safe pt-3 pb-3 sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-black/5">
      {showBack && (
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 rounded-full active:bg-black/10 transition-colors"
          aria-label="Go back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      <div className="flex-1">
        {title ? (
          <h1 className="font-bold text-base leading-tight">{title}</h1>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-full bg-black/10 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${xpInLevel}%`, backgroundColor: 'var(--color-xp)' }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 shrink-0">Lv {level}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-lg leading-none">🔥</span>
            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
              {streak}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}

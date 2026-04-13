import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarRating } from '../components/gamification/StarRating';
import { useProgressStore, getLevel } from '../store/progressStore';
import { useProfileStore } from '../store/profileStore';
import { LESSONS_BY_ID } from '../data/topics';
import type { QuizResult } from '../types/quiz';

export function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result as QuizResult | undefined;
  const applied = useRef(false);

  const applyQuizResult = useProgressStore((s) => s.applyQuizResult);
  const getProgress = useProgressStore((s) => s.getProgress);
  const activeProfile = useProfileStore((s) => s.getActiveProfile());

  useEffect(() => {
    if (result && !applied.current) {
      applied.current = true;
      applyQuizResult(result);
    }
  }, [result, applyQuizResult]);

  if (!result || !activeProfile) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const lesson = LESSONS_BY_ID[result.lessonId];
  const progress = getProgress(activeProfile.id);
  const level = getLevel(progress.totalXP);
  const prevLevel = getLevel(progress.totalXP - result.xpEarned);
  const leveledUp = level > prevLevel;

  const correctCount = result.attempts.filter((a) => a.correct).length;

  return (
    <div className="flex flex-col min-h-[100dvh] items-center justify-center px-6 py-8 gap-6">
      {/* Celebration header */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="text-center"
      >
        <div className="text-7xl mb-2">
          {result.stars === 3 ? '🏆' : result.stars === 2 ? '🎉' : '✨'}
        </div>
        <h1 className="text-2xl font-extrabold">
          {result.stars === 3 ? 'Perfect!' : result.stars === 2 ? 'Great job!' : 'Lesson complete!'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{lesson?.title}</p>
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <StarRating stars={result.stars} size="lg" animate />
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-white rounded-2xl p-5 shadow-sm flex justify-around"
      >
        <div className="text-center">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-xp)' }}>
            +{result.xpEarned}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">XP earned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">
            {correctCount}/{result.attempts.length}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">Correct</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-700">🔥 {progress.streak}</div>
          <div className="text-xs text-gray-400 mt-0.5">Day streak</div>
        </div>
      </motion.div>

      {/* Level up banner */}
      {leveledUp && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: 'spring' }}
          className="w-full rounded-2xl p-4 text-center text-white font-bold"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          🎊 Level up! You reached Level {level}!
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full flex flex-col gap-3"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-4 rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Back to Dashboard
        </button>
        {result.stars < 3 && (
          <button
            onClick={() => navigate(`/lesson/${result.lessonId}`)}
            className="w-full py-3 rounded-2xl font-semibold border-2 border-gray-200 text-gray-600 active:scale-95 transition-transform"
          >
            Try again for ⭐⭐⭐
          </button>
        )}
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { StarRating } from '../gamification/StarRating';
import type { Lesson, Topic } from '../../types/vocabulary';

interface LessonNodeProps {
  lesson: Lesson;
  topic: Topic;
  stars: 0 | 1 | 2 | 3;
  unlocked: boolean;
  isFirst: boolean;
}

export function LessonNode({ lesson, topic, stars, unlocked, isFirst }: LessonNodeProps) {
  const navigate = useNavigate();
  const isComplete = stars > 0;

  function handleTap() {
    if (unlocked) navigate(`/lesson/${lesson.id}`);
  }

  return (
    <motion.div
      className="flex flex-col items-center"
      initial={isFirst ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Connector line above (except first in topic) */}
      {lesson.order > 1 && (
        <div
          className={`w-0.5 h-6 ${isComplete ? 'bg-emerald-400' : 'bg-gray-200'}`}
        />
      )}

      <motion.button
        onClick={handleTap}
        disabled={!unlocked}
        whileHover={unlocked ? { scale: 1.05 } : {}}
        whileTap={unlocked ? { scale: 0.95 } : {}}
        className={`relative w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-md border-4 transition-colors
          ${isComplete
            ? 'bg-white border-emerald-400'
            : unlocked
            ? `bg-white border-${topic.color.replace('bg-', '')}`
            : 'bg-gray-100 border-gray-200 opacity-60'
          }`}
        aria-label={`${lesson.title} — ${unlocked ? (isComplete ? `${stars} stars` : 'start') : 'locked'}`}
      >
        {!unlocked ? (
          <span className="text-2xl">🔒</span>
        ) : isComplete ? (
          <>
            <span className="text-2xl">{topic.emoji}</span>
          </>
        ) : (
          <span className="text-2xl">{topic.emoji}</span>
        )}

        {/* Star row below icon */}
        {unlocked && (
          <div className="absolute -bottom-5">
            <StarRating stars={stars} size="sm" />
          </div>
        )}
      </motion.button>

      {/* Lesson title */}
      <p className={`mt-8 text-xs font-semibold text-center px-1 ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
        {lesson.title}
      </p>
    </motion.div>
  );
}

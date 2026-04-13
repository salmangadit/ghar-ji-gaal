import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { TopBar } from '../components/layout/TopBar';
import { FlashcardDeck } from '../components/lesson/FlashcardDeck';
import { QuizOrchestrator } from '../components/quiz/QuizOrchestrator';
import { LESSONS_BY_ID } from '../data/topics';
import { VOCAB_BY_ID } from '../data/vocabulary';
import { buildQuizQuestions } from '../utils/quizBuilder';
import { useProfileStore } from '../store/profileStore';
import type { QuizResult } from '../types/quiz';

type Phase = 'intro' | 'flashcards' | 'quiz';

export function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const activeProfile = useProfileStore((s) => s.getActiveProfile());
  const [phase, setPhase] = useState<Phase>('intro');

  const lesson = lessonId ? LESSONS_BY_ID[lessonId] : null;
  const lessonWords = useMemo(
    () => (lesson ? lesson.wordIds.map((id) => VOCAB_BY_ID[id]).filter(Boolean) : []),
    [lesson]
  );
  const questions = useMemo(
    () => (activeProfile && lessonWords.length > 0 ? buildQuizQuestions(lessonWords as NonNullable<typeof lessonWords[0]>[], activeProfile.ageTrack) : []),
    [lessonWords, activeProfile]
  );

  if (!lesson || !activeProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] px-6">
        <p className="text-gray-400">Lesson not found.</p>
        <button onClick={() => navigate('/dashboard')} className="mt-4 text-primary underline">
          Back to dashboard
        </button>
      </div>
    );
  }

  function handleQuizComplete(result: QuizResult) {
    navigate('/results', { state: { result }, replace: true });
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <TopBar showBack title={lesson.title} />

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 px-6 py-8"
            >
              <div className="text-6xl">📖</div>
              <div className="text-center">
                <h2 className="text-xl font-bold">{lesson.title}</h2>
                <p className="text-gray-500 mt-1 text-sm">
                  {lessonWords.length} words · {activeProfile.ageTrack.replace('-', ' ')}
                </p>
              </div>

              <div className="w-full bg-white rounded-2xl p-4 shadow-sm divide-y divide-gray-100">
                {lessonWords.map((w) => w && (
                  <div key={w.id} className="flex items-center gap-3 py-2.5">
                    <span className="text-2xl w-8 text-center">{w.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{w.memoni}</p>
                      <p className="text-xs text-gray-400">{w.english}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setPhase('flashcards')}
                className="w-full py-4 rounded-2xl font-bold text-white text-base active:scale-95 transition-transform"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                Start Learning →
              </button>
            </motion.div>
          )}

          {phase === 'flashcards' && (
            <motion.div
              key="flashcards"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <FlashcardDeck
                words={lessonWords.filter(Boolean) as NonNullable<typeof lessonWords[0]>[]}
                onComplete={() => setPhase('quiz')}
              />
            </motion.div>
          )}

          {phase === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
            >
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Quiz time!</p>
              </div>
              <QuizOrchestrator
                questions={questions}
                ageTrack={activeProfile.ageTrack}
                lessonId={lesson.id}
                profileId={activeProfile.id}
                onComplete={handleQuizComplete}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

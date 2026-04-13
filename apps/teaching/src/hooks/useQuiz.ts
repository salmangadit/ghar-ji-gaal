import { useState, useCallback } from 'react';
import type { QuizQuestion, QuizAttempt, QuizResult } from '../types/quiz';
import type { AgeTrack } from '../types/vocabulary';

function calcXP(mode: AgeTrack, attempts: QuizAttempt[]): number {
  const xpPerCorrect: Record<AgeTrack, number> = {
    'tiny-tots': 8,
    'young-learner': 10,
    'explorer': 15,
    'teen': 20,
  };
  const xpPerRetry: Record<AgeTrack, number> = {
    'tiny-tots': 4,
    'young-learner': 5,
    'explorer': 6,
    'teen': 8,
  };
  return attempts.reduce((sum, a) => {
    if (!a.correct) return sum;
    return sum + xpPerCorrect[mode]! - a.retriesUsed * xpPerRetry[mode]!;
  }, 0);
}

function calcStars(ageTrack: AgeTrack, attempts: QuizAttempt[]): 0 | 1 | 2 | 3 {
  if (attempts.length === 0) return 0;
  const correctFirst = attempts.filter((a) => a.correct && a.retriesUsed === 0).length;
  const correctTotal = attempts.filter((a) => a.correct).length;
  const total = attempts.length;

  if (ageTrack === 'tiny-tots') {
    const retries = attempts.reduce((s, a) => s + a.retriesUsed, 0);
    return retries === 0 ? 3 : retries <= 1 ? 2 : 1;
  }

  const thresholds: Record<AgeTrack, [number, number]> = {
    'tiny-tots': [0, 0],
    'young-learner': [0.8, 0.6],
    'explorer': [0.9, 0.7],
    'teen': [0.9, 0.7],
  };

  const [t3, t2] = thresholds[ageTrack]!;
  const ratio = ageTrack === 'young-learner' ? correctTotal / total : correctFirst / total;
  return ratio >= t3 ? 3 : ratio >= t2 ? 2 : 1;
}

interface UseQuizReturn {
  current: QuizQuestion | null;
  questionIndex: number;
  totalQuestions: number;
  attempts: QuizAttempt[];
  answerState: 'unanswered' | 'correct' | 'incorrect' | 'revealed';
  retriesLeft: number;
  submitAnswer: (answer: string) => void;
  revealAnswer: () => void;
  nextQuestion: () => void;
  getResult: (lessonId: string, profileId: string) => QuizResult;
  isFinished: boolean;
}

export function useQuiz(questions: QuizQuestion[], ageTrack: AgeTrack): UseQuizReturn {
  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [answerState, setAnswerState] = useState<'unanswered' | 'correct' | 'incorrect' | 'revealed'>('unanswered');
  const [retriesUsed, setRetriesUsed] = useState(0);

  const maxRetries = ageTrack === 'tiny-tots' ? 2 : 1;
  const retriesLeft = maxRetries - retriesUsed;
  const current = questions[index] ?? null;
  const isFinished = index >= questions.length && attempts.length === questions.length;

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!current || answerState !== 'unanswered') return;
      const correct =
        answer.toLowerCase().trim() === current.correctAnswer.toLowerCase().trim();

      if (correct) {
        setAnswerState('correct');
        setAttempts((prev) => [
          ...prev,
          { questionId: current.id, answer, correct: true, retriesUsed },
        ]);
      } else {
        if (retriesUsed < maxRetries - 1) {
          setRetriesUsed((r) => r + 1);
          setAnswerState('incorrect');
          // Reset to unanswered after feedback delay (caller handles timing)
          setTimeout(() => setAnswerState('unanswered'), 800);
        } else {
          // Last retry exhausted — reveal answer
          setAnswerState('revealed');
          setAttempts((prev) => [
            ...prev,
            { questionId: current.id, answer, correct: false, retriesUsed: retriesUsed + 1 },
          ]);
        }
      }
    },
    [current, answerState, retriesUsed, maxRetries]
  );

  const revealAnswer = useCallback(() => {
    if (!current) return;
    setAnswerState('revealed');
    setAttempts((prev) => [
      ...prev,
      { questionId: current.id, answer: '', correct: false, retriesUsed },
    ]);
  }, [current, retriesUsed]);

  const nextQuestion = useCallback(() => {
    setIndex((i) => i + 1);
    setAnswerState('unanswered');
    setRetriesUsed(0);
  }, []);

  const getResult = useCallback(
    (lessonId: string, profileId: string): QuizResult => ({
      lessonId,
      profileId,
      attempts,
      xpEarned: Math.max(0, calcXP(ageTrack, attempts)),
      stars: calcStars(ageTrack, attempts),
      completedAt: Date.now(),
    }),
    [attempts, ageTrack]
  );

  return {
    current,
    questionIndex: index,
    totalQuestions: questions.length,
    attempts,
    answerState,
    retriesLeft,
    submitAnswer,
    revealAnswer,
    nextQuestion,
    getResult,
    isFinished,
  };
}

export type QuizMode = 'tap-picture' | 'multiple-choice' | 'fill-blank' | 'type-answer';

export type AnswerState = 'unanswered' | 'correct' | 'incorrect' | 'revealed';

export interface QuizQuestion {
  id: string;
  wordId: string;
  mode: QuizMode;
  prompt: string;            // what to show as the question
  correctAnswer: string;     // the expected answer
  options: string[];         // for tap-picture / multiple-choice / fill-blank
  direction: 'memoni-to-english' | 'english-to-memoni';
}

export interface QuizAttempt {
  questionId: string;
  answer: string;
  correct: boolean;
  retriesUsed: number;
}

export interface QuizResult {
  lessonId: string;
  profileId: string;
  attempts: QuizAttempt[];
  xpEarned: number;
  stars: 0 | 1 | 2 | 3;
  completedAt: number;
}

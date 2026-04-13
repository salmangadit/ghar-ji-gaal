import { useEffect } from 'react';
import { AudioButton } from '../lesson/AudioButton';
import { ChoiceOption } from './ChoiceOption';
import { VOCAB_BY_ID } from '../../data/vocabulary';
import type { QuizQuestion } from '../../types/quiz';

interface TinyTotQuizProps {
  question: QuizQuestion;
  answerState: 'unanswered' | 'correct' | 'incorrect' | 'revealed';
  retriesLeft: number;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export function TinyTotQuiz({ question, answerState, retriesLeft, onAnswer, onNext }: TinyTotQuizProps) {
  const word = VOCAB_BY_ID[question.wordId];

  // Auto-advance 2s after correct answer or reveal
  useEffect(() => {
    if (answerState === 'correct' || answerState === 'revealed') {
      const t = setTimeout(onNext, 2000);
      return () => clearTimeout(t);
    }
  }, [answerState, onNext]);

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Prompt */}
      <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-3 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">What does this mean?</p>
        <p className="text-3xl font-extrabold text-center">{question.prompt}</p>
        {word && (
          <div onClick={(e) => e.stopPropagation()}>
            <AudioButton wordId={question.wordId} size="lg" />
          </div>
        )}
      </div>

      {/* 2×2 grid of emoji tiles */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          const optWord = Object.values(VOCAB_BY_ID).find((w) => w.english === opt);
          let state: 'default' | 'correct' | 'incorrect' = 'default';
          if (answerState === 'correct' && opt === question.correctAnswer) state = 'correct';
          if (answerState === 'revealed' && opt === question.correctAnswer) state = 'correct';

          return (
            <ChoiceOption
              key={opt}
              label={opt}
              emoji={optWord?.emoji}
              state={state}
              onClick={() => onAnswer(opt)}
              disabled={answerState !== 'unanswered'}
              large
            />
          );
        })}
      </div>

      {retriesLeft > 0 && answerState === 'unanswered' && (
        <p className="text-center text-xs text-gray-400">{retriesLeft} tries left</p>
      )}
    </div>
  );
}

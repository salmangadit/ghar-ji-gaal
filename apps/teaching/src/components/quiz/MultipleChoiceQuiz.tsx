import { useEffect } from 'react';
import { AudioButton } from '../lesson/AudioButton';
import { ChoiceOption } from './ChoiceOption';
import type { QuizQuestion } from '../../types/quiz';

interface MultipleChoiceQuizProps {
  question: QuizQuestion;
  answerState: 'unanswered' | 'correct' | 'incorrect' | 'revealed';
  selectedAnswer?: string;
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export function MultipleChoiceQuiz({ question, answerState, selectedAnswer, onAnswer, onNext }: MultipleChoiceQuizProps) {
  // Auto-advance 1.8s after correct
  useEffect(() => {
    if (answerState === 'correct') {
      const t = setTimeout(onNext, 1800);
      return () => clearTimeout(t);
    }
  }, [answerState, onNext]);

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Prompt */}
      <div className="bg-white rounded-3xl p-5 flex flex-col items-center gap-2 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {question.direction === 'memoni-to-english' ? 'What does this mean?' : 'How do you say this in Memoni?'}
        </p>
        <p className="text-2xl font-bold text-center">{question.prompt}</p>
        {question.direction === 'memoni-to-english' && (
          <AudioButton wordId={question.wordId} size="md" />
        )}
      </div>

      {/* 4 options */}
      <div className="grid grid-cols-2 gap-3">
        {question.options.map((opt) => {
          let state: 'default' | 'selected' | 'correct' | 'incorrect' = 'default';
          if (selectedAnswer === opt) {
            if (answerState === 'correct') state = 'correct';
            else if (answerState === 'incorrect') state = 'incorrect';
            else state = 'selected';
          }
          if ((answerState === 'revealed' || answerState === 'correct') && opt === question.correctAnswer) {
            state = 'correct';
          }

          return (
            <ChoiceOption
              key={opt}
              label={opt}
              state={state}
              onClick={() => onAnswer(opt)}
              disabled={answerState !== 'unanswered'}
            />
          );
        })}
      </div>

      {(answerState === 'revealed' || answerState === 'incorrect') && (
        <button
          onClick={onNext}
          className="w-full py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Continue →
        </button>
      )}
    </div>
  );
}

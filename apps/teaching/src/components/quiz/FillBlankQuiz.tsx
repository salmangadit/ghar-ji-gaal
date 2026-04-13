import { useState } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '../../types/quiz';
import { VOCAB_BY_ID } from '../../data/vocabulary';

interface FillBlankQuizProps {
  question: QuizQuestion;
  answerState: 'unanswered' | 'correct' | 'incorrect' | 'revealed';
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export function FillBlankQuiz({ question, answerState, onAnswer, onNext }: FillBlankQuizProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const word = VOCAB_BY_ID[question.wordId];

  // Build sentence with blank
  const template = word?.sentenceTemplate ?? `___ means "${question.correctAnswer}"`;
  const sentenceParts = template.split('___');

  function handleChip(chip: string) {
    if (answerState !== 'unanswered') return;
    setSelected(chip);
  }

  function handleConfirm() {
    if (selected) onAnswer(selected);
  }

  const isCorrect = answerState === 'correct';
  const isWrong = answerState === 'incorrect' || answerState === 'revealed';

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Sentence with blank */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Fill in the blank</p>
        <div className="flex flex-wrap items-center gap-1 text-lg font-medium">
          <span>{sentenceParts[0]}</span>
          <span
            className={`inline-block px-3 py-1 rounded-xl border-2 font-bold min-w-[80px] text-center transition-colors ${
              isCorrect
                ? 'border-success bg-success/10 text-green-700'
                : isWrong
                ? 'border-error bg-error/10 text-red-600'
                : selected
                ? 'border-primary bg-primary/5'
                : 'border-dashed border-gray-300 text-gray-300'
            }`}
          >
            {selected ?? (isWrong ? question.correctAnswer : '?')}
          </span>
          <span>{sentenceParts[1]}</span>
        </div>
      </div>

      {/* Word bank chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {question.options.map((opt) => {
          const isSelected = selected === opt;
          const isCorrectChip = (isCorrect || isWrong) && opt === question.correctAnswer;
          return (
            <motion.button
              key={opt}
              onClick={() => handleChip(opt)}
              whileTap={answerState === 'unanswered' ? { scale: 0.9 } : {}}
              disabled={answerState !== 'unanswered' || (isSelected && answerState !== 'unanswered')}
              className={`px-4 py-2 rounded-xl border-2 font-semibold text-sm transition-colors ${
                isCorrectChip
                  ? 'border-success bg-success/10 text-green-700'
                  : isSelected
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 bg-white text-gray-700'
              }`}
            >
              {opt}
            </motion.button>
          );
        })}
      </div>

      {/* Confirm / Continue */}
      {answerState === 'unanswered' ? (
        <button
          onClick={handleConfirm}
          disabled={!selected}
          className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Check →
        </button>
      ) : (
        <button
          onClick={() => { setSelected(null); onNext(); }}
          className="w-full py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: isCorrect ? 'var(--color-success)' : 'var(--color-primary)' }}
        >
          {isCorrect ? '✓ Correct! Continue →' : 'Continue →'}
        </button>
      )}
    </div>
  );
}

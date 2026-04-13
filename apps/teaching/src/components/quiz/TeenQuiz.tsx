import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { QuizQuestion } from '../../types/quiz';
import { VOCAB_BY_ID } from '../../data/vocabulary';
import { AudioButton } from '../lesson/AudioButton';

interface TeenQuizProps {
  question: QuizQuestion;
  answerState: 'unanswered' | 'correct' | 'incorrect' | 'revealed';
  onAnswer: (answer: string) => void;
  onNext: () => void;
}

export function TeenQuiz({ question, answerState, onAnswer, onNext }: TeenQuizProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const word = VOCAB_BY_ID[question.wordId];
  const template = word?.sentenceTemplate ?? '';

  function handleSubmit() {
    if (input.trim()) onAnswer(input.trim());
  }

  const isCorrect = answerState === 'correct';
  const isWrong = answerState === 'incorrect' || answerState === 'revealed';

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Sentence context */}
      {template && (
        <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500 italic border border-gray-100">
          {template.replace('___', `[${question.correctAnswer}]`)}
        </div>
      )}

      {/* Prompt */}
      <div className="bg-white rounded-3xl p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
          {question.direction === 'memoni-to-english'
            ? 'Translate to English:'
            : 'Translate to Memoni:'}
        </p>
        <div className="flex items-center gap-3">
          <p className="text-xl font-bold flex-1">{question.prompt}</p>
          {question.direction === 'memoni-to-english' && (
            <AudioButton wordId={question.wordId} size="sm" />
          )}
        </div>
      </div>

      {/* Text input */}
      <div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={answerState !== 'unanswered'}
          placeholder="Type your answer..."
          className={`w-full border-2 rounded-2xl px-4 py-3 text-base font-medium focus:outline-none transition-colors ${
            isCorrect
              ? 'border-success bg-success/5 text-green-700'
              : isWrong
              ? 'border-error bg-error/5 text-red-600'
              : 'border-gray-200 focus:border-primary'
          }`}
        />
        {isWrong && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-sm text-gray-500"
          >
            Correct answer: <strong>{question.correctAnswer}</strong>
          </motion.p>
        )}
      </div>

      {/* Submit / Continue */}
      {answerState === 'unanswered' ? (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-40 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          Check →
        </button>
      ) : (
        <button
          onClick={() => { setInput(''); onNext(); }}
          className="w-full py-3 rounded-2xl font-bold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: isCorrect ? 'var(--color-success)' : 'var(--color-primary)' }}
        >
          {isCorrect ? '✓ Correct! Continue →' : 'Continue →'}
        </button>
      )}
    </div>
  );
}

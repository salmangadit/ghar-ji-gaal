import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flashcard } from './Flashcard';
import type { VocabWord } from '../../types/vocabulary';

interface FlashcardDeckProps {
  words: VocabWord[];
  onComplete: () => void;
}

export function FlashcardDeck({ words, onComplete }: FlashcardDeckProps) {
  const [index, setIndex] = useState(0);
  const word = words[index];

  function next() {
    if (index < words.length - 1) {
      setIndex((i) => i + 1);
    } else {
      onComplete();
    }
  }

  function prev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  if (!word) return null;

  return (
    <div className="flex flex-col gap-6 px-6 py-4">
      {/* Progress dots */}
      <div className="flex justify-center gap-2">
        {words.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i < index
                ? 'bg-secondary w-4'
                : i === index
                ? 'w-6'
                : 'bg-gray-200 w-4'
            }`}
            style={i === index ? { backgroundColor: 'var(--color-primary)' } : {}}
          />
        ))}
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <Flashcard word={word} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-3">
        {index > 0 && (
          <button
            onClick={prev}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 font-semibold text-gray-500 active:scale-95 transition-transform"
          >
            ← Back
          </button>
        )}
        <button
          onClick={next}
          className="flex-1 py-3 rounded-2xl font-semibold text-white active:scale-95 transition-transform"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {index < words.length - 1 ? 'Next →' : 'Start Quiz →'}
        </button>
      </div>
    </div>
  );
}

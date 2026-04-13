import { useState } from 'react';
import { motion } from 'framer-motion';
import { AudioButton } from './AudioButton';
import type { VocabWord } from '../../types/vocabulary';

interface FlashcardProps {
  word: VocabWord;
}

export function Flashcard({ word }: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="relative w-full aspect-[4/3] cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="w-full h-full relative"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front — Memoni */}
        <div
          className="absolute inset-0 rounded-3xl bg-white shadow-lg flex flex-col items-center justify-center gap-4 px-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-6xl">{word.emoji}</span>
          <p className="text-2xl font-bold text-center">{word.memoni}</p>
          <div onClick={(e) => e.stopPropagation()}>
            <AudioButton wordId={word.id} size="md" />
          </div>
          <p className="text-xs text-gray-400">Tap to see translation</p>
        </div>

        {/* Back — English */}
        <div
          className="absolute inset-0 rounded-3xl shadow-lg flex flex-col items-center justify-center gap-4 px-6"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: 'var(--color-secondary)',
          }}
        >
          <span className="text-6xl">{word.emoji}</span>
          <p className="text-2xl font-bold text-white text-center">{word.english}</p>
          <p className="text-sm text-white/70 font-medium">{word.memoni}</p>
          <p className="text-xs text-white/50">Tap to flip back</p>
        </div>
      </motion.div>
    </div>
  );
}

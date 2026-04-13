import { motion } from 'framer-motion';
import { useAudio } from '../../hooks/useAudio';

interface AudioButtonProps {
  wordId: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Three states:
 * - playing: animated speaker
 * - has-audio (not playing): speaker icon
 * - no-audio: greyed speaker with dot — intentional (not an error), means "not recorded yet"
 */
export function AudioButton({ wordId, size = 'md' }: AudioButtonProps) {
  const { play, currentlyPlaying, hasAudio } = useAudio();
  const isPlaying = currentlyPlaying === wordId;
  const exists = hasAudio(wordId);

  const sizeMap = { sm: 28, md: 40, lg: 52 };
  const px = sizeMap[size];

  return (
    <motion.button
      onClick={() => play(wordId)}
      disabled={!exists}
      whileTap={exists ? { scale: 0.9 } : {}}
      className={`flex items-center justify-center rounded-full transition-all ${
        exists
          ? 'bg-secondary/20 active:bg-secondary/30'
          : 'bg-gray-100 opacity-40 cursor-default'
      }`}
      style={{ width: px, height: px }}
      aria-label={exists ? (isPlaying ? 'Playing audio' : 'Play audio') : 'No audio recorded yet'}
      title={exists ? undefined : 'No audio recorded yet — record one in the Parent Portal'}
    >
      {isPlaying ? (
        <motion.span
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
          className="text-base"
          style={{ fontSize: px * 0.45 }}
        >
          🔊
        </motion.span>
      ) : exists ? (
        <span style={{ fontSize: px * 0.45 }}>🔉</span>
      ) : (
        <span style={{ fontSize: px * 0.4 }} className="relative">
          🔇
        </span>
      )}
    </motion.button>
  );
}

import { motion } from 'framer-motion';

interface ChoiceOptionProps {
  label: string;
  emoji?: string;
  state: 'default' | 'selected' | 'correct' | 'incorrect';
  onClick: () => void;
  disabled?: boolean;
  large?: boolean;
}

export function ChoiceOption({ label, emoji, state, onClick, disabled, large }: ChoiceOptionProps) {
  const bg = {
    default: 'bg-white border-gray-200',
    selected: 'bg-white border-primary',
    correct: 'bg-success/10 border-success',
    incorrect: 'bg-error/10 border-error',
  }[state];

  const textColor = {
    default: 'text-gray-800',
    selected: 'text-primary',
    correct: 'text-green-700',
    incorrect: 'text-red-600',
  }[state];

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || state === 'correct' || state === 'incorrect'}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      animate={
        state === 'correct'
          ? { scale: [1, 1.05, 1] }
          : state === 'incorrect'
          ? { x: [0, -6, 6, -4, 4, 0] }
          : {}
      }
      transition={{ duration: 0.3 }}
      className={`w-full ${large ? 'p-4' : 'p-3'} rounded-2xl border-2 font-semibold transition-colors ${bg} ${textColor} text-center active:scale-95`}
    >
      {emoji && <div className="text-3xl mb-1">{emoji}</div>}
      <div className={large ? 'text-sm' : 'text-base'}>{label}</div>
    </motion.button>
  );
}

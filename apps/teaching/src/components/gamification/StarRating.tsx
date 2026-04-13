import { motion } from 'framer-motion';

interface StarRatingProps {
  stars: 0 | 1 | 2 | 3;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

export function StarRating({ stars, size = 'md', animate = false }: StarRatingProps) {
  const sizeClass = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }[size];

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((n) => (
        <motion.span
          key={n}
          className={`${sizeClass} leading-none`}
          initial={animate ? { scale: 0, opacity: 0 } : false}
          animate={animate ? { scale: 1, opacity: 1 } : false}
          transition={{ delay: animate ? n * 0.15 : 0, type: 'spring', stiffness: 300, damping: 15 }}
        >
          {n <= stars ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  );
}

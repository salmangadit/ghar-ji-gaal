import { motion, AnimatePresence } from 'framer-motion';

interface XPPopupProps {
  xp: number;
  visible: boolean;
}

export function XPPopup({ xp, visible }: XPPopupProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -40, scale: 1 }}
          exit={{ opacity: 0, y: -60, scale: 0.8 }}
          transition={{ duration: 0.5 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-50"
        >
          <div
            className="px-4 py-2 rounded-full font-bold text-sm text-white shadow-lg"
            style={{ backgroundColor: 'var(--color-xp)', color: '#333' }}
          >
            +{xp} XP ⭐
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

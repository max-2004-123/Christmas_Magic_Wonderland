import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface SceneToastProps {
  message: string | null;
}

export const SceneToast: React.FC<SceneToastProps> = ({ message }) => {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[112px] z-30 flex select-none justify-center px-4 sm:top-[82px] lg:top-5">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: -10, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel max-w-[90vw] rounded-full px-4 py-1.5 text-center font-serif text-xs tracking-wider text-[#fff6de] shadow-[0_8px_28px_rgba(0,0,0,0.42)] sm:px-5 sm:py-2 sm:text-sm"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface WelcomeOverlayProps {
  visible: boolean;
  onEnter: () => void;
}

export const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ visible, onEnter }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="welcome-screen"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06, filter: 'blur(12px)' }}
          transition={{ duration: 1.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-50 flex select-none items-center justify-center px-6"
          style={{
            background:
              'radial-gradient(circle at 50% 42%, rgba(12, 29, 64, 0.58) 0%, rgba(4, 10, 26, 0.88) 70%, rgba(2, 6, 16, 0.96) 100%)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Ambient golden glow behind centerpiece */}
          <div
            className="pointer-events-none absolute h-[420px] w-[420px] rounded-full opacity-40 blur-[110px]"
            style={{
              background:
                'radial-gradient(circle, rgba(245,208,123,0.45) 0%, rgba(196,30,58,0.18) 45%, transparent 72%)',
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex max-w-4xl flex-col items-center text-center"
          >
            {/* Delicate floating star emblem */}
            <motion.div
              animate={{ y: [0, -7, 0], rotate: [0, 3, -3, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#f5d07b]/40 bg-[#0c1b3a]/70 shadow-[0_0_40px_rgba(245,208,123,0.35)]"
            >
              <Sparkles className="h-7 w-7 text-[#f5d07b]" />
            </motion.div>

            {/* Subtle eyebrow tag */}
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.34em] text-[#f5d07b]/85 sm:text-sm">
              Magical Christmas Night · Interactive 3D Art
            </p>

            {/* Main Headline (Exact required wording, balanced with vibrant emojis) */}
            <h1 className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 font-display text-2xl font-bold leading-snug tracking-wide drop-shadow-[0_4px_24px_rgba(245,208,123,0.32)] sm:text-3xl md:text-[2.35rem] lg:text-[2.6rem]">
              <span aria-hidden="true">✨</span>
              <span className="gold-text-gradient">Welcome to Christmas Wonderland</span>
              <span aria-hidden="true">✨</span>
            </h1>

            {/* Decorative hairline divider */}
            <div className="my-5 flex items-center gap-3">
              <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#f5d07b]/70" />
              <span className="text-xs text-[#f5d07b]">❄</span>
              <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#f5d07b]/70" />
            </div>

            {/* Subtitle (Exact required wording) */}
            <p className="mb-10 max-w-lg font-serif text-base leading-relaxed tracking-wider text-[#eef4ff]/90 sm:text-lg">
              在這個冬夜，讓我們一起點亮聖誕魔法。
            </p>

            {/* Radiant Glowing CTA Button (Exact required wording) */}
            <motion.button
              type="button"
              onClick={onEnter}
              whileHover={{ scale: 1.045, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="magic-btn group relative inline-flex items-center gap-3 rounded-full border border-[#f5d07b]/70 px-8 py-4 text-base font-semibold tracking-wider text-[#fff9e8] shadow-[0_0_45px_rgba(245,208,123,0.35),0_14px_35px_rgba(0,0,0,0.45)] sm:px-10 sm:py-4 sm:text-lg"
              style={{
                background:
                  'linear-gradient(135deg, rgba(196, 30, 58, 0.92) 0%, rgba(153, 21, 45, 0.94) 55%, rgba(186, 128, 36, 0.92) 100%)',
              }}
            >
              <span className="relative z-10 flex items-center gap-2.5">
                <span>🎄 進入聖誕魔法世界</span>
              </span>
              <span
                className="pointer-events-none absolute -inset-1 rounded-full opacity-55 blur-md transition-opacity duration-300 group-hover:opacity-90"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(245,208,123,0.55), rgba(230,57,80,0.45), rgba(245,208,123,0.55))',
                }}
              />
            </motion.button>

            <p className="mt-6 text-xs tracking-widest text-[#cbd8f0]/65">
              點擊後將點亮 3D 聖誕樹並伴隨溫暖八音盒聖誕樂章
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

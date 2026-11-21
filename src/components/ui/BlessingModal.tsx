import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Sparkles, X } from 'lucide-react';
import { Blessing, OrnamentEmblem } from '../../types/wonderland';

interface BlessingModalProps {
  blessing: Blessing | null;
  giftLabel?: string;
  onClose: () => void;
  onDrawAnother: () => void;
}

const FestiveEmblemSVG: React.FC<{ kind: OrnamentEmblem }> = ({ kind }) => {
  switch (kind) {
    case 'stocking':
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(245,208,123,0.4)]">
          <rect x="16" y="7" width="16" height="7" rx="3" fill="#fff8f0" />
          <path
            d="M18 14 H30 V28 C30 34 26 39 18 39 C12 39 10 34 12 30 C13 28 16 27 18 26 Z"
            fill="#d4203b"
          />
          <circle cx="24" cy="22" r="2.2" fill="#f5d07b" />
          <circle cx="19" cy="33" r="2" fill="#f5d07b" />
        </svg>
      );
    case 'gingerbread':
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(245,208,123,0.4)]">
          <circle cx="24" cy="14" r="7" fill="#c07339" />
          <rect x="13" y="21" width="22" height="5.5" rx="2.75" fill="#c07339" />
          <rect x="18" y="21" width="12" height="14" rx="5" fill="#c07339" />
          <rect x="17" y="31" width="5" height="10" rx="2.5" fill="#c07339" />
          <rect x="26" y="31" width="5" height="10" rx="2.5" fill="#c07339" />
          <circle cx="21.5" cy="13" r="1.2" fill="#fff" />
          <circle cx="26.5" cy="13" r="1.2" fill="#fff" />
          <path d="M21 16.5 Q24 19 27 16.5" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <circle cx="24" cy="26" r="1.7" fill="#e63950" />
          <circle cx="24" cy="30.5" r="1.7" fill="#2cc27c" />
        </svg>
      );
    case 'candy':
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(245,208,123,0.4)]">
          <path
            d="M27 39 V18 C27 12 22 9 18 11 C14 13 15 18 18 19"
            fill="none"
            stroke="#fff7f5"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M27 39 V18 C27 12 22 9 18 11 C14 13 15 18 18 19"
            fill="none"
            stroke="#d9223e"
            strokeWidth="6"
            strokeDasharray="5 5"
            strokeLinecap="round"
          />
          <path d="M22 25 L27 22 L32 25 L27 28 Z" fill="#f5d07b" />
        </svg>
      );
    case 'wreath':
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(245,208,123,0.4)]">
          <circle cx="24" cy="23" r="13" fill="none" stroke="#1b6b42" strokeWidth="6" strokeDasharray="5 2.5" />
          <circle cx="24" cy="10" r="2.2" fill="#f5d07b" />
          <circle cx="36" cy="20" r="2.2" fill="#e63950" />
          <circle cx="12" cy="20" r="2.2" fill="#e63950" />
          <circle cx="33" cy="32" r="2" fill="#f5d07b" />
          <circle cx="15" cy="32" r="2" fill="#f5d07b" />
          <path d="M17 37 L24 33 L31 37 L24 41 Z" fill="#e63950" />
        </svg>
      );
    case 'bell':
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_4px_12px_rgba(245,208,123,0.45)]">
          <path d="M24 10 C17 10 14 16 14 25 L10 32 H38 L34 25 C34 16 31 10 24 10 Z" fill="#f5cc66" />
          <circle cx="24" cy="35" r="3.4" fill="#d99a2e" />
          <path d="M18 11 L24 7 L30 11 L24 14 Z" fill="#d9223e" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" className="h-11 w-11 drop-shadow-[0_0_16px_rgba(245,208,123,0.7)]">
          <path
            d="M24 6 L28.8 17.6 L41.2 18.8 L31.8 27 L34.6 39.2 L24 32.8 L13.4 39.2 L16.2 27 L6.8 18.8 L19.2 17.6 Z"
            fill="#f5d07b"
            stroke="#fff7da"
            strokeWidth="1.5"
          />
        </svg>
      );
  }
};

export const BlessingModal: React.FC<BlessingModalProps> = ({
  blessing,
  giftLabel,
  onClose,
  onDrawAnother,
}) => {
  return (
    <AnimatePresence>
      {blessing && (
        <motion.div
          key="blessing-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#030916]/60 px-4 backdrop-blur-sm"
        >
          <motion.div
            key={blessing.id}
            initial={{ opacity: 0, scale: 0.84, y: 26, rotateX: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 18 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative w-full max-w-md overflow-hidden rounded-3xl p-6 text-center sm:p-8"
          >
            {/* Top festive gradient aura bar */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1.5"
              style={{
                background: `linear-gradient(90deg, ${blessing.accentFrom}, ${blessing.accentTo}, ${blessing.accentFrom})`,
              }}
            />

            {/* Soft internal ambient glow */}
            <div
              className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full opacity-35 blur-3xl"
              style={{
                background: `radial-gradient(circle, ${blessing.accentTo}, transparent 70%)`,
              }}
            />

            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉聖誕祝福卡片"
              className="absolute right-4 top-4 rounded-full border border-white/15 bg-white/5 p-1.5 text-[#dce8ff]/80 transition hover:border-[#f5d07b]/50 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Decorative Emblem */}
            <motion.div
              initial={{ scale: 0.6, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#f5d07b]/45 bg-[#0e2042]/80 shadow-[0_0_32px_rgba(245,208,123,0.28)]"
            >
              <FestiveEmblemSVG kind={blessing.emblem} />
            </motion.div>

            {/* Badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#f5d07b]/35 bg-[#f5d07b]/12 px-3 py-1 text-[11px] font-medium tracking-widest text-[#f5d07b]">
              <Sparkles className="h-3 w-3" />
              <span>{giftLabel ? `${giftLabel} · ${blessing.badge}` : blessing.badge}</span>
            </div>

            {/* Blessing Headline (champagne gold with glow so emojis stay full vibrant color!) */}
            <h3 className="font-serif text-2xl font-bold leading-snug tracking-wide text-[#ffe8a3] drop-shadow-[0_2px_18px_rgba(245,208,123,0.45)] sm:text-[1.65rem]">
              {blessing.headline}
            </h3>

            {/* English / Warm Subline */}
            <p className="mt-2 font-serif text-xs tracking-wider text-[#f5d07b]/85 sm:text-sm">
              {blessing.subline}
            </p>

            {/* Divider */}
            <div className="my-4 flex items-center justify-center gap-2.5">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#f5d07b]/60" />
              <span className="text-[11px] text-[#f5d07b]">✦</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#f5d07b]/60" />
            </div>

            {/* Poetic Note */}
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#eaf2ff]/90">
              {blessing.poeticNote}
            </p>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={onDrawAnother}
                className="magic-btn flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-medium text-[#eef4ff] sm:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#f5d07b]" />
                <span>再抽一個祝福</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="magic-btn rounded-full border border-[#f5d07b]/65 px-5 py-2.5 text-xs font-semibold text-[#fff9e8] shadow-[0_0_24px_rgba(196,30,58,0.4)] sm:text-sm"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(196, 30, 58, 0.92), rgba(182, 122, 32, 0.92))',
                }}
              >
                收下這份祝福 🎄
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

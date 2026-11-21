import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface TopHeaderProps {
  visible: boolean;
  isDay: boolean;
}

interface CountdownState {
  isChristmasDay: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetYear: number;
}

function getChristmasCountdown(): CountdownState {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 11 = December
  const day = now.getDate();

  if (month === 11 && day === 25) {
    return { isChristmasDay: true, days: 0, hours: 0, minutes: 0, seconds: 0, targetYear: year };
  }

  let targetYear = year;
  if (month === 11 && day > 25) {
    targetYear = year + 1;
  }

  const target = new Date(targetYear, 11, 25, 0, 0, 0, 0);
  const diffMs = Math.max(0, target.getTime() - now.getTime());

  const totalSec = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { isChristmasDay: false, days, hours, minutes, seconds, targetYear };
}

const pad2 = (n: number) => String(n).padStart(2, '0');

export const TopHeader: React.FC<TopHeaderProps> = ({ visible, isDay }) => {
  const [countdown, setCountdown] = useState<CountdownState>(getChristmasCountdown);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getChristmasCountdown());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!visible) return null;

  const panelCls = isDay ? 'glass-panel-day' : 'glass-panel';

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-0 top-0 z-20 flex select-none flex-col items-stretch justify-between gap-2 p-3 sm:flex-row sm:items-start sm:p-5"
    >
      {/* Left: Art-Piece Title Emblem & Subtle Interaction Guide */}
      <div className="pointer-events-auto flex flex-col gap-1.5 self-start">
        <div className={`${panelCls} flex items-center gap-3 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5`}>
          {/* Delicate SVG Christmas Wreath Emblem */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#f5d07b]/35 bg-[#0f3d2e]/70 shadow-[0_0_16px_rgba(245,208,123,0.22)]">
            <svg viewBox="0 0 36 36" className="h-6 w-6" aria-hidden="true">
              <circle
                cx="18"
                cy="18"
                r="11"
                fill="none"
                stroke="#227a4d"
                strokeWidth="4.2"
                strokeDasharray="4 2"
              />
              <circle cx="18" cy="7" r="1.7" fill="#f5d07b" />
              <circle cx="28" cy="14" r="1.5" fill="#ff4763" />
              <circle cx="8" cy="14" r="1.5" fill="#ff4763" />
              <circle cx="26" cy="24" r="1.5" fill="#f5d07b" />
              <circle cx="10" cy="24" r="1.5" fill="#f5d07b" />
              {/* Tiny red bow */}
              <path d="M13 28 L18 25.5 L23 28 L18 30.5 Z" fill="#e63950" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="gold-text-gradient truncate font-display text-sm font-bold tracking-wide sm:text-base">
              Christmas Magic Wonderland
            </h2>
            <p className="truncate text-[11px] tracking-wider text-[#dce8ff]/75">
              點擊聖誕樹、樹頂星、禮物盒與雪人探索驚喜
            </p>
          </div>
        </div>
      </div>

      {/* Right: Live Christmas Countdown Timer */}
      <div
        className={`${panelCls} pointer-events-auto flex items-center gap-3 self-end rounded-2xl px-3.5 py-2 sm:self-auto sm:px-4 sm:py-2.5`}
      >
        <div className="hidden h-8 w-8 items-center justify-center rounded-full bg-[#c41e3a]/30 text-[#f5d07b] ring-1 ring-[#f5d07b]/30 sm:flex">
          <Sparkles className="h-4 w-4" />
        </div>

        {countdown.isChristmasDay ? (
          <div className="text-right sm:text-left">
            <div className="gold-text-gradient font-serif text-sm font-bold tracking-wider">
              🎄 Merry Christmas!
            </div>
            <div className="text-[11px] text-[#e6efff]/80">聖誕魔法就在今天</div>
          </div>
        ) : (
          <div className="flex flex-col">
            <span className="text-[10px] font-medium tracking-[0.16em] text-[#f5d07b]/85">
              距離 12 月 25 日聖誕夜
            </span>
            <div className="mt-0.5 flex items-baseline gap-1.5 font-mono text-xs font-semibold text-[#fff9ec] sm:gap-2 sm:text-sm">
              <span className="flex items-baseline gap-0.5">
                <span className="text-sm font-bold text-[#f5d07b] sm:text-base">
                  {countdown.days}
                </span>
                <span className="text-[10px] font-sans font-normal text-[#dce8ff]/75">天</span>
              </span>
              <span className="text-[#f5d07b]/40">:</span>
              <span className="flex items-baseline gap-0.5">
                <span>{pad2(countdown.hours)}</span>
                <span className="text-[10px] font-sans font-normal text-[#dce8ff]/75">時</span>
              </span>
              <span className="text-[#f5d07b]/40">:</span>
              <span className="flex items-baseline gap-0.5">
                <span>{pad2(countdown.minutes)}</span>
                <span className="text-[10px] font-sans font-normal text-[#dce8ff]/75">分</span>
              </span>
              <span className="text-[#f5d07b]/40">:</span>
              <span className="flex items-baseline gap-0.5">
                <span className="text-[#ffe39c]">{pad2(countdown.seconds)}</span>
                <span className="text-[10px] font-sans font-normal text-[#dce8ff]/75">秒</span>
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
};

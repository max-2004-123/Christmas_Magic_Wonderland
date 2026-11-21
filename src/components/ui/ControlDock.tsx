import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CloudSnow,
  Gift,
  Moon,
  Palette,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Sun,
  Wand2,
  Wind,
  X,
} from 'lucide-react';
import { LightMode, SnowIntensity } from '../../types/wonderland';

interface ControlDockProps {
  visible: boolean;
  treeLit: boolean;
  lightMode: LightMode;
  isDay: boolean;
  snowEnabled: boolean;
  snowIntensity: SnowIntensity;
  reducedMotion: boolean;
  hasOpenedGifts: boolean;
  onToggleTreeLit: () => void;
  onLightModeChange: (mode: LightMode) => void;
  onToggleDayNight: () => void;
  onToggleSnow: () => void;
  onSnowIntensityChange: (intensity: SnowIntensity) => void;
  onSurprise: () => void;
  onToggleReducedMotion: () => void;
  onResetGifts: () => void;
}

const LIGHT_MODES: { id: LightMode; label: string; dot: string }[] = [
  { id: 'warm-gold', label: '溫暖金色', dot: '#ffd266' },
  { id: 'multicolor', label: '七彩燈光', dot: 'linear-gradient(135deg,#ff4763,#ffd266,#3ee89e,#4dc3ff)' },
  { id: 'ice-blue', label: '夢幻冰藍', dot: '#7be6ff' },
];

const SNOW_LEVELS: { id: SnowIntensity; label: string }[] = [
  { id: 'light', label: '小雪' },
  { id: 'heavy', label: '大雪' },
  { id: 'blizzard', label: '暴風雪' },
];

export const ControlDock: React.FC<ControlDockProps> = ({
  visible,
  treeLit,
  lightMode,
  isDay,
  snowEnabled,
  snowIntensity,
  reducedMotion,
  hasOpenedGifts,
  onToggleTreeLit,
  onLightModeChange,
  onToggleDayNight,
  onToggleSnow,
  onSnowIntensityChange,
  onSurprise,
  onToggleReducedMotion,
  onResetGifts,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!visible) return null;

  const panelCls = isDay ? 'glass-panel-day' : 'glass-panel';

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="pointer-events-none fixed inset-x-2 bottom-3 z-20 flex select-none flex-col items-center gap-2 lg:inset-x-auto lg:bottom-5 lg:right-5 lg:items-end"
    >
      {/* Expanded Fine-Tuning Panel (Light Modes, Snow Intensity, Reduced Motion, Gift Reset) */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className={`${panelCls} pointer-events-auto w-[min(92vw,310px)] rounded-2xl p-3.5 sm:w-[320px]`}
          >
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#f5d07b]">
                <Palette className="h-3.5 w-3.5" />
                魔法場景設定
              </span>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                aria-label="關閉設定面板"
                className="rounded-lg p-1 text-[#d5e3fa]/70 hover:bg-white/10 hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Light Mode Selector */}
            <div className="mb-3">
              <div className="mb-1.5 text-[11px] text-[#dce8ff]/80">聖誕樹燈光模式</div>
              <div className="grid grid-cols-3 gap-1.5">
                {LIGHT_MODES.map((m) => {
                  const active = lightMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onLightModeChange(m.id)}
                      className={`magic-btn flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-medium ${
                        active
                          ? 'border-[#f5d07b]/70 bg-[#f5d07b]/20 text-[#fff8e3]'
                          : 'border-white/10 bg-white/5 text-[#dbe7fa]/80'
                      }`}
                    >
                      <span
                        className="h-3 w-3 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                        style={{ background: m.dot }}
                      />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Snow Intensity Selector */}
            <div className="mb-3">
              <div className="mb-1.5 flex items-center justify-between text-[11px] text-[#dce8ff]/80">
                <span className="flex items-center gap-1">
                  <CloudSnow className="h-3.5 w-3.5 text-[#a9e4ff]" />
                  下雪強度
                </span>
                <span className="text-[10px] text-[#f5d07b]/80">
                  {snowEnabled ? '飄雪中' : '已關閉'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {SNOW_LEVELS.map((lv) => {
                  const active = snowEnabled && snowIntensity === lv.id;
                  return (
                    <button
                      key={lv.id}
                      type="button"
                      onClick={() => {
                        if (!snowEnabled) onToggleSnow();
                        onSnowIntensityChange(lv.id);
                      }}
                      className={`magic-btn rounded-xl border px-2 py-1.5 text-xs font-medium ${
                        active
                          ? 'border-[#8fe0ff]/70 bg-[#52b8ff]/25 text-white'
                          : 'border-white/10 bg-white/5 text-[#dbe7fa]/80'
                      }`}
                    >
                      {lv.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accessibility & Gift Reset */}
            <div className="flex items-center gap-2 border-t border-white/10 pt-2.5">
              <button
                type="button"
                onClick={onToggleReducedMotion}
                className={`magic-btn flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2 text-[11px] font-medium ${
                  reducedMotion
                    ? 'border-[#f5d07b]/70 bg-[#f5d07b]/20 text-[#fff8e3]'
                    : 'border-white/10 bg-white/5 text-[#dbe7fa]/85'
                }`}
              >
                <Wind className="h-3.5 w-3.5" />
                <span>{reducedMotion ? '已降低動畫' : '降低動畫強度'}</span>
              </button>

              {hasOpenedGifts && (
                <button
                  type="button"
                  onClick={onResetGifts}
                  className="magic-btn flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-[11px] font-medium text-[#ffe9b5]"
                >
                  <Gift className="h-3.5 w-3.5" />
                  <span>重包禮物</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Glassmorphic Quick Action Bar (always single tidy row across mobile & desktop) */}
      <div
        className={`${panelCls} pointer-events-auto flex flex-nowrap items-center justify-center gap-1 rounded-2xl p-1.5 sm:gap-2 sm:p-2.5`}
      >
        {/* Light Up Tree Button */}
        <button
          type="button"
          onClick={onToggleTreeLit}
          className={`magic-btn flex shrink-0 items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-medium sm:gap-1.5 sm:px-3 sm:text-xs ${
            treeLit
              ? 'border-[#f5d07b]/60 bg-[#f5d07b]/20 text-[#fff6db]'
              : 'border-white/15 bg-white/5 text-[#dbe7fa]/85'
          }`}
          title="點亮或熄滅聖誕樹燈光"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#f5d07b]" />
          <span className="hidden sm:inline">{treeLit ? '點亮聖誕樹' : '熄燈·點亮'}</span>
          <span className="sm:hidden">{treeLit ? '樹燈' : '點亮'}</span>
        </button>

        {/* Day / Night Toggle */}
        <button
          type="button"
          onClick={onToggleDayNight}
          className="magic-btn flex shrink-0 items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-2 py-2 text-[11px] font-medium text-[#eef4ff] sm:gap-1.5 sm:px-3 sm:text-xs"
          title="切換白天／夜晚模式"
        >
          {isDay ? (
            <>
              <Moon className="h-3.5 w-3.5 shrink-0 text-[#a9c8ff]" />
              <span className="hidden sm:inline">切換夜晚</span>
              <span className="sm:hidden">夜晚</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 shrink-0 text-[#ffd978]" />
              <span className="hidden sm:inline">切換白天</span>
              <span className="sm:hidden">白天</span>
            </>
          )}
        </button>

        {/* Snow On/Off Toggle */}
        <button
          type="button"
          onClick={onToggleSnow}
          className={`magic-btn flex shrink-0 items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-medium sm:gap-1.5 sm:px-3 sm:text-xs ${
            snowEnabled
              ? 'border-[#8fe0ff]/55 bg-[#52b8ff]/20 text-[#eff9ff]'
              : 'border-white/15 bg-white/5 text-[#dbe7fa]/75'
          }`}
          title="開啟／關閉浪漫下雪"
        >
          <Snowflake className="h-3.5 w-3.5 shrink-0 text-[#9ee6ff]" />
          <span className="hidden sm:inline">{snowEnabled ? '雪花開啟' : '雪花關閉'}</span>
          <span className="sm:hidden">{snowEnabled ? '雪花' : '無雪'}</span>
        </button>

        {/* Christmas Surprise Button */}
        <button
          type="button"
          onClick={onSurprise}
          className="magic-btn flex shrink-0 items-center gap-1 rounded-xl border border-[#f5d07b]/70 px-2.5 py-2 text-[11px] font-semibold text-[#fff9e8] shadow-[0_0_20px_rgba(196,30,58,0.45)] sm:gap-1.5 sm:px-3.5 sm:text-xs"
          style={{
            background:
              'linear-gradient(135deg, rgba(196, 30, 58, 0.92) 0%, rgba(178, 118, 30, 0.92) 100%)',
          }}
        >
          <Wand2 className="h-3.5 w-3.5 shrink-0 text-[#fff2bd]" />
          <span>聖誕驚喜</span>
        </button>

        {/* Expand Settings Drawer Button */}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label="展開燈光與下雪細項設定"
          className={`magic-btn flex shrink-0 items-center gap-1 rounded-xl border px-2 py-2 text-[11px] font-medium sm:px-2.5 sm:text-xs ${
            expanded
              ? 'border-[#f5d07b]/65 bg-[#f5d07b]/25 text-[#fff6dc]'
              : 'border-white/15 bg-white/5 text-[#eef4ff]'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-[#f5d07b]" />
          <span className="hidden md:inline">燈光與雪量</span>
        </button>
      </div>
    </motion.div>
  );
};

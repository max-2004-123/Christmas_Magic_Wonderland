import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Music,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CHRISTMAS_SONGS } from '../../data/songs';
import { audioEngine } from '../../audio/ChristmasAudioEngine';

interface MusicPlayerCardProps {
  visible: boolean;
  isPlaying: boolean;
  trackIndex: number;
  volume: number;
  muted: boolean;
  isDay: boolean;
  reducedMotion: boolean;
  onTogglePlay: () => void;
  onPrevTrack: () => void;
  onNextTrack: () => void;
  onSelectTrack: (idx: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
}

interface FloatingNote {
  id: number;
  glyph: string;
  xOffset: number;
  color: string;
}

const NOTE_GLYPHS = ['♪', '♫', '♩', '♬'];
const NOTE_COLORS = ['#f5d07b', '#fff5d1', '#ffd6e0', '#a9e6ff'];

export const MusicPlayerCard: React.FC<MusicPlayerCardProps> = ({
  visible,
  isPlaying,
  trackIndex,
  volume,
  muted,
  isDay,
  reducedMotion,
  onTogglePlay,
  onPrevTrack,
  onNextTrack,
  onSelectTrack,
  onVolumeChange,
  onToggleMute,
}) => {
  const [floatingNotes, setFloatingNotes] = useState<FloatingNote[]>([]);
  const [barHeights, setBarHeights] = useState<number[]>([25, 40, 30, 50, 28]);
  const [showList, setShowList] = useState(false);

  const track = CHRISTMAS_SONGS[trackIndex] ?? CHRISTMAS_SONGS[0];

  useEffect(() => {
    const unsub = audioEngine.subscribeNotes((evt) => {
      // Pulse equalizer bars in real rhythm with note pitch & velocity
      const norm = Math.max(0, Math.min(1, (evt.pitch - 55) / 24));
      setBarHeights([
        24 + norm * 52,
        36 + ((evt.pitch * 7) % 58),
        30 + evt.velocity * 65,
        28 + ((evt.pitch * 13) % 62),
        22 + (1 - norm) * 58,
      ]);

      if (reducedMotion) return;

      const id = Date.now() + Math.random();
      const note: FloatingNote = {
        id,
        glyph: NOTE_GLYPHS[evt.pitch % NOTE_GLYPHS.length],
        xOffset: (Math.random() - 0.5) * 42,
        color: NOTE_COLORS[evt.pitch % NOTE_COLORS.length],
      };
      setFloatingNotes((prev) => [...prev.slice(-6), note]);
      window.setTimeout(() => {
        setFloatingNotes((prev) => prev.filter((n) => n.id !== id));
      }, 1500);
    });
    return unsub;
  }, [reducedMotion]);

  useEffect(() => {
    if (!isPlaying) {
      setBarHeights([20, 20, 20, 20, 20]);
    }
  }, [isPlaying]);

  if (!visible) return null;

  const panelCls = isDay ? 'glass-panel-day' : 'glass-panel';

  return (
    <motion.aside
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-[70px] left-3 z-20 w-[252px] select-none sm:w-[274px] lg:bottom-5 lg:left-5 lg:w-[284px]"
    >
      {/* Floating Musical Notes dancing upward on live playback */}
      <div className="pointer-events-none absolute -top-10 left-8 h-12 w-24 overflow-visible">
        <AnimatePresence>
          {floatingNotes.map((n) => (
            <motion.span
              key={n.id}
              initial={{ opacity: 0, y: 12, x: n.xOffset, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], y: -38, x: n.xOffset + 12, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.45, ease: 'easeOut' }}
              className="absolute bottom-0 left-6 text-base font-bold drop-shadow-[0_0_8px_rgba(245,208,123,0.75)]"
              style={{ color: n.color }}
            >
              {n.glyph}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Expandable Track Selector Popup */}
      <AnimatePresence>
        {showList && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className={`${panelCls} mb-2 rounded-2xl p-2`}
          >
            <div className="mb-1.5 flex items-center justify-between px-2 py-0.5 text-[10px] tracking-wider text-[#f5d07b]/85">
              <span>公有領域聖誕曲目</span>
              <span>Web Audio 合成</span>
            </div>
            <div className="flex flex-col gap-1">
              {CHRISTMAS_SONGS.map((s, idx) => {
                const active = idx === trackIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      onSelectTrack(idx);
                      setShowList(false);
                    }}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition ${
                      active
                        ? 'bg-[#f5d07b]/20 text-[#fff6dc] ring-1 ring-[#f5d07b]/45'
                        : 'text-[#d9e6fa]/80 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="truncate font-medium">
                      {idx + 1}. {s.title}
                    </span>
                    <span className="ml-2 shrink-0 text-[10px] text-[#f5d07b]/75">
                      {s.englishTitle.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Glassmorphic Music Card */}
      <div className={`${panelCls} rounded-2xl p-3 sm:p-3.5`}>
        <div className="flex items-center gap-3">
          {/* Play / Pause Golden Disc Button */}
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? '暫停聖誕音樂' : '播放聖誕音樂'}
            className="magic-btn relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#f5d07b]/55 bg-gradient-to-br from-[#c41e3a] to-[#8f1429] text-[#fff8e6] shadow-[0_0_20px_rgba(196,30,58,0.45)]"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-current" /> : <Play className="ml-0.5 h-4 w-4 fill-current" />}
          </button>

          {/* Song Info & Rhythm Visualizer */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowList((v) => !v)}
                className="group flex min-w-0 items-center gap-1.5 text-left"
                title="點擊切換曲目清單"
              >
                <Music className="h-3.5 w-3.5 shrink-0 text-[#f5d07b]" />
                <span className="truncate font-serif text-sm font-semibold text-[#fff7e2] group-hover:text-[#f5d07b]">
                  {track.title}
                </span>
              </button>

              {/* Live 5-Bar Equalizer synced to real audio notes */}
              <div className="flex h-4 items-end gap-[2.5px]" aria-hidden="true">
                {barHeights.map((h, i) => (
                  <span
                    key={i}
                    className="w-[2.5px] rounded-full bg-gradient-to-t from-[#d99b38] to-[#fff0bc] transition-all duration-200"
                    style={{
                      height: `${isPlaying ? h : 20}%`,
                      opacity: isPlaying ? 0.95 : 0.4,
                    }}
                  />
                ))}
              </div>
            </div>

            <p className="mt-0.5 truncate text-[11px] text-[#d6e4fb]/75">
              {track.englishTitle} · {track.style}
            </p>
          </div>
        </div>

        {/* Bottom Controls: Prev/Next + Volume Slider */}
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-white/10 pt-2">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onPrevTrack}
              aria-label="上一首聖誕音樂"
              className="magic-btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#eef4ff]/85 hover:text-[#f5d07b]"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onNextTrack}
              aria-label="下一首聖誕音樂"
              className="magic-btn flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-[#eef4ff]/85 hover:text-[#f5d07b]"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowList((v) => !v)}
              className="magic-btn rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-[#f5d07b]/90"
            >
              曲目 {trackIndex + 1}/{CHRISTMAS_SONGS.length}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={muted ? '取消靜音' : '靜音'}
              className="text-[#e8f0ff]/80 transition hover:text-[#f5d07b]"
            >
              {muted || volume === 0 ? (
                <VolumeX className="h-3.5 w-3.5" />
              ) : (
                <Volume2 className="h-3.5 w-3.5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.02}
              value={muted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              aria-label="調整音樂音量"
              className="gold-slider w-16 sm:w-20"
            />
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

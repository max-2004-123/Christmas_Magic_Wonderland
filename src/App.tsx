import React, { useCallback, useEffect, useRef, useState } from 'react';
import { WonderlandScene } from './components/scene/WonderlandScene';
import { SnowCanvas } from './components/overlays/SnowCanvas';
import { CursorTrailCanvas } from './components/overlays/CursorTrailCanvas';
import { CelebrationCanvas, CelebrationTrigger } from './components/overlays/CelebrationCanvas';
import { WelcomeOverlay } from './components/overlays/WelcomeOverlay';
import { TopHeader } from './components/ui/TopHeader';
import { MusicPlayerCard } from './components/ui/MusicPlayerCard';
import { ControlDock } from './components/ui/ControlDock';
import { BlessingModal } from './components/ui/BlessingModal';
import { SceneToast } from './components/ui/SceneToast';
import { audioEngine } from './audio/ChristmasAudioEngine';
import { CHRISTMAS_BLESSINGS } from './data/blessings';
import { CHRISTMAS_SONGS } from './data/songs';
import {
  Blessing,
  FireworkBurstEvent,
  GiftBoxDef,
  LightMode,
  SnowIntensity,
  TimeOfDay,
} from './types/wonderland';

const SNOWMAN_LINES = [
  '⛄ 雪人開心地向你揮手：Merry Christmas! 🎄',
  '⛄ 雪人壓了壓禮帽：今晚的雪花特別溫柔呢 ❄️',
  '⛄ 雪人興奮地跳了起來：樹下的禮物盒都在發光喔 🎁',
  '⛄ 雪人對你眨眨眼：點擊樹頂的星星會有奇蹟發生 ✨',
];

export default function App() {
  const [entered, setEntered] = useState(false);
  const [treeLit, setTreeLit] = useState(false);
  const [lightMode, setLightMode] = useState<LightMode>('warm-gold');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');
  const [snowEnabled, setSnowEnabled] = useState(true);
  const [snowIntensity, setSnowIntensity] = useState<SnowIntensity>('heavy');
  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Music state
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [volume, setVolume] = useState(0.55);
  const [muted, setMuted] = useState(false);

  // Interactive event nonces & scene triggers
  const [waveNonce, setWaveNonce] = useState(0);
  const [starBurstNonce, setStarBurstNonce] = useState(0);
  const [surpriseNonce, setSurpriseNonce] = useState(0);
  const [openedGifts, setOpenedGifts] = useState<Record<string, number>>({});
  const [fireworks, setFireworks] = useState<FireworkBurstEvent[]>([]);
  const [celebration, setCelebration] = useState<CelebrationTrigger | null>(null);

  // Active Blessing Modal & Toast
  const [activeBlessing, setActiveBlessing] = useState<{ blessing: Blessing; giftLabel?: string } | null>(
    null
  );
  const [toast, setToast] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);
  const blessingBagRef = useRef<number[]>([]);
  const snowmanLineIdxRef = useRef(0);
  const fireworkIdRef = useRef(1);
  const celebrationIdRef = useRef(1);

  const isDay = timeOfDay === 'day';

  const showToast = useCallback((msg: string, durationMs = 3600) => {
    setToast(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
      audioEngine.pause();
    };
  }, []);

  const drawNextBlessing = useCallback((): Blessing => {
    if (blessingBagRef.current.length === 0) {
      const indices = CHRISTMAS_BLESSINGS.map((_, idx) => idx);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      blessingBagRef.current = indices;
    }
    const nextIdx = blessingBagRef.current.pop() ?? 0;
    return CHRISTMAS_BLESSINGS[nextIdx];
  }, []);

  const launchFireworkBurst = useCallback(
    (origin: [number, number, number], palette: string[], scale = 1.0) => {
      const id = fireworkIdRef.current++;
      setFireworks((prev) => [...prev.slice(-10), { id, origin, palette, scale }]);
    },
    []
  );

  const triggerCelebration = useCallback((kind: CelebrationTrigger['kind']) => {
    const id = celebrationIdRef.current++;
    setCelebration({ id, kind });
  }, []);

  // ===================== WELCOME ENTRANCE =====================
  const handleEnterWonderland = useCallback(() => {
    setEntered(true);
    setTreeLit(true);
    setSnowEnabled(true);

    // Respect browser autoplay: initialize Web Audio strictly inside click handler
    audioEngine.setVolume(volume);
    audioEngine.setMuted(muted);
    audioEngine.playEnterWonderlandChord();
    audioEngine.selectTrack(0, false);
    audioEngine.start(2.4);
    setMusicPlaying(true);

    // Subtle welcome shimmer after tree begins illuminating
    window.setTimeout(() => {
      setWaveNonce((n) => n + 1);
      setStarBurstNonce((n) => n + 1);
      launchFireworkBurst([0, 6.2, -0.2], ['#ffe48f', '#fff6d4', '#ffbe4f'], 0.85);
    }, 1150);

    showToast('✨ 歡迎來到魔法聖誕夜！點擊聖誕樹、星星、禮物盒與雪人探索驚喜', 5000);
  }, [volume, muted, launchFireworkBurst, showToast]);

  // ===================== SCENE INTERACTIONS =====================
  const handleTreeClick = useCallback(() => {
    if (!entered) return;
    if (!treeLit) {
      setTreeLit(true);
    }
    setWaveNonce((n) => n + 1);
    audioEngine.playTreeWaveChime();
    showToast('✨ 聖誕樹燈海如星波般閃耀流動！', 2400);
  }, [entered, treeLit, showToast]);

  const handleStarClick = useCallback(() => {
    if (!entered) return;
    if (!treeLit) setTreeLit(true);
    setStarBurstNonce((n) => n + 1);
    setWaveNonce((n) => n + 1);
    audioEngine.playStarFireworkSound();
    triggerCelebration('star');

    // Crown golden magic burst + twin flanking golden sky fireworks
    launchFireworkBurst([0, 6.2, 0], ['#fff7d6', '#ffd25a', '#ffad38', '#ffffff'], 1.15);
    window.setTimeout(() => {
      launchFireworkBurst([-3.2, 7.6, -2.5], ['#ffd875', '#ff5978', '#fff4d1'], 1.05);
    }, 240);
    window.setTimeout(() => {
      launchFireworkBurst([3.2, 7.8, -2.5], ['#8be8ff', '#ffd875', '#ffffff'], 1.05);
    }, 440);

    showToast('⭐ 樹頂金色五角星綻放！魔法煙火點亮星空 ✨', 3400);
  }, [entered, treeLit, launchFireworkBurst, triggerCelebration, showToast]);

  const handleGiftClick = useCallback(
    (gift: GiftBoxDef) => {
      if (!entered) return;
      setOpenedGifts((prev) => ({
        ...prev,
        [gift.id]: (prev[gift.id] ?? 0) + 1,
      }));
      audioEngine.playGiftOpenSound();

      // Let user enjoy the 3D wiggle, ribbon untie & lid spring-pop before modal blooms
      window.setTimeout(() => {
        triggerCelebration('gift');
        const wish = drawNextBlessing();
        setActiveBlessing({ blessing: wish, giftLabel: gift.label });
      }, 480);
    },
    [entered, triggerCelebration, drawNextBlessing]
  );

  const handleSnowmanClick = useCallback(() => {
    if (!entered) return;
    audioEngine.playSnowmanChime();
    const line = SNOWMAN_LINES[snowmanLineIdxRef.current % SNOWMAN_LINES.length];
    snowmanLineIdxRef.current += 1;
    showToast(line, 3400);
  }, [entered, showToast]);

  const handleSantaFlyby = useCallback(() => {
    showToast('🎅 抬頭看！聖誕老人正駕著馴鹿雪橇飛越星空 🦌✨', 4200);
  }, [showToast]);

  // ===================== CONTROL BAR ACTIONS =====================
  const handleToggleTreeLit = useCallback(() => {
    setTreeLit((prev) => {
      const next = !prev;
      if (next) {
        setWaveNonce((n) => n + 1);
        setStarBurstNonce((n) => n + 1);
        audioEngine.playTreeWaveChime();
        showToast('🎄 聖誕樹燈光已重新點亮！', 2600);
      } else {
        showToast('🌙 聖誕樹進入靜謐月光模式，再點一次即可重新點亮', 2800);
      }
      return next;
    });
  }, [showToast]);

  const handleLightModeChange = useCallback(
    (mode: LightMode) => {
      setLightMode(mode);
      if (!treeLit) setTreeLit(true);
      setWaveNonce((n) => n + 1);
      audioEngine.playTreeWaveChime();
      const label =
        mode === 'warm-gold'
          ? '溫暖香檳金燈光'
          : mode === 'multicolor'
            ? '璀璨七彩聖誕燈光'
            : '夢幻極光冰藍燈光';
      showToast(`✨ 已切換為「${label}」`, 2400);
    },
    [treeLit, showToast]
  );

  const handleToggleDayNight = useCallback(() => {
    setTimeOfDay((prev) => {
      const next = prev === 'night' ? 'day' : 'night';
      showToast(
        next === 'day' ? '☀️ 已切換至「冬日晴雪白天」' : '🌌 已切換至「魔法聖誕星空夜」',
        2600
      );
      return next;
    });
  }, [showToast]);

  const handleToggleSnow = useCallback(() => {
    setSnowEnabled((prev) => {
      const next = !prev;
      showToast(next ? '❄️ 浪漫雪花飄落中' : '✨ 已暫停下雪特效', 2200);
      return next;
    });
  }, [showToast]);

  const handleSnowIntensityChange = useCallback(
    (level: SnowIntensity) => {
      setSnowIntensity(level);
      const label = level === 'light' ? '微風小雪' : level === 'heavy' ? '浪漫大雪' : '奇幻暴風雪';
      showToast(`❄️ 下雪強度已調整為「${label}」`, 2200);
    },
    [showToast]
  );

  const handleChristmasSurprise = useCallback(() => {
    if (!treeLit) setTreeLit(true);
    setSurpriseNonce((n) => n + 1);
    setWaveNonce((n) => n + 1);
    setStarBurstNonce((n) => n + 1);
    audioEngine.playStarFireworkSound();
    triggerCelebration('surprise');

    // Grand multi-shell 3D sky fireworks spectacle
    const shells: { delay: number; origin: [number, number, number]; palette: string[]; scale: number }[] =
      [
        { delay: 0, origin: [0, 6.6, -1.2], palette: ['#ffd86e', '#fff6d6', '#ff4c6a'], scale: 1.2 },
        { delay: 260, origin: [-4.8, 7.8, -3.5], palette: ['#ff3b5c', '#ffd266', '#ffffff'], scale: 1.15 },
        { delay: 520, origin: [4.6, 8.0, -3.2], palette: ['#6ce5ff', '#a89eff', '#fff8de'], scale: 1.15 },
        { delay: 840, origin: [-2.2, 8.9, -4.5], palette: ['#42f5a7', '#ffd266', '#fff2c2'], scale: 1.25 },
        { delay: 1120, origin: [2.4, 8.6, -4.2], palette: ['#ffd266', '#ff6482', '#7be6ff'], scale: 1.3 },
      ];

    shells.forEach((s) => {
      window.setTimeout(() => {
        launchFireworkBurst(s.origin, s.palette, s.scale);
        if (s.delay === 840) {
          audioEngine.playStarFireworkSound();
        }
      }, s.delay);
    });

    showToast('🎆 聖誕驚喜降臨！全夜空煙火綻放，聖誕老人正飛過天空 🎅✨', 4500);
  }, [treeLit, launchFireworkBurst, triggerCelebration, showToast]);

  const handleToggleReducedMotion = useCallback(() => {
    setReducedMotion((prev) => {
      const next = !prev;
      showToast(
        next ? '🍃 已啟用「降低動畫強度」柔和流暢模式' : '✨ 已恢復完整夢幻動畫強度',
        2600
      );
      return next;
    });
  }, [showToast]);

  const handleResetGifts = useCallback(() => {
    setOpenedGifts({});
    showToast('🎁 樹下的聖誕禮物已重新包裝好，歡迎再次拆開驚喜！', 2800);
  }, [showToast]);

  // ===================== MUSIC PLAYER HANDLERS =====================
  const handleToggleMusic = useCallback(() => {
    if (musicPlaying) {
      audioEngine.pause();
      setMusicPlaying(false);
    } else {
      audioEngine.setVolume(volume);
      audioEngine.setMuted(muted);
      audioEngine.start(0.7);
      setMusicPlaying(true);
    }
  }, [musicPlaying, volume, muted]);

  const handleSelectTrack = useCallback((idx: number) => {
    const safeIdx = ((idx % CHRISTMAS_SONGS.length) + CHRISTMAS_SONGS.length) % CHRISTMAS_SONGS.length;
    setTrackIndex(safeIdx);
    audioEngine.selectTrack(safeIdx, true);
    setMusicPlaying(true);
  }, []);

  const handleVolumeChange = useCallback((v: number) => {
    setVolume(v);
    if (v > 0 && muted) {
      setMuted(false);
      audioEngine.setMuted(false);
    }
    audioEngine.setVolume(v);
  }, [muted]);

  const handleToggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      audioEngine.setMuted(next);
      return next;
    });
  }, []);

  const hasOpenedGifts = Object.keys(openedGifts).length > 0;

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#040a18]">
      {/* 1. Interactive 3D Magical Christmas Wonderland Scene */}
      <WonderlandScene
        entered={entered}
        treeLit={treeLit}
        lightMode={lightMode}
        isDay={isDay}
        snowEnabled={snowEnabled}
        snowIntensity={snowIntensity}
        reducedMotion={reducedMotion}
        waveNonce={waveNonce}
        starBurstNonce={starBurstNonce}
        surpriseNonce={surpriseNonce}
        openedGifts={openedGifts}
        fireworks={fireworks}
        onTreeClick={handleTreeClick}
        onStarClick={handleStarClick}
        onGiftClick={handleGiftClick}
        onSnowmanClick={handleSnowmanClick}
        onSantaFlyby={handleSantaFlyby}
      />

      {/* 2. High-FPS Multi-Depth Romantic Snowfall Canvas */}
      <SnowCanvas
        enabled={snowEnabled}
        intensity={snowIntensity}
        isDay={isDay}
        reducedMotion={reducedMotion}
        entered={entered}
      />

      {/* 3. Subtle Starry Mouse Cursor Sparkle Trail */}
      <CursorTrailCanvas disabled={reducedMotion} />

      {/* 4. Celebratory Confetti / Snowflakes / Stars Burst Layer */}
      <CelebrationCanvas trigger={celebration} reducedMotion={reducedMotion} />

      {/* 5. Poetic Floating Glassmorphic UI */}
      <TopHeader visible={entered} isDay={isDay} />

      <SceneToast message={toast} />

      <MusicPlayerCard
        visible={entered}
        isPlaying={musicPlaying}
        trackIndex={trackIndex}
        volume={volume}
        muted={muted}
        isDay={isDay}
        reducedMotion={reducedMotion}
        onTogglePlay={handleToggleMusic}
        onPrevTrack={() => handleSelectTrack(trackIndex - 1)}
        onNextTrack={() => handleSelectTrack(trackIndex + 1)}
        onSelectTrack={handleSelectTrack}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
      />

      <ControlDock
        visible={entered}
        treeLit={treeLit}
        lightMode={lightMode}
        isDay={isDay}
        snowEnabled={snowEnabled}
        snowIntensity={snowIntensity}
        reducedMotion={reducedMotion}
        hasOpenedGifts={hasOpenedGifts}
        onToggleTreeLit={handleToggleTreeLit}
        onLightModeChange={handleLightModeChange}
        onToggleDayNight={handleToggleDayNight}
        onToggleSnow={handleToggleSnow}
        onSnowIntensityChange={handleSnowIntensityChange}
        onSurprise={handleChristmasSurprise}
        onToggleReducedMotion={handleToggleReducedMotion}
        onResetGifts={handleResetGifts}
      />

      {/* 6. Interactive Gift Blessing Card Modal */}
      <BlessingModal
        blessing={activeBlessing?.blessing ?? null}
        giftLabel={activeBlessing?.giftLabel}
        onClose={() => setActiveBlessing(null)}
        onDrawAnother={() => {
          audioEngine.playGiftOpenSound();
          triggerCelebration('gift');
          setActiveBlessing((prev) => ({
            blessing: drawNextBlessing(),
            giftLabel: prev?.giftLabel,
          }));
        }}
      />

      {/* 7. Dreamy Cinematic Welcome Entrance Overlay */}
      <WelcomeOverlay visible={!entered} onEnter={handleEnterWonderland} />
    </main>
  );
}

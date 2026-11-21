import React, { useEffect, useRef } from 'react';
import { SnowIntensity } from '../../types/wonderland';

interface SnowCanvasProps {
  enabled: boolean;
  intensity: SnowIntensity;
  isDay: boolean;
  reducedMotion: boolean;
  entered: boolean;
}

interface Snowflake {
  x: number;
  y: number;
  depth: number; // 0 (far) .. 1 (near bokeh)
  radius: number;
  speedY: number;
  driftAmp: number;
  driftFreq: number;
  phase: number;
  opacity: number;
  glint: boolean;
  glintPhase: number;
  isCrystal: boolean;
  rotation: number;
  rotSpeed: number;
}

const TARGET_COUNTS: Record<SnowIntensity, number> = {
  light: 95,
  heavy: 210,
  blizzard: 360,
};

export const SnowCanvas: React.FC<SnowCanvasProps> = ({
  enabled,
  intensity,
  isDay,
  reducedMotion,
  entered,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ enabled, intensity, isDay, reducedMotion, entered });
  propsRef.current = { enabled, intensity, isDay, reducedMotion, entered };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const makeFlake = (randomY: boolean): Snowflake => {
      const depth = Math.pow(Math.random(), 1.35); // More far/mid flakes, tasteful near bokeh
      const radius = 0.9 + depth * 4.4;
      return {
        x: Math.random() * (width + 160) - 80,
        y: randomY ? Math.random() * height : -12 - Math.random() * 60,
        depth,
        radius,
        speedY: 18 + depth * 64 + Math.random() * 18,
        driftAmp: 12 + (1 - depth * 0.4) * 28,
        driftFreq: 0.4 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        opacity: 0.28 + depth * 0.56,
        glint: Math.random() < 0.22,
        glintPhase: Math.random() * Math.PI * 2,
        isCrystal: depth > 0.35 && depth < 0.78 && Math.random() < 0.16,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.7,
      };
    };

    const flakes: Snowflake[] = Array.from({ length: 140 }, () => makeFlake(true));

    let masterOpacity = 0;
    let rafId = 0;
    let lastTime = performance.now();

    const drawCrystalFlake = (
      x: number,
      y: number,
      r: number,
      rot: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = `rgba(244, 250, 255, ${alpha})`;
      ctx.lineWidth = Math.max(0.7, r * 0.22);
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(-r, 0);
        ctx.lineTo(r, 0);
        ctx.stroke();
      }
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const t = now * 0.001;
      const { enabled: isOn, intensity: mode, isDay: day, reducedMotion: reduced, entered: hasEntered } =
        propsRef.current;

      // Soft ambient snow even faintly before enter, full lush snow once entered
      const targetAlpha = !isOn ? 0 : hasEntered ? 1 : 0.32;
      masterOpacity += (targetAlpha - masterOpacity) * Math.min(1, dt * 3.2);

      // Adjust active snowflake pool smoothly for mobile / reducedMotion / intensity
      const mobileScale = width < 640 ? 0.58 : width < 1024 ? 0.78 : 1.0;
      const reducedScale = reduced ? 0.42 : 1.0;
      const desiredCount = Math.round(TARGET_COUNTS[mode] * mobileScale * reducedScale);

      while (flakes.length < desiredCount) {
        flakes.push(makeFlake(false));
      }
      if (flakes.length > desiredCount + 12) {
        flakes.length = desiredCount;
      }

      ctx.clearRect(0, 0, width, height);

      if (masterOpacity > 0.01) {
        const speedMul =
          (mode === 'blizzard' ? 2.15 : mode === 'heavy' ? 1.35 : 0.85) * (reduced ? 0.45 : 1);
        const breezeBase =
          (mode === 'blizzard' ? 125 : mode === 'heavy' ? 38 : 14) * (reduced ? 0.3 : 1);
        const gust = Math.sin(t * 0.38) * (mode === 'blizzard' ? 55 : 18);

        for (let i = 0; i < flakes.length; i++) {
          const f = flakes[i];
          const windX = (breezeBase + gust) * (0.45 + f.depth * 0.75);
          const swayX = Math.cos(t * f.driftFreq + f.phase) * f.driftAmp;

          f.y += f.speedY * speedMul * dt;
          f.x += (windX + swayX) * dt;
          f.rotation += f.rotSpeed * dt;

          if (f.y > height + 16) {
            f.y = -12 - Math.random() * 20;
            f.x = Math.random() * (width + 180) - 90;
          }
          if (f.x > width + 60) f.x = -50;
          if (f.x < -60) f.x = width + 50;

          const glintBoost = f.glint
            ? Math.pow(Math.max(0, Math.sin(t * 2.6 + f.glintPhase)), 6) * 0.6
            : 0;
          const alpha = Math.min(1, (f.opacity + glintBoost) * masterOpacity * (day ? 0.86 : 1));

          if (f.isCrystal) {
            drawCrystalFlake(f.x, f.y, f.radius * 1.35, f.rotation, alpha);
          } else if (f.depth > 0.72) {
            // Soft out-of-focus foreground bokeh snowflake
            const grad = ctx.createRadialGradient(f.x, f.y, 0.2, f.x, f.y, f.radius * 1.45);
            grad.addColorStop(0, `rgba(255, 253, 248, ${alpha})`);
            grad.addColorStop(0.55, `rgba(225, 242, 255, ${alpha * 0.48})`);
            grad.addColorStop(1, 'rgba(225, 242, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius * 1.45, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle =
              glintBoost > 0.2
                ? `rgba(255, 246, 212, ${alpha})`
                : `rgba(244, 250, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
            ctx.fill();
          }

          // Delicate starlight glint cross on sparkling flakes
          if (glintBoost > 0.28 && !reduced) {
            const s = f.radius * 2.3;
            ctx.strokeStyle = `rgba(255, 242, 198, ${glintBoost * masterOpacity * 0.9})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(f.x - s, f.y);
            ctx.lineTo(f.x + s, f.y);
            ctx.moveTo(f.x, f.y - s);
            ctx.lineTo(f.x, f.y + s);
            ctx.stroke();
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-10 pointer-events-none"
      aria-hidden="true"
    />
  );
};

import React, { useEffect, useRef } from 'react';

interface CursorTrailCanvasProps {
  disabled: boolean;
}

interface TrailSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  life: number;
  color: string;
  isStar: boolean;
}

const TRAIL_COLORS = ['#fff5d1', '#f5d07b', '#d9f2ff', '#ffe29a'];

export const CursorTrailCanvas: React.FC<CursorTrailCanvasProps> = ({ disabled }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

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

    const sparks: TrailSpark[] = [];
    let lastSpawn = 0;

    const handleMove = (e: PointerEvent) => {
      if (disabledRef.current) return;
      if (e.pointerType === 'touch') return;

      const now = performance.now();
      if (now - lastSpawn < 24) return;
      lastSpawn = now;

      const count = Math.random() < 0.45 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        sparks.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 20,
          vy: 10 + Math.random() * 22,
          size: 1.8 + Math.random() * 2.8,
          age: 0,
          life: 0.48 + Math.random() * 0.42,
          color: TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)],
          isStar: Math.random() < 0.45,
        });
      }
      if (sparks.length > 90) sparks.splice(0, sparks.length - 90);
    };

    window.addEventListener('pointermove', handleMove, { passive: true });

    let rafId = 0;
    let prev = performance.now();

    const drawFourPointStar = (x: number, y: number, r: number, color: string, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const rad = i % 2 === 0 ? r * 1.9 : r * 0.42;
        const px = Math.cos(a) * rad;
        const py = Math.sin(a) * rad;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      ctx.clearRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.age += dt;
        if (s.age >= s.life) {
          sparks.splice(i, 1);
          continue;
        }
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        const fade = 1 - s.age / s.life;

        if (s.isStar) {
          drawFourPointStar(s.x, s.y, s.size * fade, s.color, fade * 0.85);
        } else {
          ctx.save();
          ctx.globalAlpha = fade * 0.78;
          ctx.fillStyle = s.color;
          ctx.shadowColor = s.color;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size * 0.75 * fade, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-30 pointer-events-none"
      aria-hidden="true"
    />
  );
};

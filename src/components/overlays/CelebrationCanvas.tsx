import React, { useEffect, useRef } from 'react';

export interface CelebrationTrigger {
  id: number;
  kind: 'gift' | 'star' | 'surprise';
}

interface CelebrationCanvasProps {
  trigger: CelebrationTrigger | null;
  reducedMotion: boolean;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  rotSpeed: number;
  color: string;
  shape: 'star' | 'ribbon' | 'snowflake' | 'spark';
  age: number;
  life: number;
}

const PALETTES = {
  gift: ['#f5d07b', '#ff4d6d', '#fff4d4', '#4ee4a5', '#87dcff'],
  star: ['#fff7d6', '#ffd25a', '#ffbe42', '#e0f4ff', '#f5d07b'],
  surprise: ['#ffd25a', '#ff3b5c', '#54f0ab', '#6ad4ff', '#d99bff', '#fff6d8'],
};

export const CelebrationCanvas: React.FC<CelebrationCanvasProps> = ({
  trigger,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<ConfettiPiece[]>([]);
  const lastIdRef = useRef<number>(0);

  useEffect(() => {
    if (!trigger || trigger.id === lastIdRef.current) return;
    lastIdRef.current = trigger.id;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const colors = PALETTES[trigger.kind];
    const shapes: ConfettiPiece['shape'][] = ['star', 'ribbon', 'snowflake', 'spark'];

    const spawnBurst = (cx: number, cy: number, count: number, power: number) => {
      const actualCount = reducedMotion ? Math.round(count * 0.4) : count;
      for (let i = 0; i < actualCount; i++) {
        const ang = Math.random() * Math.PI * 2;
        const speed = (90 + Math.random() * 290) * power;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - (trigger.kind === 'gift' ? 140 : 60),
          size: 3.5 + Math.random() * 5.5,
          rot: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 7,
          color: colors[i % colors.length],
          shape: shapes[i % shapes.length],
          age: 0,
          life: 1.5 + Math.random() * 1.1,
        });
      }
    };

    if (trigger.kind === 'gift') {
      spawnBurst(w * 0.5, h * 0.62, 65, 1.0);
    } else if (trigger.kind === 'star') {
      spawnBurst(w * 0.5, h * 0.24, 72, 1.15);
    } else {
      // Multi-point grand fireworks & magic confetti
      spawnBurst(w * 0.28, h * 0.26, 52, 1.15);
      window.setTimeout(() => spawnBurst(w * 0.72, h * 0.24, 52, 1.15), 220);
      window.setTimeout(() => spawnBurst(w * 0.5, h * 0.2, 68, 1.3), 460);
    }
  }, [trigger, reducedMotion]);

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

    let rafId = 0;
    let prev = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;
      ctx.clearRect(0, 0, width, height);

      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];
        p.age += dt;
        if (p.age >= p.life) {
          list.splice(i, 1);
          continue;
        }
        p.vy += 260 * dt;
        p.vx *= 1 - 1.1 * dt;
        p.vy *= 1 - 0.5 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.rotSpeed * dt;

        const alpha = Math.max(0, 1 - p.age / p.life);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = alpha;

        if (p.shape === 'ribbon') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size * 0.9, -p.size * 0.35, p.size * 1.8, p.size * 0.7);
        } else if (p.shape === 'star') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          for (let k = 0; k < 10; k++) {
            const a = (k * Math.PI) / 5;
            const r = k % 2 === 0 ? p.size * 1.2 : p.size * 0.5;
            const px = Math.cos(a) * r;
            const py = Math.sin(a) * r;
            if (k === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.shape === 'snowflake') {
          ctx.strokeStyle = '#eef8ff';
          ctx.lineWidth = 1.25;
          for (let k = 0; k < 3; k++) {
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(-p.size, 0);
            ctx.lineTo(p.size, 0);
            ctx.stroke();
          }
        } else {
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(0, 0, p.size * 0.55, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
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
      className="fixed inset-0 z-40 pointer-events-none"
      aria-hidden="true"
    />
  );
};

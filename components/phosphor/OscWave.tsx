'use client';

import { useEffect, useRef } from 'react';
import { COLOR } from '@/lib/design/tokens';

interface OscWaveProps {
  color?: string;
  height?: number;
  glow?: boolean;
  speed?: number;
  lineWidth?: number;
}

/**
 * Oscilloscope trace on a canvas: a glowing, layered, voice-ish signal. The
 * PHOSPHOR motif. Pure decoration, driven by requestAnimationFrame.
 */
export function OscWave({
  color = COLOR.accent,
  height = 150,
  glow = true,
  speed = 1,
  lineWidth = 2,
}: OscWaveProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let dead = false;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);

    const draw = () => {
      if (dead) return;
      const w = cv.clientWidth;
      const h = cv.clientHeight;
      const mid = h / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = color;
      ctx.lineJoin = 'round';
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      }
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const p = x / w;
        const env = 0.55 + 0.45 * Math.sin(p * Math.PI * 1.5 + t * 0.6);
        const y =
          Math.sin(p * 22 + t * 2.2 * speed) * 0.5 +
          Math.sin(p * 7 - t * 1.3 * speed) * 0.32 +
          Math.sin(p * 41 + t * 3.1 * speed) * 0.16;
        const yy = mid + y * env * (h * 0.34);
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.stroke();
      t += 0.016;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, glow, speed, lineWidth]);

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

'use client';

import { useEffect, useState } from 'react';

/**
 * A thin fixed bar at the very top of the tutorial page tracking how far the
 * reader has scrolled. Decorative (aria-hidden); the accent fill grows to 100%
 * at the bottom of the article.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const update = () => {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setPct(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5" aria-hidden>
      <div
        className="h-full bg-[color:var(--color-accent)] transition-[width] duration-75"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

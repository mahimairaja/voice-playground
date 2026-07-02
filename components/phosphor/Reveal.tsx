'use client';

import { type CSSProperties, type ReactNode, useCallback, useEffect, useRef } from 'react';

interface RevealProps {
  /** Stagger delay in seconds, applied via the --reveal-delay CSS variable. */
  delay?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Scroll-reveal wrapper ported from mahimai.ca: content fades up once it
 * scrolls into view (see [data-reveal] in globals.css). Progressive
 * enhancement: the content is visible by default and the client only arms the
 * hidden-then-reveal style (data-reveal-armed) when it can actually drive it,
 * so if scripts fail, are disabled, or IntersectionObserver is unavailable the
 * marketing copy stays readable. Reduced-motion users are left visible, no
 * transition. Server children pass through as props, so server-rendered
 * sections can be wrapped without going client.
 */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const ref = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;

    // Leave the default visible state in place (never arm) when we cannot or
    // should not animate: no IntersectionObserver, or reduced-motion.
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') return;

    node.dataset.revealArmed = 'true';
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute('data-revealed', 'true');
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    observerRef.current.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{ '--reveal-delay': `${delay}s` } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}

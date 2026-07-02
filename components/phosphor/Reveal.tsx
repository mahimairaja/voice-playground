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
 * scrolls into view (see [data-reveal] in globals.css). Reduced-motion users
 * get it shown immediately, no transition. Server children pass through as
 * props, so server-rendered sections can be wrapped without going client.
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

import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  muted?: boolean;
}

/**
 * Mono instrument label. Daylight rule: 12px floor and AA mute ink; the
 * accent variant is ochre (amber is a fill color, not label text on light).
 */
export function Eyebrow({ children, className, accent, muted }: EyebrowProps) {
  return (
    <span
      className={cn(
        'font-mono text-[12px] tracking-[0.14em] uppercase',
        accent
          ? 'text-[color:var(--color-accent-dim)]'
          : muted
            ? 'text-[color:var(--color-text-fade)]'
            : 'text-[color:var(--color-text-mute)]',
        className
      )}
    >
      {children}
    </span>
  );
}

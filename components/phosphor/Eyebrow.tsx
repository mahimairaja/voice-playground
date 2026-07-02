import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  muted?: boolean;
}

/**
 * Uppercase section label in the mahimai.ca eyebrow voice (Inter bold,
 * tracking-widest). The accent variant is deep teal, which passes AA where
 * the raw teal fill does not; teal stays a fill color, not label text.
 */
export function Eyebrow({ children, className, accent, muted }: EyebrowProps) {
  return (
    <span
      className={cn(
        'text-xs font-bold tracking-widest uppercase',
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

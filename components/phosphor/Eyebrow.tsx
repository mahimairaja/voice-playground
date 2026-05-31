import type { ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface EyebrowProps {
  children: ReactNode;
  className?: string;
  accent?: boolean;
  muted?: boolean;
}

/** Mono instrument label. The PHOSPHOR readout caption. */
export function Eyebrow({ children, className, accent, muted }: EyebrowProps) {
  return (
    <span
      className={cn(
        'font-mono text-[10.5px] tracking-[0.16em] uppercase',
        accent
          ? 'text-[color:var(--color-accent)]'
          : muted
            ? 'text-[color:var(--color-text-mute)]'
            : 'text-[color:var(--color-text-fade)]',
        className
      )}
    >
      {children}
    </span>
  );
}

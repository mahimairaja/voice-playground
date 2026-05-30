import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface GrainProps {
  children: ReactNode;
  scan?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** Film-grain (and optional CRT scanline) overlay wrapper. See styles/globals.css. */
export function Grain({ children, scan, className, style }: GrainProps) {
  return (
    <div className={cn('ph-grain relative', scan && 'ph-scan', className)} style={style}>
      {children}
    </div>
  );
}

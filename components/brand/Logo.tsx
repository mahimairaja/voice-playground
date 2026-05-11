import type { CSSProperties } from 'react';
import { cn } from '@/lib/shadcn/utils';

interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  wordmark?: string;
  className?: string;
}

const GOAT_SRC = '/brand/goat.svg';

export function Logo({
  size = 32,
  withWordmark = false,
  wordmark = 'Mahimai AI',
  className,
}: LogoProps) {
  const goatStyle: CSSProperties = {
    width: size,
    height: size,
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${GOAT_SRC})`,
    maskImage: `url(${GOAT_SRC})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
  };

  const wordmarkStyle: CSSProperties = {
    fontFamily: 'var(--hand-title)',
    fontSize: Math.round(size * 0.78),
    lineHeight: 1,
    letterSpacing: '0.02em',
  };

  return (
    <span
      role="img"
      aria-label={withWordmark ? `${wordmark} logo` : 'Mahimai AI logo'}
      className={cn('inline-flex items-center gap-2 align-middle leading-none', className)}
    >
      <span aria-hidden="true" className="block shrink-0" style={goatStyle} />
      {withWordmark && (
        <span aria-hidden="true" className="font-bold whitespace-nowrap" style={wordmarkStyle}>
          {wordmark}
        </span>
      )}
    </span>
  );
}

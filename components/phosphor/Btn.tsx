import type { MouseEventHandler, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/shadcn/utils';

type Kind = 'primary' | 'ghost' | 'muted';

interface BtnProps {
  children: ReactNode;
  kind?: Kind;
  href?: string;
  external?: boolean;
  onClick?: MouseEventHandler;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}

const BASE =
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] border border-transparent px-[22px] py-3 text-[15px] leading-none font-semibold no-underline transition-colors';

const KINDS: Record<Kind, string> = {
  primary: 'bg-[color:var(--color-accent)] text-white hover:bg-[color:var(--color-accent-dim)]',
  ghost:
    'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] hover:bg-[color:var(--color-surface-2)]',
  muted:
    'border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] font-medium text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]',
};

/**
 * Brand button matched to the mahimai.ca .btn-primary/.btn-secondary metrics
 * (15px/600, 0.5rem radius, teal fill with white ink; ghost is the white
 * secondary). Renders a Link (href), external anchor (href + external), or
 * button.
 */
export function Btn({
  children,
  kind = 'primary',
  href,
  external,
  onClick,
  type = 'button',
  disabled,
  className,
}: BtnProps) {
  const cls = cn(BASE, KINDS[kind], disabled && 'pointer-events-none opacity-50', className);

  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  if (href) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {children}
    </button>
  );
}

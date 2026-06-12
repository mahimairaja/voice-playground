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
  'inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-[var(--radius-button)] border border-transparent px-[18px] py-[11px] font-mono text-[13px] font-semibold tracking-[0.02em] no-underline transition-all';

const KINDS: Record<Kind, string> = {
  primary:
    'bg-[color:var(--color-accent)] text-[color:var(--color-text)] shadow-[0_1px_2px_rgba(34,28,18,0.12)] hover:brightness-105',
  ghost:
    'border-[color:var(--color-border-strong)] bg-transparent text-[color:var(--color-text)] hover:border-[color:var(--color-accent)]',
  muted:
    'border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] font-medium text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]',
};

/** Daylight brand button. Renders a Link (href), external anchor (href + external), or button. */
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

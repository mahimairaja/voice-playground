'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/shadcn/utils';

interface TabSpec {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const TABS: TabSpec[] = [
  { href: '/', label: 'Home', match: (p) => p === '/' },
  { href: '/demos', label: 'Demos', match: (p) => p.startsWith('/demos') },
  { href: '/about', label: 'About', match: (p) => p.startsWith('/about') },
];

interface TopBarProps {
  brandTag?: string;
  className?: string;
}

export function TopBar({ brandTag = '// playground v1', className }: TopBarProps) {
  const pathname = usePathname() ?? '/';

  return (
    <header
      role="banner"
      className={cn(
        'fixed top-0 left-0 z-50 hidden w-full md:flex',
        'bg-paper border-line-soft items-center gap-6 border-b border-dashed px-6 py-3',
        className
      )}
    >
      <Link href="/" className="brand brand-accent" aria-label="Mahimai AI playground home">
        <span className="dot" aria-hidden="true" />
        <span>mahimai</span>
        <span className="tag">{brandTag}</span>
      </Link>

      <nav
        role="tablist"
        aria-label="Primary"
        className="ml-auto flex flex-wrap items-center gap-1"
      >
        {TABS.map((tab) => {
          const selected = tab.match(pathname);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              role="tab"
              aria-selected={selected}
              className="tab"
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

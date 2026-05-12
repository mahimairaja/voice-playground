'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CRED_CHANGE_EVENT, CRED_OPEN_DRAWER_EVENT, CRED_PREFIX } from '@/lib/credentials/store';
import { cn } from '@/lib/shadcn/utils';

interface TabSpec {
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}

const TABS: TabSpec[] = [
  { href: '/demos', label: 'demos', match: (p) => p.startsWith('/demos') },
  { href: '/about', label: 'about', match: (p) => p.startsWith('/about') },
];

const KEY_CHIP_CREDENTIALS = ['openai', 'deepgram', 'cartesia', 'livekit_url'] as const;

interface TopBarProps {
  brandTag?: string;
  className?: string;
}

export function TopBar({ brandTag = '· playground', className }: TopBarProps) {
  const pathname = usePathname() ?? '/';
  const savedKeys = useSavedKeyCount();

  return (
    <header
      role="banner"
      className={cn(
        'fixed top-0 left-0 z-50 hidden w-full md:flex',
        'bg-paper border-line-soft items-center gap-6 border-b border-dashed px-6 py-3',
        className
      )}
    >
      <Link href="/" className="brand brand-accent" aria-label="mahimai playground home">
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
      <button
        type="button"
        className="key-state cursor-pointer"
        onClick={() => window.dispatchEvent(new CustomEvent(CRED_OPEN_DRAWER_EVENT))}
        aria-label="Open keys drawer"
      >
        ◐ keys · {savedKeys} of {KEY_CHIP_CREDENTIALS.length}
      </button>
    </header>
  );
}

function useSavedKeyCount(): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        setCount(
          KEY_CHIP_CREDENTIALS.filter((key) =>
            window.localStorage.getItem(`${CRED_PREFIX}${key}`)?.trim()
          ).length
        );
      } catch {
        setCount(0);
      }
    };

    read();
    window.addEventListener('storage', read);
    window.addEventListener(CRED_CHANGE_EVENT, read);
    return () => {
      window.removeEventListener('storage', read);
      window.removeEventListener(CRED_CHANGE_EVENT, read);
    };
  }, []);

  return count;
}

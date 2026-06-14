'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global header. Sticky 60px, translucent backdrop-blur, bottom hairline.
 *
 *   left:  ● voice·playground   (amber signal dot + mono wordmark; routes to '/')
 *   right: demos · about · contribute · cookbook ↗   (mono 12px; active item underlined amber)
 *
 * No keys indicator. F1.1 decision: keys UI lives entirely on the demo page,
 * not in global chrome.
 */

const COOKBOOK_URL = 'https://github.com/mahimairaja/awesome-voice-apps';

interface NavItem {
  href: string;
  label: string;
  external?: boolean;
  match?: (pathname: string) => boolean;
}

const NAV: NavItem[] = [
  {
    href: '/demos',
    label: 'demos',
    match: (p) => p === '/demos' || p.startsWith('/demos/'),
  },
  { href: '/about', label: 'about', match: (p) => p.startsWith('/about') },
  { href: '/contribute', label: 'contribute', match: (p) => p.startsWith('/contribute') },
  { href: COOKBOOK_URL, label: 'cookbook', external: true },
];

export function PlaygroundHeader() {
  const pathname = usePathname() ?? '/';

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-[color:var(--color-border)] px-6 backdrop-blur-[10px] sm:px-8"
      style={{ background: 'rgba(250,248,243,0.85)' }}
    >
      <Link
        href="/"
        aria-label="voice playground home"
        className="group flex items-center gap-[11px] font-mono text-[14px] tracking-[0.06em] text-[color:var(--color-text)]"
      >
        <span
          aria-hidden="true"
          className="h-[11px] w-[11px] shrink-0 rounded-full bg-[color:var(--color-accent)]"
        />
        <span>
          voice<span className="text-[color:var(--color-accent-deep)]">·</span>playground
        </span>
      </Link>

      <nav aria-label="Primary" className="flex items-center gap-[26px] font-mono text-[13px]">
        {NAV.map((item) => {
          const isActive = !item.external && (item.match?.(pathname) ?? pathname === item.href);
          const className =
            'relative pb-[3px] transition-colors ' +
            (isActive
              ? 'text-[color:var(--color-text)]'
              : 'text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]');

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className={className}
              >
                {item.label}
                <span className="ml-1 text-[11px] text-[color:var(--color-text-mute)]">↗</span>
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              {item.label}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-[2px] bg-[color:var(--color-accent-deep)]"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

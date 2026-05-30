'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global header. Sticky 60px, translucent backdrop-blur, bottom hairline.
 *
 *   left:  ● voice·playground   (amber signal dot + mono wordmark; routes to '/')
 *   right: demos · about · cookbook ↗   (mono 12px; active item underlined amber)
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
  { href: COOKBOOK_URL, label: 'cookbook', external: true },
];

export function PlaygroundHeader() {
  const pathname = usePathname() ?? '/';

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 flex h-[60px] items-center justify-between border-b border-[color:var(--color-border-dim)] px-6 backdrop-blur-[10px] sm:px-8"
      style={{ background: 'rgba(13,10,6,0.82)' }}
    >
      <Link
        href="/"
        aria-label="voice playground home"
        className="group flex items-center gap-[11px] font-mono text-[13.5px] tracking-[0.06em] text-[color:var(--color-text)]"
      >
        <span
          aria-hidden="true"
          className="h-[11px] w-[11px] shrink-0 rounded-full bg-[color:var(--color-accent)]"
          style={{ boxShadow: '0 0 12px var(--color-accent)' }}
        />
        <span>
          voice<span className="text-[color:var(--color-accent)]">·</span>playground
        </span>
      </Link>

      <nav aria-label="Primary" className="flex items-center gap-[26px] font-mono text-[12px]">
        {NAV.map((item) => {
          const isActive = !item.external && (item.match?.(pathname) ?? pathname === item.href);
          const className =
            'relative pb-[3px] transition-colors ' +
            (isActive
              ? 'text-[color:var(--color-text)]'
              : 'text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]');

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
                <span className="ml-1 text-[10px] text-[color:var(--color-text-fade)]">↗</span>
              </a>
            );
          }

          return (
            <Link key={item.href} href={item.href} className={className}>
              {item.label}
              {isActive ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-[1.5px] bg-[color:var(--color-accent)]"
                  style={{ boxShadow: '0 0 8px var(--color-accent)' }}
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

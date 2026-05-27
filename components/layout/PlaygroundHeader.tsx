'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global header. Sticky 56px, dark surface, top + bottom hairlines.
 *
 *   left:  mahimai / playground   (mono breadcrumb; click routes to '/')
 *   right: demos · about · cookbook ↗   (Geist 13.5px; active item underlined cyan)
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
      className="sticky top-0 z-40 flex h-14 items-center gap-6 border-y border-[color:var(--color-border-dim)] bg-[color:var(--color-bg)] px-6"
    >
      <Link
        href="/"
        aria-label="mahimai playground home"
        className="font-mono text-[13.5px] tracking-tight text-[color:var(--color-text)] hover:text-white"
      >
        <span>VoiceGround</span>
        {/*<span className="mx-[2px] text-[color:var(--color-text-fade)]"> / </span>*/}
        {/*<span className="text-[color:var(--color-text-mute)]">playground</span>*/}
      </Link>

      <nav aria-label="Primary" className="ml-auto flex items-center gap-6">
        {NAV.map((item) => {
          const isActive = !item.external && (item.match?.(pathname) ?? pathname === item.href);
          const className =
            'relative text-[13.5px] py-1 transition-colors ' +
            (isActive
              ? 'text-[color:var(--color-text)]'
              : 'text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text-dim)]');

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
                  className="absolute inset-x-0 -bottom-[15px] h-[1.5px] bg-[color:var(--color-accent)]"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

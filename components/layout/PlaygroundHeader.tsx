'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Global header, matched to the mahimai.ca navigation skeleton: sticky solid
 * white, 64px tall, gray hairline, max-w-7xl inner container.
 *
 *   left:  ● mahimai voice playground   (teal mark + ink extrabold wordmark; routes to '/')
 *   right: Demos · About · Contribute · Cookbook ↗   (15px medium; active item underlined teal)
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
    label: 'Demos',
    match: (p) => p === '/demos' || p.startsWith('/demos/'),
  },
  { href: '/about', label: 'About', match: (p) => p.startsWith('/about') },
  { href: '/contribute', label: 'Contribute', match: (p) => p.startsWith('/contribute') },
  { href: COOKBOOK_URL, label: 'Cookbook', external: true },
];

export function PlaygroundHeader() {
  const pathname = usePathname() ?? '/';

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6">
        <Link href="/" aria-label="voice playground home" className="flex items-baseline gap-2.5">
          <span
            aria-hidden="true"
            className="h-[11px] w-[11px] shrink-0 self-center rounded-full bg-[color:var(--color-accent)]"
          />
          <span className="text-[19px] font-extrabold tracking-tight text-[color:var(--color-text)]">
            mahimai
          </span>
          <span className="hidden text-[15px] font-medium text-[color:var(--color-text-mute)] sm:inline">
            voice playground
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-6 text-[15px] font-medium">
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
                    className="absolute inset-x-0 -bottom-px h-[2px] bg-[color:var(--color-accent)]"
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

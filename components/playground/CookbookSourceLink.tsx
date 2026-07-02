import { demoSourceUrl } from '@/lib/cookbook/url';

/**
 * Small 'source ↗' chip linking to a demo's directory in the cookbook.
 * Reused on the demos-index card and on the per-demo page header strip.
 */

interface CookbookSourceLinkProps {
  slug: string;
  /** Visual variant. 'chip' is the demo-page header style, 'inline' is the card footer style. */
  variant?: 'chip' | 'inline';
}

export function CookbookSourceLink({ slug, variant = 'chip' }: CookbookSourceLinkProps) {
  const className =
    variant === 'chip'
      ? 'inline-flex items-center gap-1 rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-3 py-1.5 text-xs font-medium text-[color:var(--color-text-mute)] transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent-dim)]'
      : 'inline-flex items-center gap-1 text-xs font-medium text-[color:var(--color-text-mute)] transition-colors hover:text-[color:var(--color-accent-dim)]';
  return (
    <a href={demoSourceUrl(slug)} target="_blank" rel="noreferrer noopener" className={className}>
      source <span aria-hidden="true">↗</span>
    </a>
  );
}

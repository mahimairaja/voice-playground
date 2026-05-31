import type { CatalogFetchErrorCause } from '@/lib/cookbook/manifest';
import { COOKBOOK_BASE_URL } from '@/lib/cookbook/url';

/**
 * Explicit fallback when the cookbook fetch fails. Surfaces the failure
 * cause for ops and offers the canonical link to the cookbook itself, which
 * stays up regardless of the playground's reachability.
 */

interface CatalogErrorProps {
  cause: CatalogFetchErrorCause;
  /** Optional short message customising the lead line (defaults to "Cannot reach the cookbook."). */
  message?: string;
  /** Compact = used in landing's featured-cards slot. Default = full panel for the demos index. */
  compact?: boolean;
}

export function CatalogError({ cause, message, compact = false }: CatalogErrorProps) {
  const lead = message ?? 'Cannot reach the cookbook.';
  return (
    <div
      className={
        'rounded-[var(--radius-panel)] border border-[color:color-mix(in_srgb,var(--color-warning)_40%,transparent)] bg-[color:color-mix(in_srgb,var(--color-warning)_6%,transparent)] text-[color:var(--color-text-dim)] ' +
        (compact ? 'p-4 text-[13px]' : 'p-6 text-[14px]')
      }
    >
      <span className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.1em] text-[color:var(--color-warning)] uppercase">
        <span
          className="inline-block h-2 w-2 rounded-full bg-[color:var(--color-warning)]"
          style={{ boxShadow: '0 0 8px var(--color-warning)' }}
          aria-hidden="true"
        />
        CATALOG · UNREACHABLE
      </span>
      <p className="mt-2">{lead}</p>
      <p className="mt-3">
        <a
          href={COOKBOOK_BASE_URL}
          target="_blank"
          rel="noreferrer noopener"
          className="font-mono text-[color:var(--color-accent)] hover:underline"
        >
          → View the cookbook on GitHub
        </a>
      </p>
      <p className="mt-3 font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        cause: {cause}
      </p>
    </div>
  );
}

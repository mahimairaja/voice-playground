'use client';

import { useVotes } from './UpvoteProvider';

/**
 * An upvote pill: "▲ N", filled when the visitor has voted. Toggles optimistically
 * on click. `preventDefault`/`stopPropagation` keep a click off the card's link.
 * Renders nothing when there is no provider or the backend is not configured.
 */
export function UpvoteButton({ slug }: { slug: string }) {
  const votes = useVotes();
  if (!votes || !votes.configured) return null;

  const count = votes.counts[slug] ?? 0;
  const isVoted = votes.voted.has(slug);

  return (
    <button
      type="button"
      aria-pressed={isVoted}
      aria-label={isVoted ? `Remove upvote (${count})` : `Upvote (${count})`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        votes.toggle(slug);
      }}
      className={`inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2 py-0.5 text-xs tabular-nums transition-colors ${
        isVoted
          ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] font-semibold text-white'
          : 'border-[color:var(--color-border)] text-[color:var(--color-text-mute)] hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-text)]'
      }`}
    >
      <span aria-hidden="true">▲</span>
      {count}
    </button>
  );
}

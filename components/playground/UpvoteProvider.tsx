'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

/**
 * Holds vote counts and the visitor's voted set for the whole app, fetched once
 * from GET /api/votes. `toggle` updates optimistically and POSTs, reverting on
 * error. When the API reports the backend is not configured, `configured` stays
 * false and the buttons render nothing.
 */

interface VotesContextValue {
  configured: boolean;
  counts: Record<string, number>;
  voted: Set<string>;
  toggle: (slug: string) => void;
}

const VotesContext = createContext<VotesContextValue | null>(null);

export function useVotes(): VotesContextValue | null {
  return useContext(VotesContext);
}

export function UpvoteProvider({ children }: { children: React.ReactNode }) {
  const [configured, setConfigured] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(() => new Set());
  // One in-flight request per slug, so rapid clicks cannot apply responses out
  // of order or revert against a stale closure value.
  const pending = useRef<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    fetch('/api/votes')
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        setConfigured(Boolean(d?.configured));
        setCounts(d?.counts ?? {});
        setVoted(new Set(d?.voted ?? []));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback(
    (slug: string) => {
      if (pending.current.has(slug)) return;
      pending.current.add(slug);

      const wasVoted = voted.has(slug);
      const delta = wasVoted ? -1 : 1;

      const setVotedFor = (on: boolean) =>
        setVoted((prev) => {
          const next = new Set(prev);
          if (on) next.add(slug);
          else next.delete(slug);
          return next;
        });

      // optimistic
      setVotedFor(!wasVoted);
      setCounts((prev) => ({ ...prev, [slug]: Math.max(0, (prev[slug] ?? 0) + delta) }));

      fetch(`/api/votes/${encodeURIComponent(slug)}`, { method: 'POST' })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((d) => {
          if (typeof d?.count === 'number') {
            setCounts((prev) => ({ ...prev, [slug]: d.count }));
          }
          if (typeof d?.voted === 'boolean') setVotedFor(d.voted);
        })
        .catch(() => {
          // revert
          setVotedFor(wasVoted);
          setCounts((prev) => ({ ...prev, [slug]: Math.max(0, (prev[slug] ?? 0) - delta) }));
        })
        .finally(() => {
          pending.current.delete(slug);
        });
    },
    [voted]
  );

  return (
    <VotesContext.Provider value={{ configured, counts, voted, toggle }}>
      {children}
    </VotesContext.Provider>
  );
}

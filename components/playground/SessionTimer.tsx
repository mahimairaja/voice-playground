'use client';

import { useEffect, useState } from 'react';
import type { SessionState } from '@/hooks/useDemoSession';

/**
 * mm:ss timer that starts when the session enters 'live' and freezes when
 * it transitions to 'ended' or 'error'.
 *
 * Two render modes:
 *   - default: a small mono crumb with an ON-AIR / ENDED / ERROR suffix.
 *   - variant="value": just the mm:ss readout, for the SCOPE footer's
 *     DURATION cell. Renders a dotted placeholder before the session starts.
 */

interface SessionTimerProps {
  state: SessionState;
  variant?: 'crumb' | 'value';
}

function format(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function SessionTimer({ state, variant = 'crumb' }: SessionTimerProps) {
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state === 'live') {
      if (startedAt === null) {
        const now = Date.now();
        setStartedAt(now);
        setElapsed(0);
      }
    } else if (state === 'idle' || state === 'connecting') {
      setStartedAt(null);
      setElapsed(0);
    }
  }, [state, startedAt]);

  useEffect(() => {
    if (state !== 'live' || startedAt === null) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [state, startedAt]);

  if (variant === 'value') {
    if (state === 'idle' || state === 'connecting') return <>··</>;
    return <>{format(elapsed)}</>;
  }

  if (state === 'idle' || state === 'connecting') return null;

  const suffix = state === 'live' ? 'ON-AIR' : state === 'ended' ? 'ENDED' : 'ERROR';

  return (
    <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--color-text-mute)] uppercase">
      · {format(elapsed)} {suffix}
    </span>
  );
}

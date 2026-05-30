'use client';

import { useState } from 'react';
import { LIVEKIT_KEYS } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';
import { CredentialsSheet } from './CredentialsSheet';

/**
 * Per-demo trigger for the credentials sheet. Three visual states:
 *
 *   - ready (all three LiveKit keys present): amber pill, "● LIVEKIT · READY".
 *   - partial (some missing): ghost button, "Set keys · N missing".
 *   - storage unavailable: disabled ghost, "Storage blocked".
 *
 * Click always opens the sheet. The same button doubles as the edit affordance
 * once keys are filled.
 */

interface CredentialsButtonProps {
  demoTitle: string;
}

export function CredentialsButton({ demoTitle }: CredentialsButtonProps) {
  const { isReady, missing, unavailable } = useCredentials(LIVEKIT_KEYS);
  const [open, setOpen] = useState(false);

  let label: string;
  let dotColor: string | null = null;
  let classes: string;
  if (unavailable) {
    label = 'Storage blocked';
    classes =
      'border border-[color:var(--color-border)] text-[color:var(--color-text-fade)] cursor-not-allowed';
  } else if (isReady) {
    label = 'LIVEKIT · READY';
    dotColor = 'var(--color-live)';
    classes =
      'border border-[color:var(--color-accent)] text-[color:var(--color-accent)] hover:bg-[color:var(--color-accent-soft)]';
  } else {
    label = `Set keys · ${missing.length} missing`;
    classes =
      'border border-[color:var(--color-border-strong)] text-[color:var(--color-text)] hover:border-[color:var(--color-accent)]';
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={unavailable}
        className={`inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-1.5 font-mono text-[10.5px] tracking-[0.08em] uppercase transition-colors ${classes}`}
      >
        {dotColor ? (
          <span
            className="h-[7px] w-[7px] rounded-full"
            style={{ background: dotColor, boxShadow: `0 0 8px ${dotColor}` }}
          />
        ) : null}
        {label}
      </button>
      <CredentialsSheet open={open} onOpenChange={setOpen} demoTitle={demoTitle} />
    </>
  );
}

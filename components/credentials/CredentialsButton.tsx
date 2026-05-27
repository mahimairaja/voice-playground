'use client';

import { useState } from 'react';
import { useCredentials } from '@/lib/credentials/useCredentials';
import { CredentialsSheet } from './CredentialsSheet';

/**
 * Per-demo trigger for the credentials sheet. Three visual states:
 *
 *   - ready (all required keys present): cyan pill, "● KEYS · READY".
 *   - partial (some missing): ghost button, "Set keys · N missing".
 *   - storage unavailable: disabled ghost, "Storage blocked".
 *
 * Click always opens the sheet. The same button doubles as the edit affordance
 * once keys are filled.
 */

interface CredentialsButtonProps {
  requiredKeys: readonly string[];
  demoTitle: string;
}

export function CredentialsButton({ requiredKeys, demoTitle }: CredentialsButtonProps) {
  const { isReady, missing, unavailable } = useCredentials(requiredKeys);
  const [open, setOpen] = useState(false);

  let label: string;
  let classes: string;
  if (unavailable) {
    label = 'Storage blocked';
    classes =
      'border border-[color:var(--color-border)] text-[color:var(--color-text-fade)] cursor-not-allowed';
  } else if (isReady) {
    label = `● KEYS · READY · ${requiredKeys.length}/${requiredKeys.length}`;
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
        {label}
      </button>
      <CredentialsSheet
        open={open}
        onOpenChange={setOpen}
        requiredKeys={requiredKeys}
        demoTitle={demoTitle}
      />
    </>
  );
}

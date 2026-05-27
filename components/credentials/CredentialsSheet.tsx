'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { CredentialMap } from '@/lib/credentials/store';
import { CRED_OPEN_DRAWER_EVENT } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';

/**
 * Right-side sheet for the per-demo credentials flow. Renders one masked input
 * per item in 'requiredKeys', driven by the demo's manifest. Saves to the
 * existing 'mahimai_playground:cred:<name>' localStorage entries.
 *
 * Also listens for 'CRED_OPEN_DRAWER_EVENT' on the window so banners or other
 * affordances can open it without holding shared parent state.
 */

interface CredentialsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredKeys: readonly string[];
  demoTitle: string;
}

export function CredentialsSheet({
  open,
  onOpenChange,
  requiredKeys,
  demoTitle,
}: CredentialsSheetProps) {
  const { values, missing, saveMany, clearAll, unavailable } = useCredentials(requiredKeys);
  const [draft, setDraft] = useState<CredentialMap>(values);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelConfirmTimer = () => {
    if (confirmTimerRef.current !== null) {
      clearTimeout(confirmTimerRef.current);
      confirmTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cancelConfirmTimer();
    };
  }, []);

  useEffect(() => {
    if (open) {
      setDraft(values);
      setRevealed({});
      setConfirmingClear(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const onOpenEvent = () => onOpenChange(true);
    window.addEventListener(CRED_OPEN_DRAWER_EVENT, onOpenEvent);
    return () => window.removeEventListener(CRED_OPEN_DRAWER_EVENT, onOpenEvent);
  }, [onOpenChange]);

  const dirty = useMemo(
    () => requiredKeys.some((k) => (draft[k] ?? '') !== (values[k] ?? '')),
    [draft, values, requiredKeys]
  );

  const handleSave = () => {
    try {
      const trimmed: CredentialMap = {};
      for (const key of requiredKeys) {
        trimmed[key] = (draft[key] ?? '').trim();
      }
      saveMany(trimmed);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Storage may be full.');
    }
  };

  const handleClearClick = () => {
    if (!confirmingClear) {
      setConfirmingClear(true);
      cancelConfirmTimer();
      confirmTimerRef.current = setTimeout(() => {
        setConfirmingClear(false);
        confirmTimerRef.current = null;
      }, 2000);
      return;
    }
    cancelConfirmTimer();
    clearAll();
    setDraft(Object.fromEntries(requiredKeys.map((k) => [k, ''])));
    setConfirmingClear(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[color:color-mix(in_srgb,var(--color-bg)_75%,transparent)]" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-full max-w-[640px] flex-col gap-4 border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl md:w-[56vw]">
          <header className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border-dim)] pb-4">
            <div>
              <div className="font-mono text-[10.5px] tracking-[0.08em] text-[color:var(--color-accent)] uppercase">
                CREDENTIALS · NOTHING LEAVES YOUR BROWSER
              </div>
              <Dialog.Title className="mt-1 text-[15px] font-semibold tracking-tight text-[color:var(--color-text)]">
                {demoTitle} · {requiredKeys.length} keys
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-[12.5px] text-[color:var(--color-text-mute)]">
                LiveKit creds mint the room token in the browser. The rest travel to your local
                agent via participant attributes when the call starts.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close credentials"
              className="text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
            >
              ×
            </Dialog.Close>
          </header>

          {unavailable ? (
            <div className="rounded-[var(--radius-panel)] border border-[color:var(--color-warning)] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3 font-mono text-[11px] text-[color:var(--color-warning)]">
              localStorage is blocked. Enable site data to save credentials.
            </div>
          ) : null}

          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {requiredKeys.map((key) => {
              const isMissing = missing.includes(key);
              const reveal = !!revealed[key];
              return (
                <label key={key} className="flex flex-col gap-1.5">
                  <span
                    className={
                      'font-mono text-[10.5px] tracking-[0.06em] uppercase ' +
                      (isMissing
                        ? 'text-[color:var(--color-warning)]'
                        : 'text-[color:var(--color-text-mute)]')
                    }
                  >
                    {key}
                    {isMissing ? ' · missing' : ''}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type={reveal ? 'text' : 'password'}
                      value={draft[key] ?? ''}
                      onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                      placeholder={
                        key === 'livekit_url' ? 'wss://your-project.livekit.cloud' : 'paste value'
                      }
                      disabled={unavailable}
                      className="flex-1 rounded-[var(--radius-input)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 font-mono text-[12.5px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-fade)] focus:border-[color:var(--color-border-strong)] focus:outline-none disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                      className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-mute)] uppercase hover:text-[color:var(--color-text-dim)]"
                    >
                      {reveal ? 'hide' : 'show'}
                    </button>
                  </div>
                </label>
              );
            })}
          </div>

          {error ? (
            <div className="font-mono text-[11px] text-[color:var(--color-danger)]">{error}</div>
          ) : null}

          <div className="mt-auto flex flex-col gap-3 border-t border-[color:var(--color-border-dim)] pt-4">
            <p className="font-mono text-[10.5px] leading-[1.6] text-[color:var(--color-text-fade)]">
              stored as{' '}
              <code className="text-[color:var(--color-accent)]">
                mahimai_playground:cred:&lt;name&gt;
              </code>{' '}
              entries in localStorage. clear from devtools or the button below.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={!dirty || unavailable}
                className="rounded-[var(--radius-button)] bg-[color:var(--color-accent)] px-4 py-2 text-[13px] font-semibold text-[color:var(--color-bg)] hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[color:var(--color-surface-2)] disabled:text-[color:var(--color-text-fade)]"
              >
                Save &amp; close
              </button>
              <button
                type="button"
                onClick={handleClearClick}
                className={
                  'rounded-[var(--radius-button)] border px-4 py-2 text-[13px] ' +
                  (confirmingClear
                    ? 'border-[color:var(--color-danger)] text-[color:var(--color-danger)]'
                    : 'border-[color:var(--color-border)] text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]')
                }
              >
                {confirmingClear ? 'Click again to clear' : 'Clear all'}
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

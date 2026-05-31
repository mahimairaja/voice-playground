'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Btn, Eyebrow } from '@/components/phosphor';
import type { CredentialMap } from '@/lib/credentials/store';
import { CRED_OPEN_DRAWER_EVENT, LIVEKIT_KEYS } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';

/**
 * Right-side sheet for the LiveKit credentials flow. Renders one masked input
 * for each of the three 'LIVEKIT_KEYS' values. Saves to the existing
 * 'mahimai_playground:cred:<name>' localStorage entries.
 *
 * Also listens for 'CRED_OPEN_DRAWER_EVENT' on the window so banners or other
 * affordances can open it without holding shared parent state.
 */

interface CredentialsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demoTitle: string;
}

export function CredentialsSheet({ open, onOpenChange, demoTitle }: CredentialsSheetProps) {
  const requiredKeys = LIVEKIT_KEYS;
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

  const ready = missing.length === 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[rgba(0,0,0,0.6)]" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-[min(440px,92vw)] flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[-30px_0_80px_rgba(0,0,0,0.6)]">
          <header className="flex items-center justify-between gap-4 border-b border-[color:var(--color-border-dim)] px-[22px] py-[18px]">
            <div>
              <Eyebrow accent>{'// credentials vault'}</Eyebrow>
              <Dialog.Title className="mt-1.5 text-[18px] font-semibold text-[color:var(--color-text)]">
                Bring your own keys
              </Dialog.Title>
              <Dialog.Description className="sr-only">
                {demoTitle} LiveKit credentials. Stored only in this browser. Provider keys live in
                your local agent .env.
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close credentials"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] border border-[color:var(--color-border)] bg-transparent font-mono text-[14px] text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
            >
              ✕
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-[22px] py-5">
            <p className="m-0 mb-5 text-[13px] leading-[1.55] text-[color:var(--color-text-mute)]">
              Stored only in this browser&apos;s localStorage. Never logged, never sent to a server.
              The LiveKit token is minted client-side from your key and secret.
            </p>

            {unavailable ? (
              <div className="mb-5 rounded-[var(--radius-panel)] border border-[color:var(--color-warning)] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3 font-mono text-[11px] text-[color:var(--color-warning)]">
                localStorage is blocked. Enable site data to save credentials.
              </div>
            ) : null}

            <Eyebrow>{'// livekit'}</Eyebrow>
            <div className="mt-3 flex flex-col gap-[13px]">
              {requiredKeys.map((key) => {
                const isMissing = missing.includes(key);
                const reveal = !!revealed[key];
                return (
                  <label key={key} className="block">
                    <span
                      className={
                        'font-mono text-[11px] tracking-[0.04em] ' +
                        (isMissing
                          ? 'text-[color:var(--color-warning)]'
                          : 'text-[color:var(--color-text-dim)]')
                      }
                    >
                      {key}
                      {isMissing ? ' · missing' : ''}
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input
                        type={reveal ? 'text' : 'password'}
                        value={draft[key] ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        placeholder={
                          key === 'livekit_url' ? 'wss://your-project.livekit.cloud' : 'paste value'
                        }
                        disabled={unavailable}
                        className="w-full flex-1 rounded-[7px] border border-[color:var(--color-border)] bg-[color:var(--color-scope)] px-3 py-2.5 font-mono text-[13px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-fade)] focus:border-[color:var(--color-accent)] focus:outline-none disabled:opacity-50"
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

            <div className="mt-[22px]">
              <Eyebrow>{'// provider keys'}</Eyebrow>
              <div className="mt-2.5 rounded-[8px] border border-dashed border-[color:var(--color-border)] p-3.5 font-mono text-[11.5px] leading-[1.6] text-[color:var(--color-text-mute)]">
                OpenAI, Deepgram, ElevenLabs &amp; friends stay in the{' '}
                <span className="text-[color:var(--color-accent)]">agent&apos;s .env</span> on your
                machine, not here. The playground only needs LiveKit to join the room.
              </div>
            </div>

            {error ? (
              <div className="mt-4 font-mono text-[11px] text-[color:var(--color-danger)]">
                {error}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 border-t border-[color:var(--color-border-dim)] px-[22px] py-4">
            <span
              className="mr-auto flex items-center gap-[7px] font-mono text-[11px]"
              style={{ color: ready ? 'var(--color-live)' : 'var(--color-warning)' }}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{
                  background: ready ? 'var(--color-live)' : 'var(--color-warning)',
                  boxShadow: `0 0 8px ${ready ? 'var(--color-live)' : 'var(--color-warning)'}`,
                }}
              />
              {ready ? 'ready to connect' : 'livekit incomplete'}
            </span>
            <Btn kind="muted" onClick={handleClearClick} className="px-3.5 py-2.5">
              {confirmingClear ? 'click again' : 'clear'}
            </Btn>
            <Btn
              kind="primary"
              onClick={handleSave}
              disabled={!dirty || unavailable}
              className="px-4 py-2.5"
            >
              save keys
            </Btn>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

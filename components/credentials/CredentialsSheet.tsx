'use client';

import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { AlertDialog as AlertDialogPrimitive } from 'radix-ui';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { Btn, Eyebrow } from '@/components/phosphor';
import type { CredentialMap } from '@/lib/credentials/store';
import { CRED_OPEN_DRAWER_EVENT, LIVEKIT_KEYS } from '@/lib/credentials/store';
import { useCredentials } from '@/lib/credentials/useCredentials';

/**
 * Right-side sheet for the LiveKit credentials flow. One labelled field per
 * 'LIVEKIT_KEYS' entry, written in plain language for non-developers, with a
 * description line and an eye toggle on the secret fields. Saves to the
 * existing 'mahimai_playground:cred:<name>' localStorage entries. Clearing
 * asks through an explicit confirm dialog (no hidden double-click timer).
 *
 * Also listens for 'CRED_OPEN_DRAWER_EVENT' on the window so banners or other
 * affordances can open it without holding shared parent state.
 */

interface CredentialsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  demoTitle: string;
}

interface FieldMeta {
  label: string;
  description: string;
  placeholder: string;
  secret: boolean;
}

const FIELD_META: Record<string, FieldMeta> = {
  livekit_url: {
    label: 'LiveKit URL',
    description: 'Starts with wss://. From your LiveKit Cloud project settings.',
    placeholder: 'wss://your-project.livekit.cloud',
    secret: false,
  },
  livekit_api_key: {
    label: 'API key',
    description: 'Looks like APIxxxxxxxx. Stays in this browser.',
    placeholder: 'APIxxxxxxxx',
    secret: true,
  },
  livekit_api_secret: {
    label: 'API secret',
    description: 'Never leaves your browser; the access token is minted locally.',
    placeholder: 'paste your secret',
    secret: true,
  },
};

function metaFor(key: string): FieldMeta {
  return (
    FIELD_META[key] ?? {
      label: key,
      description: '',
      placeholder: 'paste value',
      secret: true,
    }
  );
}

export function CredentialsSheet({ open, onOpenChange, demoTitle }: CredentialsSheetProps) {
  const requiredKeys = LIVEKIT_KEYS;
  const { values, missing, saveMany, clearAll, unavailable } = useCredentials(requiredKeys);
  const [draft, setDraft] = useState<CredentialMap>(values);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(values);
      setRevealed({});
      setConfirmOpen(false);
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
      toast.success('Keys saved in this browser');
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Storage may be full.');
    }
  };

  const handleConfirmedClear = () => {
    clearAll();
    setDraft(Object.fromEntries(requiredKeys.map((k) => [k, ''])));
    setConfirmOpen(false);
    toast('Keys removed from this browser');
  };

  const ready = missing.length === 0;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-[rgba(17,22,28,0.35)]" />
        <Dialog.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right fixed inset-y-0 right-0 z-50 flex w-[min(440px,92vw)] flex-col border-l border-[color:var(--color-border)] bg-[color:var(--color-bg)] shadow-[-12px_0_40px_rgba(17,22,28,0.14)]">
          <header className="flex items-center justify-between gap-4 border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-[22px] py-[18px]">
            <div>
              <Eyebrow accent>your livekit keys</Eyebrow>
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
              className="flex h-[30px] w-[30px] items-center justify-center rounded-[6px] border border-[color:var(--color-border)] bg-transparent text-sm text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
            >
              ✕
            </Dialog.Close>
          </header>

          <div className="flex-1 overflow-y-auto px-[22px] py-5">
            <p className="m-0 mb-5 text-[14px] leading-[1.6] text-[color:var(--color-text-dim)]">
              Stored only in this browser&apos;s localStorage. Never logged, never sent to a server.
              The LiveKit token is minted client-side from your key and secret.
            </p>

            {unavailable ? (
              <div className="mb-5 rounded-[var(--radius-panel)] border border-[color:var(--color-warning)] bg-[color:color-mix(in_srgb,var(--color-warning)_10%,transparent)] p-3 text-[13px] text-[color:var(--color-warning)]">
                localStorage is blocked. Enable site data to save credentials.
              </div>
            ) : null}

            <div className="flex flex-col gap-[18px]">
              {requiredKeys.map((key) => {
                const meta = metaFor(key);
                const isMissing = missing.includes(key);
                const reveal = !meta.secret || !!revealed[key];
                return (
                  <label key={key} className="block">
                    <span className="flex items-baseline gap-2">
                      <span className="text-[14px] font-semibold text-[color:var(--color-text)]">
                        {meta.label}
                      </span>
                      {isMissing ? (
                        <span className="text-xs text-[color:var(--color-warning)]">missing</span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block text-[12.5px] leading-[1.5] text-[color:var(--color-text-mute)]">
                      {meta.description}
                    </span>
                    <div className="relative mt-2">
                      <input
                        type={reveal ? 'text' : 'password'}
                        value={draft[key] ?? ''}
                        onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                        placeholder={meta.placeholder}
                        disabled={unavailable}
                        className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] px-3 py-2.5 pr-10 font-mono text-[13.5px] text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-mute)] focus:border-[color:var(--color-accent-dim)] focus:outline-none disabled:opacity-50"
                      />
                      {meta.secret ? (
                        <button
                          type="button"
                          onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                          aria-label={reveal ? `Hide ${meta.label}` : `Show ${meta.label}`}
                          className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[color:var(--color-text-mute)] hover:text-[color:var(--color-text)]"
                        >
                          {reveal ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      ) : null}
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-[22px]">
              <Eyebrow>provider keys</Eyebrow>
              <div className="mt-2.5 rounded-[8px] border border-dashed border-[color:var(--color-border)] p-3.5 text-[13px] leading-[1.6] text-[color:var(--color-text-mute)]">
                OpenAI, Deepgram, ElevenLabs &amp; friends stay in the{' '}
                <span className="font-mono text-[12px] text-[color:var(--color-accent-dim)]">
                  agent&apos;s .env
                </span>{' '}
                on your machine, not here. The playground only needs LiveKit to join the room.
              </div>
            </div>

            {error ? (
              <div className="mt-4 text-[13px] text-[color:var(--color-danger)]">{error}</div>
            ) : null}
          </div>

          <div className="flex items-center gap-3 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-[22px] py-4">
            <span
              className="mr-auto flex items-center gap-[7px] text-xs"
              style={{ color: ready ? 'var(--color-live)' : 'var(--color-warning)' }}
            >
              <span
                className="h-[7px] w-[7px] rounded-full"
                style={{ background: ready ? 'var(--color-live)' : 'var(--color-warning)' }}
              />
              {ready ? 'ready to connect' : 'livekit incomplete'}
            </span>

            <Btn
              kind="muted"
              onClick={() => setConfirmOpen(true)}
              disabled={unavailable}
              className="px-3.5 py-2.5"
            >
              clear
            </Btn>
            <AlertDialogPrimitive.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogPrimitive.Portal>
                <AlertDialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-[60] bg-[rgba(17,22,28,0.35)]" />
                <AlertDialogPrimitive.Content className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 fixed top-1/2 left-1/2 z-[70] w-[min(380px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-panel)] border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)] p-5 shadow-[0_8px_40px_rgba(17,22,28,0.18)]">
                  <AlertDialogPrimitive.Title className="text-[16px] font-semibold text-[color:var(--color-text)]">
                    Remove your LiveKit keys from this browser?
                  </AlertDialogPrimitive.Title>
                  <AlertDialogPrimitive.Description className="mt-2 text-[13.5px] leading-[1.55] text-[color:var(--color-text-dim)]">
                    The three saved values are deleted from localStorage. You can paste them again
                    any time.
                  </AlertDialogPrimitive.Description>
                  <div className="mt-5 flex justify-end gap-3">
                    <AlertDialogPrimitive.Cancel className="inline-flex cursor-pointer items-center rounded-[var(--radius-button)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3.5 py-2 text-[13px] font-medium text-[color:var(--color-text-dim)] hover:text-[color:var(--color-text)]">
                      cancel
                    </AlertDialogPrimitive.Cancel>
                    <AlertDialogPrimitive.Action
                      onClick={handleConfirmedClear}
                      className="inline-flex cursor-pointer items-center rounded-[var(--radius-button)] border border-[color:color-mix(in_srgb,var(--color-danger)_45%,transparent)] px-3.5 py-2 text-[13px] font-semibold text-[color:var(--color-danger)] hover:border-[color:var(--color-danger)]"
                    >
                      Remove keys
                    </AlertDialogPrimitive.Action>
                  </div>
                </AlertDialogPrimitive.Content>
              </AlertDialogPrimitive.Portal>
            </AlertDialogPrimitive.Root>

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

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  CRED_OPEN_DRAWER_EVENT,
  type CredentialMap,
  clearAll,
  getCredentials,
  saveCredentials,
} from '@/lib/credentials/store';
import { knownProviders } from '@/lib/credentials/validate';
import { cn } from '@/lib/shadcn/utils';

const PROVIDER_LABEL: Record<string, string> = {
  openai: 'OpenAI',
  deepgram: 'Deepgram',
  cartesia: 'Cartesia',
  livekit: 'LiveKit',
  livekit_api_key: 'LiveKit API key',
  livekit_api_secret: 'LiveKit API secret',
};

const PROVIDER_PLACEHOLDER: Record<string, string> = {
  openai: 'sk-...',
  deepgram: 'dg_... (or hex)',
  cartesia: 'paste API key',
  livekit: 'wss://your-project.livekit.cloud',
  livekit_api_key: 'API...',
  livekit_api_secret: 'secret...',
};

function labelFor(key: string): string {
  return PROVIDER_LABEL[key] ?? key;
}

function placeholderFor(key: string): string {
  return PROVIDER_PLACEHOLDER[key] ?? 'paste key';
}

interface KeySlotProps {
  ok: boolean;
}

function KeySlot({ ok }: KeySlotProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        marginTop: 14,
        width: 26,
        height: 34,
        flex: '0 0 auto',
        border: '1.5px solid var(--ink)',
        borderRadius: '4px 4px 14px 14px',
        background: ok ? 'var(--vg-green-soft)' : 'var(--paper)',
        position: 'relative',
      }}
    >
      {ok && (
        <span
          style={{
            position: 'absolute',
            top: 5,
            left: 5,
            right: 5,
            height: 3,
            background: 'var(--vg-green)',
            borderRadius: 2,
          }}
        />
      )}
    </span>
  );
}

interface CredentialsDrawerProps {
  requiredCredentials: readonly string[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSaved?: (saved: CredentialMap) => void;
}

const KNOWN = new Set(knownProviders());

export function CredentialsDrawer({
  requiredCredentials,
  trigger,
  open,
  onOpenChange,
  onSaved,
}: CredentialsDrawerProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const [values, setValues] = useState<CredentialMap>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setValues(getCredentials(requiredCredentials));
    setRevealed({});
    setSavedFlash(false);
  }, [isOpen, requiredCredentials]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onRequest = () => handleOpenChange(true);
    window.addEventListener(CRED_OPEN_DRAWER_EVENT, onRequest);
    return () => window.removeEventListener(CRED_OPEN_DRAWER_EVENT, onRequest);
  }, [handleOpenChange]);

  const handleSave = useCallback(() => {
    const trimmed: CredentialMap = {};
    for (const [k, v] of Object.entries(values)) trimmed[k] = v.trim();
    saveCredentials(trimmed);
    setSavedFlash(true);
    onSaved?.(trimmed);
    setTimeout(() => handleOpenChange(false), 350);
  }, [values, onSaved, handleOpenChange]);

  const handleClearAll = useCallback(() => {
    clearAll();
    const blanks: CredentialMap = {};
    for (const k of requiredCredentials) blanks[k] = '';
    setValues(blanks);
    setRevealed({});
    onSaved?.(blanks);
  }, [requiredCredentials, onSaved]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {trigger ? (
        <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      ) : (
        <Dialog.Trigger className="btn">Open keys drawer →</Dialog.Trigger>
      )}

      <Dialog.Portal>
        <Dialog.Overlay
          className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50"
          style={{ background: 'color-mix(in srgb, var(--ink) 35%, transparent)' }}
        />
        <Dialog.Content
          className={cn(
            'fixed top-0 right-0 z-50 flex h-svh w-full max-w-md flex-col gap-0 overflow-y-auto',
            'border-ink data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right border-l-2'
          )}
          style={{
            background: 'var(--paper)',
            boxShadow: '-4px 0 0 var(--ink)',
          }}
        >
          <Dialog.Title className="sr-only">Provider credentials</Dialog.Title>
          <Dialog.Description className="sr-only">
            Paste API keys for the providers this demo needs. Keys are stored only in your browser
            and never sent to a server log.
          </Dialog.Description>

          <header
            className="flex items-start justify-between gap-3 border-b px-5 py-4"
            style={{ borderColor: 'var(--ink)', background: 'var(--paper-2)' }}
          >
            <div>
              <p className="tiny-mono">· vault · local only</p>
              <h2
                className="leading-[1.05]"
                style={{
                  fontFamily: 'var(--hand-title)',
                  fontWeight: 700,
                  fontSize: 28,
                  marginTop: 2,
                }}
              >
                your keys.
              </h2>
              <p className="tiny-mono mt-1" style={{ textTransform: 'none', letterSpacing: 0 }}>
                nothing leaves this browser.
              </p>
            </div>
            <Dialog.Close
              className="cursor-pointer rounded p-1 transition-opacity hover:opacity-70 focus-visible:outline-2"
              aria-label="Close"
              style={{ outlineColor: 'var(--accent-hex)' }}
            >
              <X size={18} />
            </Dialog.Close>
          </header>

          <div className="flex-1 px-5 py-5">
            {requiredCredentials.length === 0 ? (
              <div className="box dashed" style={{ padding: 14 }}>
                <p className="p-hand sm">This demo does not need any provider keys.</p>
              </div>
            ) : (
              <ul role="list" className="flex flex-col gap-4">
                {requiredCredentials.map((key) => {
                  const reveal = revealed[key] === true;
                  const ok = Boolean(values[key]?.trim());
                  const inputId = `cred-${key}`;
                  return (
                    <li key={key} className="flex items-start gap-3">
                      <KeySlot ok={ok} />
                      <div className="flex-1">
                        <label
                          htmlFor={inputId}
                          className="tiny-mono mb-1 flex items-center justify-between gap-2"
                        >
                          <span>
                            {labelFor(key)}
                            {!KNOWN.has(key) && (
                              <span style={{ marginLeft: 6, opacity: 0.6 }}>(no live check)</span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
                            className="flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
                            aria-label={reveal ? `Hide ${labelFor(key)}` : `Show ${labelFor(key)}`}
                            aria-pressed={reveal}
                          >
                            {reveal ? <EyeOff size={12} /> : <Eye size={12} />}
                            <span>{reveal ? 'hide' : 'show'}</span>
                          </button>
                        </label>
                        <input
                          id={inputId}
                          type={reveal ? 'text' : 'password'}
                          value={values[key] ?? ''}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [key]: e.currentTarget.value }))
                          }
                          autoComplete="off"
                          spellCheck={false}
                          placeholder={placeholderFor(key)}
                          className="w-full px-3 py-2 transition-colors outline-none focus:border-2"
                          style={{
                            background: 'var(--paper)',
                            color: 'var(--ink)',
                            fontFamily: 'var(--mono)',
                            fontSize: 13,
                            border: `1.5px ${ok ? 'solid' : 'dashed'} var(--ink)`,
                            borderRadius: 4,
                          }}
                        />
                      </div>
                      {ok && (
                        <span
                          aria-hidden="true"
                          style={{
                            border: '1.5px solid var(--vg-green)',
                            color: 'var(--vg-green)',
                            fontFamily: 'var(--mono)',
                            fontSize: 9,
                            letterSpacing: '0.16em',
                            padding: '2px 6px',
                            borderRadius: 3,
                            background: 'var(--paper)',
                            textTransform: 'uppercase',
                            transform: 'rotate(-6deg)',
                            marginTop: 16,
                          }}
                        >
                          OK
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            <p
              className="mt-5"
              style={{
                fontFamily: 'var(--hand-title)',
                fontStyle: 'italic',
                fontSize: 14,
                color: 'var(--accent-hex)',
              }}
            >
              ↑ tokens mint in your browser. our server sees nothing.
            </p>
            <p className="p-hand sm mt-3" style={{ color: 'var(--ink-soft)' }}>
              Stored in localStorage under <span className="kbd">mahimai_playground:cred</span>.
              Closing the tab keeps them; clearing site data wipes them.
            </p>
          </div>

          <footer
            className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3"
            style={{ borderColor: 'var(--ink)', background: 'var(--paper-2)' }}
          >
            <button
              type="button"
              onClick={handleClearAll}
              className="btn cursor-pointer"
              style={{ color: 'var(--ink-soft)' }}
            >
              Clear all
            </button>
            <div className="flex items-center gap-3">
              {savedFlash && <span className="tiny-mono">saved</span>}
              <button
                type="button"
                onClick={handleSave}
                className="btn accent brand-accent cursor-pointer"
                disabled={requiredCredentials.length === 0}
              >
                Save &amp; start →
              </button>
            </div>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

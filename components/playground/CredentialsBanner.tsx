'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, KeyRound } from 'lucide-react';
import { CRED_CHANGE_EVENT, CRED_OPEN_DRAWER_EVENT, CRED_PREFIX } from '@/lib/credentials/store';
import { missingCredentials } from '@/lib/credentials/validate';

function defaultOpenDrawer() {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new Event(CRED_OPEN_DRAWER_EVENT));
  } catch {
    /* ignore */
  }
}

const PROVIDER_LABEL: Record<string, string> = {
  openai: 'OpenAI',
  deepgram: 'Deepgram',
  cartesia: 'Cartesia',
  livekit: 'LiveKit',
  livekit_url: 'LiveKit URL',
  livekit_api_key: 'LiveKit API key',
  livekit_api_secret: 'LiveKit API secret',
};

function labelFor(key: string): string {
  return PROVIDER_LABEL[key] ?? key;
}

export interface RejectionDetail {
  provider: string;
  reason?: string;
}

interface CredentialsBannerProps {
  requiredCredentials: readonly string[];
  rejected?: RejectionDetail | null;
  onOpenDrawer?: () => void;
  className?: string;
}

export function CredentialsBanner({
  requiredCredentials,
  rejected,
  onOpenDrawer = defaultOpenDrawer,
  className,
}: CredentialsBannerProps) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith(CRED_PREFIX)) setTick((t) => t + 1);
    };
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener('storage', onStorage);
    window.addEventListener(CRED_CHANGE_EVENT, onChange);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(CRED_CHANGE_EVENT, onChange);
    };
  }, []);

  const missing = useMemo(
    () => missingCredentials(requiredCredentials),
    // re-evaluates on every storage tick
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [requiredCredentials, tick]
  );

  if (rejected) {
    return (
      <Banner
        kind="rejected"
        icon={<AlertTriangle size={16} />}
        title={`${labelFor(rejected.provider)} rejected the key`}
        body={
          rejected.reason ??
          'The provider returned 401 or 403 mid-session. Update the key and reconnect.'
        }
        cta="Edit keys"
        onCta={onOpenDrawer}
        className={className}
      />
    );
  }

  if (missing.length > 0) {
    const names = missing.map(labelFor).join(', ');
    return (
      <Banner
        kind="missing"
        icon={<KeyRound size={16} />}
        title={missing.length === 1 ? 'One key missing' : `${missing.length} keys missing`}
        body={`Add ${names} before starting the call. Keys live only in your browser.`}
        cta="Open keys drawer"
        onCta={onOpenDrawer}
        className={className}
      />
    );
  }

  return null;
}

interface BannerProps {
  kind: 'missing' | 'rejected';
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onCta?: () => void;
  className?: string;
}

function Banner({ kind, icon, title, body, cta, onCta, className }: BannerProps) {
  const palette =
    kind === 'rejected'
      ? { background: 'color-mix(in srgb, var(--accent-hex) 18%, var(--paper))' }
      : { background: 'var(--accent-soft-hex)' };

  return (
    <div
      role="status"
      aria-live="polite"
      data-banner-kind={kind}
      className={className}
      style={{
        border: '1.5px solid var(--ink)',
        borderRadius: 4,
        padding: '10px 14px',
        ...palette,
      }}
    >
      <div className="flex flex-wrap items-start gap-3">
        <span aria-hidden="true" style={{ marginTop: 2, color: 'var(--accent-hex)' }}>
          {icon}
        </span>
        <div className="flex-1">
          <p className="tiny-mono" style={{ color: 'var(--ink)' }}>
            {kind === 'rejected' ? 'session · key rejected' : 'session · keys missing'}
          </p>
          <p
            className="font-bold"
            style={{ fontFamily: 'var(--hand-title)', fontSize: 18, marginTop: 2 }}
          >
            {title}
          </p>
          <p className="p-hand sm" style={{ marginTop: 4 }}>
            {body}
          </p>
        </div>
        {onCta && (
          <button type="button" onClick={onCta} className="btn cursor-pointer">
            {cta}
          </button>
        )}
      </div>
    </div>
  );
}

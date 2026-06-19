'use client';

import { useState } from 'react';
import type { Room } from 'livekit-client';
import { Check, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { LIVEKIT_KEYS, getCredentials } from '@/lib/credentials/store';
import { mintToken } from '@/lib/livekit/mintToken';
import { buildJoinLink } from './links';

/**
 * Invite a second person onto the interpreter call. Mints a guest token for the
 * room the host is already in (same room, fresh identity, no agentName so
 * LiveKit does not dispatch a second interpreter) and copies a '/join' link that
 * carries the token in the URL fragment. Host-only; the guest never sees this.
 */
export function InviteToCall({ room, slug }: { room: Room; slug: string }) {
  const [copied, setCopied] = useState(false);

  const invite = async () => {
    try {
      const creds = getCredentials(LIVEKIT_KEYS);
      const guest = await mintToken({
        livekit_url: creds.livekit_url,
        livekit_api_key: creds.livekit_api_key,
        livekit_api_secret: creds.livekit_api_secret,
        slug,
        room: room.name,
      });
      const link = buildJoinLink(window.location.origin, guest.wsUrl, guest.token);
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success('Join link copied. Open it in another tab or send it to a phone.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'could not create the link';
      toast.error(`Invite failed: ${msg}`);
    }
  };

  return (
    <button
      type="button"
      onClick={invite}
      className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[color:var(--color-accent-dim)] bg-[color:color-mix(in_srgb,var(--color-accent)_12%,transparent)] px-3.5 py-2 font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-accent-dim)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-accent)_20%,transparent)]"
    >
      {copied ? (
        <Check size={15} className="text-[color:var(--color-live)]" />
      ) : (
        <Link2 size={15} />
      )}
      {copied ? 'link copied' : 'invite a guest'}
    </button>
  );
}

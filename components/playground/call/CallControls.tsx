'use client';

import type { ComponentType } from 'react';
import type { Room } from 'livekit-client';
import { Track } from 'livekit-client';
import { Mic, MicOff, PhoneOff, Video, VideoOff } from 'lucide-react';
import { useTrackToggle } from '@livekit/components-react';
import { InviteToCall } from './InviteToCall';

type ToggleSource = Track.Source.Microphone | Track.Source.Camera;
type IconType = ComponentType<{ size?: number }>;

/**
 * One media toggle (mic or camera) driven by LiveKit's useTrackToggle: clicking
 * publishes/unpublishes the track. The off state is warning-colored so a muted
 * mic or stopped camera reads at a glance.
 */
function MediaToggle({
  source,
  room,
  onIcon: OnIcon,
  offIcon: OffIcon,
  label,
}: {
  source: ToggleSource;
  room: Room;
  onIcon: IconType;
  offIcon: IconType;
  label: string;
}) {
  const { enabled, toggle, pending } = useTrackToggle({ source, room });
  const Icon = enabled ? OnIcon : OffIcon;
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={enabled}
      disabled={pending}
      onClick={() => void toggle()}
      className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[color:var(--color-border)] px-3.5 py-2 font-mono text-[12px] tracking-[0.04em] transition-colors disabled:opacity-50"
      style={{ color: enabled ? 'var(--color-text-dim)' : 'var(--color-warning)' }}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

/**
 * Bottom control bar for the call: mic and camera toggles, the host-only invite
 * control, and leave.
 */
export function CallControls({
  room,
  slug,
  showInvite,
  onLeave,
}: {
  room: Room;
  slug: string;
  showInvite: boolean;
  onLeave: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <MediaToggle
          source={Track.Source.Microphone}
          room={room}
          onIcon={Mic}
          offIcon={MicOff}
          label="mic"
        />
        <MediaToggle
          source={Track.Source.Camera}
          room={room}
          onIcon={Video}
          offIcon={VideoOff}
          label="camera"
        />
        {showInvite ? <InviteToCall room={room} slug={slug} /> : null}
      </div>
      <button
        type="button"
        onClick={onLeave}
        className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[color:color-mix(in_srgb,var(--color-warning)_45%,transparent)] px-3.5 py-2 font-mono text-[12px] tracking-[0.04em] text-[color:var(--color-warning)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--color-warning)_10%,transparent)]"
      >
        <PhoneOff size={15} />
        leave
      </button>
    </div>
  );
}

'use client';

import { VideoOff } from 'lucide-react';
import { VideoTrack, isTrackReference } from '@livekit/components-react';
import type { Tile } from './tiles';

/**
 * One participant tile. Shows the live camera when the track ref resolves to a
 * real publication; otherwise a camera-off placeholder. The local tile is
 * mirrored so the host/guest sees themselves the natural way round.
 */
export function VideoTile({ tile }: { tile: Tile }) {
  const ref = tile.trackRef;
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]">
      {isTrackReference(ref) ? (
        <VideoTrack
          trackRef={ref}
          className={`h-full w-full object-cover ${tile.isLocal ? 'scale-x-[-1]' : ''}`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-[color:var(--color-text-mute)]">
          <VideoOff size={22} />
          <span className="text-xs font-bold tracking-widest uppercase">camera off</span>
        </div>
      )}
      <span className="absolute bottom-2 left-2 rounded-[var(--radius-pill)] bg-[color:color-mix(in_srgb,var(--color-bg)_70%,transparent)] px-2 py-0.5 text-[13px] text-[color:var(--color-text-dim)]">
        {tile.label}
      </span>
    </div>
  );
}

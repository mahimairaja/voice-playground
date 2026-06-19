'use client';

import { useMemo } from 'react';
import type { Room } from 'livekit-client';
import { Track } from 'livekit-client';
import { useLocalParticipant, useTracks } from '@livekit/components-react';
import { CallControls } from './CallControls';
import { CaptionsStrip } from './CaptionsStrip';
import { InterpreterChip } from './InterpreterChip';
import { VideoTile } from './VideoTile';
import { orderTiles } from './tiles';

/**
 * The two-party interpreter call. Shared by the host demo page and the guest
 * '/join' route. Reads the room from RoomContext; the parent owns connect and
 * passes `onLeave` for teardown. The interpreter agent publishes no camera, so
 * the tile grid shows only the two humans.
 */
export function CallView({
  room,
  role,
  slug,
  onLeave,
}: {
  room: Room;
  role: 'host' | 'guest';
  slug: string;
  onLeave: () => void;
}) {
  const tracks = useTracks([Track.Source.Camera], { onlySubscribed: false });
  const { localParticipant } = useLocalParticipant();
  const remoteLabel = role === 'host' ? 'guest' : 'front desk';
  const tiles = useMemo(
    () => orderTiles(tracks, localParticipant.identity, remoteLabel),
    [tracks, localParticipant.identity, remoteLabel]
  );

  return (
    <section
      aria-label="Interpreter call"
      className="flex flex-col gap-4 rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tiles.map((tile) => (
          <VideoTile key={tile.id} tile={tile} />
        ))}
      </div>
      <InterpreterChip />
      <CaptionsStrip />
      <CallControls room={room} slug={slug} showInvite={role === 'host'} onLeave={onLeave} />
    </section>
  );
}

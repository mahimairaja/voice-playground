import { ParticipantKind } from 'livekit-client';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';

export interface Tile {
  /** Participant identity; stable React key. */
  id: string;
  trackRef: TrackReferenceOrPlaceholder;
  isLocal: boolean;
  label: string;
}

/**
 * Order the two human camera tiles self-first and label them. The interpreter
 * agent publishes no camera, so useTracks([Camera]) already excludes it; the
 * agent-kind filter here is defensive. `remoteLabel` is what the other human is
 * called on this screen ('guest' on the host, 'front desk' on the guest).
 */
export function orderTiles(
  trackRefs: TrackReferenceOrPlaceholder[],
  localIdentity: string,
  remoteLabel: string
): Tile[] {
  const tiles = trackRefs
    .filter((t) => t.participant.kind !== ParticipantKind.AGENT)
    .map((t) => ({
      id: t.participant.identity,
      trackRef: t,
      isLocal: t.participant.identity === localIdentity,
      label: t.participant.identity === localIdentity ? 'you' : remoteLabel,
    }));
  tiles.sort((a, b) => (a.isLocal === b.isLocal ? 0 : a.isLocal ? -1 : 1));
  return tiles;
}

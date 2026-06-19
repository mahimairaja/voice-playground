import { describe, expect, it } from 'vitest';
import { ParticipantKind } from 'livekit-client';
import { orderTiles } from './tiles';

const ref = (identity: string, kind: number = ParticipantKind.STANDARD) =>
  ({ participant: { identity, kind } }) as never;

describe('orderTiles', () => {
  it('puts the local participant first and labels it "you"', () => {
    const tiles = orderTiles([ref('guest_1'), ref('host_1')], 'host_1', 'guest');
    expect(tiles.map((t) => t.id)).toEqual(['host_1', 'guest_1']);
    expect(tiles[0].label).toBe('you');
    expect(tiles[1].label).toBe('guest');
  });

  it('excludes agent-kind participants', () => {
    const tiles = orderTiles(
      [ref('agent_1', ParticipantKind.AGENT), ref('host_1')],
      'host_1',
      'guest'
    );
    expect(tiles.map((t) => t.id)).toEqual(['host_1']);
  });
});

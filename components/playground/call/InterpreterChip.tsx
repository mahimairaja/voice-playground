'use client';

import { useEffect, useState } from 'react';
import { type Participant, ParticipantKind, RoomEvent } from 'livekit-client';
import { useRoomContext } from '@livekit/components-react';

/**
 * Lights while the interpreter agent is an active speaker. This is the visible
 * proof the bridge is working: it pulses on each side it relays. Sourced from
 * ActiveSpeakersChanged, filtered to the agent-kind participant.
 */
export function InterpreterChip() {
  const room = useRoomContext();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const onChange = (speakers: Participant[]) => {
      setSpeaking(speakers.some((p) => p.kind === ParticipantKind.AGENT));
    };
    room.on(RoomEvent.ActiveSpeakersChanged, onChange);
    return () => {
      room.off(RoomEvent.ActiveSpeakersChanged, onChange);
    };
  }, [room]);

  return (
    <span
      className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase"
      style={{ color: speaking ? 'var(--color-accent-dim)' : 'var(--color-text-mute)' }}
    >
      <span
        className={`h-2 w-2 rounded-full ${speaking ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: speaking ? 'var(--color-accent)' : 'var(--color-border)' }}
      />
      interpreter
    </span>
  );
}

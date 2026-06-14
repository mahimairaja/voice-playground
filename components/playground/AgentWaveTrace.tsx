'use client';

import { useVoiceAssistant } from '@livekit/components-react';
import { AgentAudioVisualizerWave } from '@/components/agents-ui/agent-audio-visualizer-wave';
import { COLOR } from '@/lib/design/tokens';

/**
 * Live agent-audio trace for the demo SCOPE. Reads the agent participant's
 * audio track and state from useVoiceAssistant() and renders the agents-ui
 * shader Wave in brand amber, stretched to fill the scope. The component
 * defaults to a 224px square (aspect-square h-[224px]), so aspect-auto plus
 * h/w-full override that to fill the panel.
 *
 * INVARIANT: render ONLY inside a LiveKit RoomContext (VoicePanel's `live`
 * branch). useVoiceAssistant() throws outside RoomContext, the same reason
 * Transcript is gated to live/ended.
 */
export function AgentWaveTrace() {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <AgentAudioVisualizerWave
      color={COLOR.accent}
      audioTrack={audioTrack}
      state={state}
      className="aspect-auto h-full w-full"
    />
  );
}

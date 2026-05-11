'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  type ReceivedMessage,
  useChat,
  useLocalParticipant,
  useTranscriptions,
  useVoiceAssistant,
} from '@livekit/components-react';
import { AgentChatTranscript } from '@/components/agents-ui/agent-chat-transcript';
import { cn } from '@/lib/shadcn/utils';

interface TranscriptProps {
  /** Initial open/closed state. Internal toggle controls subsequent state. */
  defaultOpen?: boolean;
  className?: string;
}

/**
 * Renders the live transcript inside the active LiveKit RoomContext.
 *
 * Subscribes to 'useChat' (typed chat messages) plus 'useTranscriptions' (text
 * streams from the agent / user STT) and merges them into a single
 * timeline-sorted 'ReceivedMessage[]' that the upstream
 * '@agents-ui/agent-chat-transcript' already knows how to render (it composes
 * 'use-stick-to-bottom' under the hood for the auto-scroll).
 *
 * The component stays mounted when the visitor toggles it closed, so the
 * subscriptions keep filling and no message is dropped during the gap.
 */
export function Transcript({ defaultOpen = false, className }: TranscriptProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { chatMessages } = useChat();
  const transcriptions = useTranscriptions();
  const { localParticipant } = useLocalParticipant();
  const { state: agentState } = useVoiceAssistant();

  const localIdentity = localParticipant?.identity;

  const merged = useMemo<ReceivedMessage[]>(() => {
    const fromTranscriptions: ReceivedMessage[] = transcriptions.map((t) => {
      const isLocal = t.participantInfo.identity === localIdentity;
      const base = {
        id: t.streamInfo.id,
        timestamp: t.streamInfo.timestamp,
        message: t.text,
      };
      if (isLocal) {
        return { ...base, type: 'userTranscript' } as ReceivedMessage;
      }
      return { ...base, type: 'agentTranscript' } as ReceivedMessage;
    });

    return [...chatMessages, ...fromTranscriptions].sort((a, b) => a.timestamp - b.timestamp);
  }, [chatMessages, transcriptions, localIdentity]);

  return (
    <section aria-label="Live transcript" className={cn('w-full', className)}>
      <div className="flex items-center justify-between gap-3">
        <span className="tiny-mono">
          /transcript{' '}
          {merged.length > 0 ? `· ${merged.length} line${merged.length === 1 ? '' : 's'}` : ''}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="tiny-mono flex cursor-pointer items-center gap-1 transition-opacity hover:opacity-70"
          aria-expanded={open}
          aria-controls="transcript-body"
        >
          {open ? (
            <>
              hide <ChevronUp size={12} />
            </>
          ) : (
            <>
              show <ChevronDown size={12} />
            </>
          )}
        </button>
      </div>
      <div className="line soft mt-1 mb-3"></div>
      <div
        id="transcript-body"
        hidden={!open}
        style={{ display: open ? undefined : 'none' }}
        className="max-h-72 overflow-y-auto"
      >
        {merged.length === 0 ? (
          <p className="p-hand sm">Waiting for the first message ...</p>
        ) : (
          <AgentChatTranscript agentState={agentState} messages={merged} />
        )}
      </div>
    </section>
  );
}

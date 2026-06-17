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
      <div className="flex items-center justify-between gap-3 px-1">
        <span className="font-mono text-[11px] tracking-[0.1em] text-[color:var(--color-text-mute)] uppercase">
          {merged.length > 0
            ? `${merged.length} line${merged.length === 1 ? '' : 's'}`
            : 'no lines yet'}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex cursor-pointer items-center gap-1 font-mono text-[11px] tracking-[0.1em] text-[color:var(--color-text-mute)] uppercase transition-colors hover:text-[color:var(--color-text)]"
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
      <div
        id="transcript-body"
        hidden={!open}
        style={{ display: open ? undefined : 'none' }}
        className="mt-3 flex h-[230px] flex-col"
      >
        {merged.length === 0 ? (
          <p className="px-1 py-6 text-center font-mono text-[12px] text-[color:var(--color-text-mute)]">
            transcript will stream here
          </p>
        ) : (
          <AgentChatTranscript agentState={agentState} messages={merged} />
        )}
      </div>
    </section>
  );
}

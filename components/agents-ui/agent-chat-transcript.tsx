'use client';

import { type ComponentProps } from 'react';
import { Bot, User } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { type AgentState, type ReceivedMessage } from '@livekit/components-react';
import { AgentChatIndicator } from '@/components/agents-ui/agent-chat-indicator';
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';
import { cn } from '@/lib/shadcn/utils';

/**
 * Props for the AgentChatTranscript component.
 */
export interface AgentChatTranscriptProps extends ComponentProps<'div'> {
  /**
   * The current state of the agent. When 'thinking', displays a loading indicator.
   */
  agentState?: AgentState;
  /**
   * Array of messages to display in the transcript.
   * @defaultValue []
   */
  messages?: ReceivedMessage[];
  /**
   * Additional CSS class names to apply to the conversation container.
   */
  className?: string;
}

/**
 * Resolve which side of the transcript a message belongs to.
 *
 * STT transcript lines carry the speaker in `type` (`userTranscript` /
 * `agentTranscript`) and have no `from`; typed chat messages carry it in
 * `from.isLocal`. Both signals must be checked: a voice call is almost all
 * transcript lines, and reading `from.isLocal` alone labels every one of them
 * as the agent.
 */
export function resolveMessageOrigin(message: {
  type?: ReceivedMessage['type'];
  from?: { isLocal?: boolean };
}): 'user' | 'assistant' {
  return message.type === 'userTranscript' || message.from?.isLocal ? 'user' : 'assistant';
}

/**
 * A chat transcript component that displays a conversation between the user and agent.
 * Shows messages with timestamps and origin indicators, plus a thinking indicator
 * when the agent is processing.
 *
 * @extends ComponentProps<'div'>
 *
 * @example
 * ```tsx
 * <AgentChatTranscript
 *   agentState={agentState}
 *   messages={chatMessages}
 * />
 * ```
 */
export function AgentChatTranscript({
  agentState,
  messages = [],
  className,
  ...props
}: AgentChatTranscriptProps) {
  return (
    <Conversation className={className} {...props}>
      <ConversationContent>
        {messages.map((receivedMessage) => {
          const { id, timestamp, message } = receivedMessage;
          const locale = navigator?.language ?? 'en-US';
          const messageOrigin = resolveMessageOrigin(receivedMessage);
          const time = new Date(timestamp);
          const title = time.toLocaleTimeString(locale, { timeStyle: 'full' });

          return (
            <Message key={id} title={title} from={messageOrigin}>
              <div
                className={cn(
                  'flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-mute)] uppercase',
                  messageOrigin === 'user' && 'flex-row-reverse'
                )}
              >
                {messageOrigin === 'user' ? <User size={12} /> : <Bot size={12} />}
                <span>{messageOrigin === 'user' ? 'you' : 'agent'}</span>
              </div>
              <MessageContent>
                <MessageResponse>{message}</MessageResponse>
              </MessageContent>
            </Message>
          );
        })}
        <AnimatePresence>
          {agentState === 'thinking' && <AgentChatIndicator size="sm" />}
        </AnimatePresence>
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}

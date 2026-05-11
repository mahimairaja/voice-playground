import { z } from 'zod';

/**
 * Wire protocol for generative UI events.
 *
 * The agent worker (Python, in 'awesome-voice-apps') publishes JSON envelopes
 * on the LiveKit data channel. The dispatcher (T27) decodes them, validates
 * against this schema, and applies them to the Zustand store. The Canvas
 * (T28) renders whatever is in the store through the registry (T26).
 *
 * Action semantics:
 * - 'mount': add a new component instance keyed by 'id' (auto-generated when
 *   omitted). Existing instance with the same id is replaced.
 * - 'update': merge incoming 'props' into the existing instance's props. No-op
 *   if 'id' does not match a mounted instance.
 * - 'unmount': remove the instance. No-op if 'id' does not match.
 */

export const UI_EVENT_TYPE = 'ui_event' as const;
export const UI_EVENT_TOPIC = 'ui';

export const UiActionSchema = z.enum(['mount', 'update', 'unmount']);
export type UiAction = z.infer<typeof UiActionSchema>;

export const UiEventSchema = z.object({
  type: z.literal(UI_EVENT_TYPE),
  component: z.string().min(1),
  action: UiActionSchema,
  id: z.string().min(1).optional(),
  props: z.record(z.string(), z.unknown()).default({}),
});

export type UiEvent = z.infer<typeof UiEventSchema>;

/**
 * Parses a raw object into a typed 'UiEvent'. Throws ZodError on failure;
 * callers (the dispatcher) prefer 'safeParse' so malformed events can be
 * dropped with a single console.warn.
 */
export function parseUiEvent(input: unknown): UiEvent {
  return UiEventSchema.parse(input);
}

/**
 * Decodes a Uint8Array payload (LiveKit data channel) into a UiEvent. Returns
 * null on JSON or schema failure. The dispatcher logs and drops on null.
 */
export function decodeUiEvent(payload: Uint8Array): UiEvent | null {
  try {
    const text = new TextDecoder().decode(payload);
    const parsed = UiEventSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

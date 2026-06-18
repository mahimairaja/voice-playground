import { z } from 'zod';

/**
 * Reverse wire protocol: actions from the playground back to the agent.
 *
 * The forward path (protocol.ts) carries `ui_event` envelopes from the agent
 * (Python, in 'awesome-voice-apps') to the playground. This is its mirror: an
 * interactive component (the Save button on `EditableTable`, say) publishes a
 * `ui_action` envelope on the `ui_action` data channel topic. The agent worker
 * decodes it (`room.on("data_received")`), updates its state, and re-publishes
 * UI through the forward path.
 *
 * The `id` echoes the `ui_event` instance id the agent mounted, so the agent
 * knows which control fired. `action` is a short verb (`submit` today; `reset`
 * or `cancel` can join later without a schema change). `payload` is
 * component-specific: for `EditableTable` it is `{ rows }`, the edited grid.
 */

export const UI_ACTION_TYPE = 'ui_action' as const;
export const UI_ACTION_TOPIC = 'ui_action';

export const UiActionSchema = z.object({
  type: z.literal(UI_ACTION_TYPE),
  component: z.string().min(1),
  id: z.string().min(1),
  action: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type UiAction = z.infer<typeof UiActionSchema>;

/**
 * Validates and encodes a `ui_action` to the bytes a LiveKit data publish
 * expects. Throws ZodError on a malformed action (a component bug, surfaced
 * loudly in dev rather than dropped on the wire).
 */
export function encodeUiAction(action: z.input<typeof UiActionSchema>): Uint8Array {
  const validated = UiActionSchema.parse(action);
  return new TextEncoder().encode(JSON.stringify(validated));
}

/**
 * Decodes a `ui_action` payload back into a typed action. Returns null on JSON
 * or schema failure. The playground only sends these, so this is here for
 * symmetry and tests; the agent decodes in Python.
 */
export function decodeUiAction(payload: Uint8Array): UiAction | null {
  try {
    const text = new TextDecoder().decode(payload);
    const parsed = UiActionSchema.safeParse(JSON.parse(text));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

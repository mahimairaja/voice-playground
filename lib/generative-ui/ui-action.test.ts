import { describe, expect, it } from 'vitest';
import { UI_ACTION_TOPIC, decodeUiAction, encodeUiAction } from './ui-action';

describe('ui-action protocol', () => {
  it('round-trips a submit action through encode and decode', () => {
    const action = {
      type: 'ui_action' as const,
      component: 'EditableTable',
      id: 'quiz',
      action: 'submit',
      payload: {
        rows: [
          ['Q1', 'A1'],
          ['Q2', 'A2'],
        ],
      },
    };
    expect(decodeUiAction(encodeUiAction(action))).toEqual(action);
  });

  it('defaults a missing payload to an empty object', () => {
    const bytes = encodeUiAction({
      type: 'ui_action',
      component: 'EditableTable',
      id: 'quiz',
      action: 'submit',
    });
    expect(decodeUiAction(bytes)?.payload).toEqual({});
  });

  it('publishes on a topic distinct from the forward ui channel', () => {
    expect(UI_ACTION_TOPIC).toBe('ui_action');
  });

  it('drops malformed or incomplete payloads', () => {
    expect(decodeUiAction(new TextEncoder().encode('not json'))).toBeNull();
    expect(
      decodeUiAction(new TextEncoder().encode(JSON.stringify({ type: 'ui_action' })))
    ).toBeNull();
  });
});

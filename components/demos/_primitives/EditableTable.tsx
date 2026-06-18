'use client';

import { useEffect, useState } from 'react';
import { useMaybeRoomContext } from '@livekit/components-react';
import { UI_ACTION_TOPIC, encodeUiAction } from '@/lib/generative-ui/ui-action';
import { cn } from '@/lib/shadcn/utils';

/**
 * EditableTable: the editable twin of TablePanel. Columns plus a grid of text
 * cells the visitor can type into, with a Save button that publishes the edited
 * grid back to the agent over the `ui_action` data channel.
 *
 * The agent mounts it with an `actionId` (the same id it used for the
 * `ui_event`), so the `ui_action` it receives names the control that fired.
 * `rows` is the agent's source of truth: when the agent re-publishes a
 * confirmed edit (or a voice change), the local buffer re-seeds from it.
 *
 * `useMaybeRoomContext` returns undefined off-session (idle page, contribute
 * gallery), so Save simply disables instead of throwing.
 */

export interface EditableTablePanelProps {
  title?: string;
  columns: string[];
  rows: string[][];
  submitLabel?: string;
  actionId?: string;
  className?: string;
}

const COMPONENT_NAME = 'EditableTable';

function sameGrid(a: string[][], b: string[][]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (row, r) => row.length === b[r]?.length && row.every((cell, c) => cell === b[r][c])
  );
}

export function EditableTablePanel({
  title,
  columns,
  rows,
  submitLabel = 'Save',
  actionId,
  className,
}: EditableTablePanelProps) {
  const room = useMaybeRoomContext();
  const [draft, setDraft] = useState<string[][]>(rows);
  const [saved, setSaved] = useState<string[][]>(rows);

  // Re-seed when the agent publishes a new grid (confirmed edit or voice change).
  useEffect(() => {
    setDraft(rows);
    setSaved(rows);
  }, [rows]);

  const dirty = !sameGrid(draft, saved);
  const canSave = Boolean(room) && dirty;

  const setCell = (r: number, c: number, value: string) => {
    setDraft((prev) =>
      prev.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? value : cell)) : row))
    );
  };

  const submit = () => {
    if (!room) return;
    const bytes = encodeUiAction({
      type: 'ui_action',
      component: COMPONENT_NAME,
      id: actionId ?? COMPONENT_NAME,
      action: 'submit',
      payload: { rows: draft },
    });
    void room.localParticipant.publishData(bytes, { topic: UI_ACTION_TOPIC, reliable: true });
    setSaved(draft);
  };

  return (
    <section
      className={cn(
        'rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-3.5',
        className
      )}
    >
      {title && (
        <p className="mb-2 font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
          {title}
        </p>
      )}
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={`${col}-${i}`}
                className="border-b border-[color:var(--color-border)] pb-1.5 text-left font-mono text-[10px] tracking-[0.06em] text-[color:var(--color-text-mute)] uppercase"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {draft.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    'py-1.5 pr-2 last:pr-0',
                    r < draft.length - 1 && 'border-b border-[color:var(--color-border-dim)]'
                  )}
                >
                  <input
                    type="text"
                    aria-label={`${columns[c] ?? `column ${c + 1}`} row ${r + 1}`}
                    value={cell}
                    onChange={(e) => setCell(r, c, e.target.value)}
                    className="w-full rounded-[var(--radius-input)] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-1 font-mono text-[12px] text-[color:var(--color-text)] outline-none focus:border-[color:var(--color-border-strong)]"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2.5 flex items-center justify-end gap-2">
        {canSave && (
          <span className="font-mono text-[10px] text-[color:var(--color-text-fade)]">unsaved</span>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={!canSave}
          className={cn(
            'inline-flex items-center rounded-[var(--radius-button)] px-3 py-1.5 font-mono text-[12px] transition-colors',
            canSave
              ? 'cursor-pointer bg-[color:var(--color-accent)] font-semibold text-[color:var(--color-text)] hover:brightness-105'
              : 'cursor-not-allowed border border-[color:var(--color-border)] text-[color:var(--color-text-mute)]'
          )}
        >
          {submitLabel}
        </button>
      </div>
    </section>
  );
}

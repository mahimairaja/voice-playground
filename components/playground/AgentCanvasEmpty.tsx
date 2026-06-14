import { Eyebrow } from '@/components/phosphor';
import type { ShippedDemo } from '@/lib/demos';

/**
 * Idle-state body of the agent canvas. Renders before the visitor presses
 * connect and before the agent mounts anything. Pulls everything it shows
 * from the manifest: description, who_for, and a chip row of the
 * 'ui_components' the demo declares it can mount.
 */

interface AgentCanvasEmptyProps {
  demo: ShippedDemo;
}

export function AgentCanvasEmpty({ demo }: AgentCanvasEmptyProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-1 text-center font-mono text-[12px] leading-[1.6] text-[color:var(--color-text-mute)]">
        <span>agent-mounted UI</span>
        <span>appears here on connect</span>
      </div>

      <p className="max-w-[60ch] text-[14px] leading-[1.6] text-[color:var(--color-text-dim)]">
        {demo.description}{' '}
        <span className="text-[color:var(--color-text-mute)]">{demo.who_for}</span>
      </p>

      {demo.ui_components.length > 0 ? (
        <div className="border-t border-[color:var(--color-border-dim)] pt-4">
          <Eyebrow>agent may draw</Eyebrow>
          <div className="mt-2 flex flex-wrap gap-2">
            {demo.ui_components.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border)] px-2.5 py-[3px] font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-mute)]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

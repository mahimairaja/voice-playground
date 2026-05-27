import type { ShippedDemo } from '@/lib/demos';

/**
 * Idle-state body of the agent canvas. Renders before the visitor presses
 * Talk and before the agent mounts anything. Pulls everything it shows
 * from the manifest: title, description, who_for, and a chip row of the
 * 'ui_components' the demo declares it can mount.
 */

interface AgentCanvasEmptyProps {
  demo: ShippedDemo;
}

export function AgentCanvasEmpty({ demo }: AgentCanvasEmptyProps) {
  return (
    <div className="flex h-full flex-col gap-3 px-2 py-4">
      <span className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        {'// IDLE'}
      </span>
      <h2 className="text-[20px] font-semibold tracking-tight text-[color:var(--color-text)]">
        {demo.title}
      </h2>
      <p className="max-w-[60ch] text-[14px] leading-[1.55] text-[color:var(--color-text-dim)]">
        {demo.description}
      </p>
      <p className="max-w-[60ch] text-[12.5px] text-[color:var(--color-text-mute)]">
        {demo.who_for}
      </p>

      <p className="mt-3 text-[13px] text-[color:var(--color-text-dim)]">
        <span className="text-[color:var(--color-accent)]">→ Talk.</span> The agent will draw here
        as it speaks.
      </p>

      {demo.ui_components.length > 0 ? (
        <div className="mt-3">
          <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
            {'// AGENT MAY DRAW'}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {demo.ui_components.map((name) => (
              <span
                key={name}
                className="inline-flex items-center rounded-[var(--radius-pill)] border border-[color:var(--color-border-dim)] px-2.5 py-[3px] font-mono text-[10px] tracking-[0.04em] text-[color:var(--color-text-fade)]"
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

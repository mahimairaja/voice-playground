/**
 * Generative-UI primitive: end-of-call cost summary. Big hand-title total at
 * the top in --accent-hex, divider, per-modality lines (STT/LLM/TTS) in mono
 * right-aligned below. Optional sublabel for "tokens", "audio seconds",
 * etc.
 *
 * The agent publishes this at the end of a session under the convention
 * documented in 'lib/generative-ui/protocol.ts':
 *   { type: 'ui_event', component: 'Cost', action: 'mount',
 *     id: 'final_cost', props: { total_usd, lines } }
 */
import { cn } from '@/lib/shadcn/utils';

export interface CostLine {
  label: string;
  value: string;
  sublabel?: string;
}

export interface CostPanelProps {
  total_usd: number;
  lines: CostLine[];
  className?: string;
}

function formatTotal(total: number): string {
  if (total < 1) return `$${total.toFixed(3)}`;
  return `$${total.toFixed(2)}`;
}

export function CostPanel({ total_usd, lines, className }: CostPanelProps) {
  return (
    <section
      className={cn('box brand-accent', className)}
      style={{
        padding: 16,
        background: 'var(--accent-soft-hex)',
        borderColor: 'var(--ink)',
      }}
    >
      <p className="tiny-mono">· total · this call</p>
      <p
        style={{
          fontFamily: 'var(--hand-title)',
          fontWeight: 700,
          fontSize: 48,
          lineHeight: 1,
          color: 'var(--accent-hex)',
          marginTop: 4,
        }}
      >
        {formatTotal(total_usd)}
      </p>
      <div className="line soft" style={{ margin: '12px 0 10px' }}></div>
      <ul className="flex flex-col gap-1.5">
        {lines.map((line, i) => (
          <li key={`${line.label}-${i}`} className="flex items-baseline justify-between gap-3">
            <span className="p-hand sm" style={{ color: 'var(--ink-2)' }}>
              {line.label}
              {line.sublabel && (
                <span className="tiny-mono ml-2" style={{ textTransform: 'lowercase' }}>
                  {line.sublabel}
                </span>
              )}
            </span>
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {line.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

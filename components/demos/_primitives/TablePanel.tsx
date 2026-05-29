import { cn } from '@/lib/shadcn/utils';

export interface TablePanelProps {
  title?: string;
  columns: string[];
  rows: string[][];
  className?: string;
}

export function TablePanel({ title, columns, rows, className }: TablePanelProps) {
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
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td
                  key={c}
                  className={cn(
                    'py-1.5 font-mono text-[12px] text-[color:var(--color-text-dim)]',
                    r < rows.length - 1 && 'border-b border-[color:var(--color-border-dim)]'
                  )}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

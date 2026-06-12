'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

/**
 * One-click copyable command block. The run command is the make-or-break step
 * for every demo; inert styled text forced visitors to hand-select it.
 */
export function CopySnippet({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center gap-2 rounded-[var(--radius-input)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] py-2 pr-2 pl-3">
      <code className="flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-[color:var(--color-accent-dim)]">
        {command}
      </code>
      <button
        type="button"
        aria-label="Copy command"
        className="shrink-0 cursor-pointer rounded-[5px] p-1.5 text-[color:var(--color-text-mute)] transition-colors hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text)]"
        onClick={async () => {
          await navigator.clipboard.writeText(command);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? (
          <Check size={15} className="text-[color:var(--color-live)]" />
        ) : (
          <Copy size={15} />
        )}
      </button>
    </div>
  );
}

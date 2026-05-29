import type { ComponentType } from 'react';
import { type GenerativeComponent, registerForDemo } from '@/lib/generative-ui/registry';

/**
 * Per-demo generative-UI bundle for the `quick-trivia` demo.
 *
 * The agent (awesome-voice-apps/demos/quick-trivia/agent.py) publishes a single
 * `Score` component on the `ui` data channel after each answer:
 *
 *   publish_ui_event(room, "Score", action, id="score",
 *                    props={"correct": int, "total": int, "outOf": int})
 *
 *   correct = answers right so far
 *   total   = questions answered so far
 *   outOf   = total questions in the quiz (10)
 *
 * Styled with the F1 dark + cyan tokens from styles/globals.css. No wireframe
 * primitives.
 */

function asGenerative<P>(Component: ComponentType<P>): GenerativeComponent {
  return Component as unknown as GenerativeComponent;
}

interface ScoreProps {
  correct?: number;
  total?: number;
  outOf?: number;
}

function Score({ correct = 0, total = 0, outOf = 0 }: ScoreProps) {
  const score = Math.max(0, correct);
  const answered = Math.max(0, total);
  const questions = Math.max(answered, outOf, 1);
  const done = outOf > 0 && answered >= outOf;
  const pct = Math.min(100, Math.round((answered / questions) * 100));

  return (
    <section className="rounded-[var(--radius-panel)] border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4">
      <p className="font-mono text-[10px] tracking-[0.08em] text-[color:var(--color-text-fade)] uppercase">
        {done ? '// final score' : '// score'}
      </p>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-[28px] leading-none font-semibold text-[color:var(--color-accent)]">
          {score}
        </span>
        <span className="font-mono text-[12px] text-[color:var(--color-text-mute)]">correct</span>
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[color:var(--color-border-dim)]">
        <div
          className="h-full rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 font-mono text-[11px] text-[color:var(--color-text-fade)]">
        {done ? `all ${outOf} answered` : `${answered} of ${outOf || questions} answered`}
      </p>
    </section>
  );
}

registerForDemo('quick-trivia', {
  Score: asGenerative(Score),
});

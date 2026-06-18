/**
 * A small amber pill marking a demo shipped within the last two weeks. Amber is
 * a fill color in this skin (not label ink), so the "new" cue is a filled pill
 * rather than tinted text. Rendered next to the category eyebrow on demo cards.
 */
export function NewBadge() {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] px-1.5 py-px font-mono text-[9px] font-semibold tracking-[0.12em] text-[color:var(--color-text)] uppercase"
      title="shipped in the last two weeks"
    >
      new
    </span>
  );
}

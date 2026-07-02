/**
 * A small teal pill marking a demo shipped within the last two weeks. Teal is
 * a fill color in this skin (not label ink), so the "new" cue is a filled pill
 * with white ink rather than tinted text. Rendered next to the category badge
 * on demo cards.
 */
export function NewBadge() {
  return (
    <span
      className="inline-flex items-center rounded-[var(--radius-pill)] bg-[color:var(--color-accent)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase"
      title="shipped in the last two weeks"
    >
      new
    </span>
  );
}

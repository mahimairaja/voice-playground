/**
 * A GitHub-style alert blockquote ('> [!TIP]') becomes a callout: the marker is
 * stripped from the text and the blockquote gains a 'callout callout-<type>'
 * class (styling and the type label live in globals.css). No raw HTML is
 * injected: the class rides 'data.hProperties', and the marker only ever comes
 * from a blockquote's own first line, so untrusted content cannot forge it.
 *
 * Typed against a minimal local node shape rather than the full mdast types, so
 * the transform stays dependency-light and lint-clean.
 */

interface MdNode {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, unknown> };
}

const MARKER = /^\[!(NOTE|TIP|WARNING|IMPORTANT|CAUTION)\]\s*/i;

export function parseCalloutMarker(value: string): { type: string; rest: string } | null {
  const m = value.match(MARKER);
  return m ? { type: m[1].toLowerCase(), rest: value.slice(m[0].length) } : null;
}

export function remarkCallouts(): (tree: MdNode) => void {
  return (tree) => visit(tree);
}

function visit(node: MdNode): void {
  if (!node.children) return;
  for (const child of node.children) {
    if (child.type === 'blockquote') applyCallout(child);
    visit(child);
  }
}

function applyCallout(bq: MdNode): void {
  const para = bq.children?.[0];
  if (para?.type !== 'paragraph' || !para.children) return;
  const first = para.children[0];
  if (first?.type !== 'text' || typeof first.value !== 'string') return;

  const parsed = parseCalloutMarker(first.value);
  if (!parsed) return;

  first.value = parsed.rest;
  // Defensive: if the marker sat alone on its line and the parser left an empty
  // lead node followed by a hard break, drop both so the body does not start
  // blank. The common soft-break case leaves the body in place already. If that
  // empties the paragraph entirely, drop it too so no blank <p> renders.
  if (first.value === '') {
    para.children.shift();
    if (para.children[0]?.type === 'break') para.children.shift();
    if (para.children.length === 0) bq.children?.shift();
  }

  bq.data ??= {};
  bq.data.hProperties = {
    ...bq.data.hProperties,
    className: ['callout', `callout-${parsed.type}`],
  };
}

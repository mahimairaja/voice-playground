import { describe, expect, it } from 'vitest';
import { COLOR } from './tokens';

/**
 * WCAG 2.2 contrast gate for the clean-light teal palette. Pure module, no
 * dependencies: relative luminance per WCAG, asserted at AA. If a token
 * change breaks a pair, fix the token value, not the threshold; this gate
 * exists because the readability complaint that triggered the original
 * redesign was a palette that quietly failed these ratios.
 *
 * One deliberate deviation from the amber era: the primary CTA is white text
 * on the teal fill, matching mahimai.ca. White on #1f96aa is 3.5:1, so the
 * fill itself is gated as a UI component (3:1) and the 4.5:1 body-text
 * assertion moves to white on accentDim (#15788a), the hover fill.
 */

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex: string): number {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) throw new Error(`not a 6-digit hex color: ${hex}`);
  const n = parseInt(m[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function ratio(fg: string, bg: string): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

// AA body text: 4.5:1.
const BODY_PAIRS: [string, string, string][] = [
  ['text on bg', COLOR.text, COLOR.bg],
  ['text on surface', COLOR.text, COLOR.surface],
  ['text on surface2', COLOR.text, COLOR.surface2],
  ['textDim on bg', COLOR.textDim, COLOR.bg],
  ['textDim on surface', COLOR.textDim, COLOR.surface],
  ['textMute on bg', COLOR.textMute, COLOR.bg],
  ['textMute on surface', COLOR.textMute, COLOR.surface],
  ['textMute on surface2', COLOR.textMute, COLOR.surface2],
  ['accentDim links on bg', COLOR.accentDim, COLOR.bg],
  ['accentDim links on surface', COLOR.accentDim, COLOR.surface],
  // surface-2 is the gray-50 code-chip / snippet background; deep teal code sits on it.
  ['accentDim code on surface2', COLOR.accentDim, COLOR.surface2],
  ['accentDeep emphasis on bg', COLOR.accentDeep, COLOR.bg],
  ['white on accentDim CTA hover', '#ffffff', COLOR.accentDim],
  ['white on accentDeep', '#ffffff', COLOR.accentDeep],
  ['danger on bg', COLOR.danger, COLOR.bg],
  ['warning on bg', COLOR.warning, COLOR.bg],
  ['scopeText on scope', COLOR.scopeText, COLOR.scope],
  ['scopeTextDim on scope', COLOR.scopeTextDim, COLOR.scope],
];

// AA large text and UI components: 3:1.
const LARGE_OR_UI_PAIRS: [string, string, string][] = [
  ['textFade on bg (large/decorative only)', COLOR.textFade, COLOR.bg],
  ['live on bg', COLOR.live, COLOR.bg],
  ['live on surface', COLOR.live, COLOR.surface],
  ['teal trace against scope screen (UI component)', COLOR.accent, COLOR.scope],
  // The main-site CTA ships white on #1f96aa; gate the fill as a UI component.
  ['white on teal CTA fill (UI component)', '#ffffff', COLOR.accent],
  ['teal fill against bg (UI component)', COLOR.accent, COLOR.bg],
];

describe('Clean-light teal contrast gate (WCAG 2.2 AA)', () => {
  it.each(BODY_PAIRS)('%s is at least 4.5:1', (_label, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LARGE_OR_UI_PAIRS)('%s is at least 3:1', (_label, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

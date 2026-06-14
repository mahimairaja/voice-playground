import { describe, expect, it } from 'vitest';
import { COLOR } from './tokens';

/**
 * WCAG 2.2 contrast gate for the Daylight amber palette. Pure module, no
 * dependencies: relative luminance per WCAG, asserted at AA. If a token
 * change breaks a pair, fix the token value, not the threshold; this gate
 * exists because the readability complaint that triggered the redesign was
 * a palette that quietly failed these ratios.
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
  // surface-2 is the cream code-chip / snippet background; ochre code sits on it.
  ['accentDim code on surface2', COLOR.accentDim, COLOR.surface2],
  ['accentDeep emphasis on bg', COLOR.accentDeep, COLOR.bg],
  ['ink on amber CTA', COLOR.text, COLOR.accent],
  ['danger on bg', COLOR.danger, COLOR.bg],
  ['scopeText on scope', COLOR.scopeText, COLOR.scope],
  ['scopeTextDim on scope', COLOR.scopeTextDim, COLOR.scope],
];

// AA large text and UI components: 3:1.
const LARGE_OR_UI_PAIRS: [string, string, string][] = [
  ['textFade on bg (large/decorative only)', COLOR.textFade, COLOR.bg],
  ['live on bg', COLOR.live, COLOR.bg],
  ['live on surface', COLOR.live, COLOR.surface],
  ['amber fill against bg (UI component)', COLOR.accent, COLOR.scope],
];

describe('Daylight amber contrast gate (WCAG 2.2 AA)', () => {
  it.each(BODY_PAIRS)('%s is at least 4.5:1', (_label, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LARGE_OR_UI_PAIRS)('%s is at least 3:1', (_label, fg, bg) => {
    expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
  });
});

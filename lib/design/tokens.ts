/**
 * Clean-light design tokens, matched to mahimai.ca (Inter, white page, single
 * teal accent). Single source of truth for the visual system (replaces the
 * Daylight warm-amber tokens, which replaced the dark PHOSPHOR CRT tokens).
 *
 * Consumers:
 * - 'styles/globals.css' mirrors these values into a Tailwind v4 '@theme inline'
 *   block so utilities like 'bg-bg', 'text-text', 'border-border-dim' compile.
 * - TypeScript can import the named constants here for computed-color logic
 *   (the OscWave canvas trace, status colors, etc.) without touching CSS.
 *
 * Identity: white readable page, dark oscilloscope screens kept only as inset
 * instrument panels ('scope'). Teal is a fill color (CTAs, chips, the scope
 * trace) with white ink on top; deep teal 'accentDim' carries links and labels
 * on light surfaces. Every documented fg/bg pair is asserted at WCAG AA by
 * tokens.contrast.test.ts.
 */

export const COLOR = {
  bg: '#ffffff',
  surface: '#ffffff',
  surface2: '#f9fafb', // gray-50 well: bands, code chips, chat bodies
  surface3: '#f3f4f6', // gray-100 recessed alt well
  scope: '#0b0f14', // the dark oscilloscope screen, cooled for the teal era
  border: '#e5e7eb', // gray-200: cards, chrome hairlines
  borderStrong: '#d1d5db', // gray-300: fields, secondary buttons
  borderDim: '#f3f4f6', // gray-100: internal dividers
  text: '#11161c', // ink, same value as mahimai.ca --color-ink
  textDim: '#4b5563', // gray-600: body copy, descriptions
  textMute: '#6b7280', // gray-500: badges, footers, readout labels
  textFade: '#8a939f', // decorative/large only; passes 3:1 where gray-400 does not
  accent: '#1f96aa', // fill only: CTAs, chips, scope trace. White ink on top; never small text on light.
  accentDim: '#15788a', // deep teal: links, labels, focus rings, CTA hover fill (AA on every light surface)
  accentDeep: '#116575', // headline emphasis; AA both as text on white and under white text
  accentSoft: 'color-mix(in srgb, #1f96aa 15%, transparent)',
  scopeText: '#e8eef2', // text on the dark screen
  scopeTextDim: '#9ca3af',
  live: '#15803d', // connected green, dark enough for light surfaces
  warning: '#b45309',
  danger: '#b91c1c',
} as const;

export const RADIUS = {
  input: '8px', // 0.5rem, the mahimai.ca button/field radius
  button: '8px',
  panel: '16px', // 1rem, the mahimai.ca card radius
  card: '16px',
  pill: '999px',
} as const;

export const SPACE = {
  xxs: '4px',
  xs: '6px',
  sm: '10px',
  md: '14px',
  lg: '18px',
  xl: '22px',
  xxl: '28px',
  xxxl: '36px',
} as const;

export const FONT_FAMILY = {
  sans: 'var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
  mono: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as const;

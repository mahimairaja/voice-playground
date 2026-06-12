/**
 * Daylight amber design tokens. Single source of truth for the light
 * warm-paper visual system (replaces the dark PHOSPHOR CRT tokens).
 *
 * Consumers:
 * - 'styles/globals.css' mirrors these values into a Tailwind v4 '@theme inline'
 *   block so utilities like 'bg-bg', 'text-text', 'border-border-dim' compile.
 * - TypeScript can import the named constants here for computed-color logic
 *   (the OscWave canvas trace, status colors, etc.) without touching CSS.
 *
 * Identity: light readable page, dark oscilloscope screens kept only as inset
 * instrument panels ('scope'). Amber is a fill color (CTAs, chips, the scope
 * trace); ochre 'accentDim' carries links and labels on light surfaces.
 * Every documented fg/bg pair is asserted at WCAG AA by tokens.contrast.test.ts.
 */

export const COLOR = {
  bg: '#faf8f3',
  surface: '#ffffff',
  surface2: '#f3efe6',
  surface3: '#ece6d8', // recessed alt well
  scope: '#0a0803', // the dark oscilloscope screen, unchanged from PHOSPHOR
  border: '#e7e0d2',
  borderStrong: '#d9d0bd',
  borderDim: '#efe9dc',
  text: '#221c12',
  textDim: '#4b443a',
  textMute: '#6b614e',
  textFade: '#8a7d68', // decorative/large only; below AA for small text by design
  accent: '#ffb02e', // fill only: CTAs, chips, scope trace. Never small text on light.
  accentDim: '#9a6700', // ochre: links, labels, focus rings on paper
  accentDeep: '#b45309', // headline emphasis
  accentSoft: 'color-mix(in srgb, #ffb02e 14%, transparent)',
  scopeText: '#f4ead6', // text on the dark screen
  scopeTextDim: '#bcab8e',
  live: '#15803d', // connected green, dark enough for light surfaces
  warning: '#b45309',
  danger: '#b91c1c',
} as const;

export const RADIUS = {
  input: '7px',
  button: '7px',
  panel: '12px',
  card: '12px',
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
  sans: 'var(--font-space-grotesk), system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
  mono: 'var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as const;

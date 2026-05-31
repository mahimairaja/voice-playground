/**
 * PHOSPHOR design tokens. Single source of truth for the warm CRT-amber
 * oscilloscope visual system (replaces the former dark + cyan F1 tokens).
 *
 * Consumers:
 * - 'styles/globals.css' mirrors these values into a Tailwind v4 '@theme inline'
 *   block so utilities like 'bg-bg', 'text-text', 'border-border-dim' compile.
 * - TypeScript can import the named constants here for computed-color logic
 *   (the OscWave canvas trace, status colors, etc.) without touching CSS.
 *
 * Identity: warm ink, amber accent, JetBrains Mono used as instrument readouts,
 * Space Grotesk display. Film grain + scanlines carry the scope motif.
 */

export const COLOR = {
  bg: '#0d0a06',
  surface: '#15100a',
  surface2: '#1b1408',
  surface3: '#221a0e', // raised panel
  scope: '#0a0803', // the dark oscilloscope screen
  border: '#2c2213',
  borderStrong: '#3a2d18',
  borderDim: '#1e1810',
  text: '#f4ead6',
  textDim: '#bcab8e',
  textMute: '#8c7d63',
  textFade: '#5f5340',
  accent: '#ffb02e',
  accentDim: '#c9881f',
  accentSoft: 'color-mix(in srgb, #ffb02e 18%, transparent)',
  live: '#74e0a6', // live / connected green
  warning: '#f4a72c',
  danger: '#ff5b4d',
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

/**
 * F1 design tokens. Single source of truth for the dark + cyan visual system.
 *
 * Consumers:
 * - 'styles/globals.css' mirrors these values into a Tailwind v4 '@theme inline'
 *   block so utilities like 'bg-bg', 'text-text', 'border-border-dim' compile.
 * - TypeScript can import the named constants here for computed-color logic
 *   (animations, chart axes, etc.) without touching CSS.
 *
 * Keep this list intentionally tight: 4 neutrals plus 1 accent plus 2 status.
 * Anything beyond the documented palette needs an explicit reason.
 */

export const COLOR = {
  bg: '#050507',
  surface: '#0b0b0d',
  surface2: '#0c0c10',
  border: '#232327',
  borderStrong: '#2a2a2f',
  borderDim: '#1c1c20',
  text: '#ededed',
  textDim: '#b5b5b9',
  textMute: '#8a8a90',
  textFade: '#6a6a70',
  accent: '#2DD4BF',
  accentSoft: 'color-mix(in srgb, #2DD4BF 18%, transparent)',
  warning: '#f59e0b',
  danger: '#ef4444',
} as const;

export const RADIUS = {
  input: '6px',
  button: '8px',
  panel: '10px',
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
  sans: 'var(--font-geist-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif',
  mono: 'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
} as const;

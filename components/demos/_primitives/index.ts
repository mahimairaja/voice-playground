/**
 * Shared primitives for agent-mounted UI. Per-demo bundles compose these
 * (wrap with demo-specific titles, register under the demo's slug) instead
 * of building from scratch. All five consume brand tokens from styles/
 * brand.css and Tailwind v4 @theme entries; no new deps.
 */
export { CardPanel } from './CardPanel';
export type { CardPanelProps } from './CardPanel';

export { KeyValuePanel } from './KeyValuePanel';
export type { KeyValueItem, KeyValuePanelProps } from './KeyValuePanel';

export { ListPanel } from './ListPanel';
export type { ListItem, ListPanelProps } from './ListPanel';

export { ButtonRowPanel, CTA_EVENT } from './ButtonRowPanel';
export type { ButtonRowButton, ButtonRowPanelProps, CtaEventDetail } from './ButtonRowPanel';

export { CostPanel } from './CostPanel';
export type { CostLine, CostPanelProps } from './CostPanel';

/**
 * Per-demo bundle for the 'drive-thru-coffee' slug.
 *
 * Wraps four primitives from 'components/demos/_primitives/' with
 * demo-specific titles, then registers the resulting component map under
 * the slug at module-load time. Imported as a side effect by
 * 'components/demos/DemoBundleLoader.tsx' when the visitor lands on
 * '/demos/drive-thru-coffee'.
 *
 * The matching manifest lives in '../awesome-voice-apps/demos/
 * drive-thru-coffee/playground.json' and must list:
 *   ui_components: ["Order", "Total", "Checkout", "Cost"]
 *
 * The agent worker (Python, in awesome-voice-apps) mounts these via the
 * generative-UI dispatcher as the conversation progresses. 'Cost' is the
 * end-of-call summary (mount with id "final_cost"); the playground retains
 * it past disconnect via the EndedBody branch in VoiceSurface.
 */
import type { ComponentType } from 'react';
import {
  ButtonRowPanel,
  type ButtonRowPanelProps,
  CostPanel,
  type CostPanelProps,
  KeyValuePanel,
  type KeyValuePanelProps,
  ListPanel,
  type ListPanelProps,
} from '@/components/demos/_primitives';
import { type GenerativeComponent, registerForDemo } from '@/lib/generative-ui/registry';

/**
 * Helper: the registry types every component as
 * 'ComponentType<Record<string, unknown>>' because props arrive from the
 * agent over the data channel. The primitives have stricter prop shapes
 * (validated by their own runtime defaults). This cast acknowledges the
 * runtime/static boundary at the dispatcher edge.
 */
function asGenerative<P>(C: ComponentType<P>): GenerativeComponent {
  return C as unknown as GenerativeComponent;
}

function Order(props: Omit<ListPanelProps, 'title'>) {
  return <ListPanel title="your order" {...props} />;
}

function Total(props: Omit<KeyValuePanelProps, 'title'>) {
  return <KeyValuePanel title="running total" {...props} />;
}

function Checkout(props: Omit<ButtonRowPanelProps, 'title'>) {
  return <ButtonRowPanel title="ready when you are" {...props} />;
}

function Cost(props: CostPanelProps) {
  return <CostPanel {...props} />;
}

registerForDemo('drive-thru-coffee', {
  Order: asGenerative(Order),
  Total: asGenerative(Total),
  Checkout: asGenerative(Checkout),
  Cost: asGenerative(Cost),
});

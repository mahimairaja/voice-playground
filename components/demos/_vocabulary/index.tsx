import type { ComponentType } from 'react';
import {
  ButtonRowPanel,
  CaptionsPanel,
  CardPanel,
  CostPanel,
  EditableTablePanel,
  KeyValuePanel,
  ListPanel,
  MetersPanel,
  StatPanel,
  TablePanel,
} from '@/components/demos/_primitives';
import { type GenerativeComponent, registerGlobal } from '@/lib/generative-ui/registry';
import { Score } from './Score';

/**
 * The global generative-UI vocabulary. Registered once for every demo, so a
 * new cookbook demo renders with zero changes to this repo. The agent drives
 * these by name on the `ui` data channel. See the vocabulary spec; the prop
 * shapes are mirrored in awesome-voice-apps/docs/playground-components.md.
 */

function g<P>(Component: ComponentType<P>): GenerativeComponent {
  return Component as unknown as GenerativeComponent;
}

/**
 * A semantic alias that defaults a panel title but lets the agent override it
 * by sending `title` in props. Preserves the names and look the shipped demos
 * already use (Order, Total, ...).
 */
function titled<P extends { title?: string }>(
  Component: ComponentType<P>,
  defaultTitle: string
): GenerativeComponent {
  function Aliased(props: P) {
    return <Component title={defaultTitle} {...props} />;
  }
  return Aliased as unknown as GenerativeComponent;
}

registerGlobal({
  // Primitives: content-agnostic building blocks.
  List: g(ListPanel),
  KeyValue: g(KeyValuePanel),
  Stat: g(StatPanel),
  Meters: g(MetersPanel),
  Card: g(CardPanel),
  Buttons: g(ButtonRowPanel),
  Table: g(TablePanel),
  EditableTable: g(EditableTablePanel),
  Captions: g(CaptionsPanel),

  // Semantic aliases: domain names mapped onto the primitives.
  Order: titled(ListPanel, 'your order'),
  Total: titled(KeyValuePanel, 'running total'),
  Checkout: titled(ButtonRowPanel, 'ready when you are'),
  Cost: g(CostPanel),
  Score: g(Score),
});

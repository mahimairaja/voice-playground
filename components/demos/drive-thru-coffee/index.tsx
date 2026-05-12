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

function asGenerative<P>(Component: ComponentType<P>): GenerativeComponent {
  return Component as unknown as GenerativeComponent;
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
  Checkout: asGenerative(Checkout),
  Cost: asGenerative(Cost),
  Order: asGenerative(Order),
  Total: asGenerative(Total),
});

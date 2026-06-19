'use client';

import { CaptionsPanel, type CaptionItem } from '@/components/demos/_primitives/CaptionsPanel';
import { type UiInstance, useUiStore } from '@/lib/generative-ui/dispatcher';

/**
 * Pull the agent's live `Captions` instance out of the dispatcher store. Pure so
 * it can be tested without a render (zustand's server snapshot reads initial
 * state, which makes a static render of the consumer untestable directly).
 */
export function selectCaptions(instances: Record<string, UiInstance>): {
  title: string;
  items: CaptionItem[];
} {
  const instance = Object.values(instances).find((i) => i.component === 'Captions');
  const items = (instance?.props.items as CaptionItem[] | undefined) ?? [];
  const title = (instance?.props.title as string | undefined) ?? 'live captions';
  return { title, items };
}

/**
 * Live captions for the call, sourced from the agent's `Captions` instance.
 * Renders the same `CaptionsPanel` primitive the demo canvas uses, so the host
 * and guest see identical captions. The host/guest surface must mount
 * `useUiDispatcher(room, slug)` for the store to fill.
 */
export function CaptionsStrip() {
  const instancesMap = useUiStore((s) => s.instances);
  const { title, items } = selectCaptions(instancesMap);
  return <CaptionsPanel title={title} items={items} />;
}

# Contributing

The voice playground hosts the React side of the demos catalogued in the sibling [`awesome-voice-apps`](https://github.com/mahimailabs/awesome-voice-apps) repo. Each demo can ship a small bundle of React components that the agent worker mounts on the canvas as the call progresses (cart, total, ticker, status badge, whatever the demo needs).

This document describes how to add one.

## Prerequisites

- A demo folder at `../awesome-voice-apps/demos/<slug>/` with a valid `playground.json` manifest.
- The slug in the manifest matches the folder name (the loader cross-checks).
- The manifest's `ui_components` array lists the component names this bundle will register.

## File layout

A per-demo bundle lives at `components/demos/<slug>/`. The canonical example is `components/demos/drive-thru-coffee/index.tsx`:

```
components/demos/drive-thru-coffee/
└── index.tsx         # imports primitives, registers a component map
```

Most demos do not need their own component files. Compose the five shared primitives in `components/demos/_primitives/` (Card / KeyValue / List / ButtonRow / Cost) with demo-specific titles and prop shapes. Drop down to a custom component file only when no primitive fits.

The folder name MUST match the manifest slug in `awesome-voice-apps/demos/<slug>/playground.json`. The build-time loader (`lib/demos/index.ts`) cross-checks slug to folder; a mismatch fails the build.

## Component contract

Each component receives a single props object decoded from the agent's `mount` or `update` event. The store types props as `Record<string, unknown>`, so the component is responsible for narrowing what it cares about. The shared primitives in `components/demos/_primitives/` already do this for the common shapes:

- `CardPanel` for a single contextual box (title + body + optional image + footer).
- `KeyValuePanel` for labeled rows where the last row reads as a total.
- `ListPanel` for vertical title/subtitle/right/image rows (optionally linked).
- `ButtonRowPanel` for a row of `.btn` actions. Buttons without `href` dispatch a `voice-playground:cta` `CustomEvent` on the window so the demo bundle can respond.
- `CostPanel` for the reserved end-of-call summary (see "End-of-call cost" below).

Use brand.css primitives (`.box`, `.box.dashed`, `.h-hand`, `.p-hand`, `.tiny-mono`, `.chip`, `.line`) when you do need to write a custom component. Tailwind utilities are fine on top.

## Registering the bundle

The bundle's `index.tsx` wraps primitives with demo-specific titles and calls `registerForDemo` once at module load. The drive-thru-coffee example:

```tsx
// components/demos/drive-thru-coffee/index.tsx
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
```

Then add a `case` to the switch in `components/demos/DemoBundleLoader.tsx`:

```ts
case '<your-slug>':
  await import('@/components/demos/<your-slug>');
  break;
```

The loader is already mounted from `app/demos/[slug]/page.tsx`; the explicit switch keeps each demo bundle in its own Next.js chunk.

## End-of-call cost

`CostPanel` is special: the agent publishes the call's final cost summary right before disconnect using the convention in `lib/generative-ui/protocol.ts`:

- `component: 'Cost'`
- `id: 'final_cost'`

The playground retains this instance past room disconnect (the dispatcher's slug-keyed clear runs on demo change, not on session end). `VoiceSurface`'s `EndedBody` reads the store for an instance with id `final_cost`, resolves the demo's registered `Cost` component, and renders it with a "try again →" CTA.

Wire `Cost` into every demo bundle if you want the end-of-call breakdown to appear.

## Wire-protocol shape

The agent worker sends JSON envelopes on the LiveKit data channel under topic `ui`:

```json
{ "type": "ui_event", "component": "Cart", "action": "mount", "id": "primary-cart", "props": { "items": [] } }
{ "type": "ui_event", "component": "Cart", "action": "update", "id": "primary-cart", "props": { "items": [{ "name": "americano", "qty": 1, "price": 4.5 }] } }
{ "type": "ui_event", "component": "Cart", "action": "unmount", "id": "primary-cart" }
```

Action semantics:

- `mount`: insert or replace by `id` (defaults to component name when omitted).
- `update`: shallow merge `props` onto the existing instance. No-op if `id` does not match a mounted instance. Coalesced with `requestAnimationFrame` on the client, so a burst of small updates flushes once per frame.
- `unmount`: remove by `id`. No-op if no match.

Schema lives in `lib/generative-ui/protocol.ts`. The Python helper that emits the envelope ships in `awesome-voice-apps/templates/livekit-base/agent.py` as `publish_ui_event`.

## Naming

Component names are exactly what the agent ships in `event.component`:

- PascalCase: `Cart`, `OrderTotal`, `StatusBadge`. The dispatcher does NOT lowercase or normalize.
- Stable across versions of the demo. Renaming a component requires the agent to ship the new name.
- Unique within a demo. The registry replaces wholesale on re-register, so two components with the same name overwrite each other.

## Component checklist

Before opening the PR:

- [ ] Folder `components/demos/<slug>/` matches the manifest slug.
- [ ] Every name in `ui_components` (manifest) is exported from `index.ts` and registered.
- [ ] Components use brand.css primitives where reasonable; no global styles or Tailwind layer overrides.
- [ ] Components handle missing props gracefully (the agent might mount before sending data).
- [ ] No new top-level deps in `package.json` unless absolutely needed (the playground is the cookbook chassis, individual demos should not balloon it).
- [ ] `pnpm build` passes locally.

## Conventions

- No em dashes in copy (use colons, periods, parentheses).
- No `Co-Authored-By: Claude` trailers, no `Generated with Claude Code` footer.
- Commit subject: `feat(demo): add <slug> bundle`. Body explains why this demo needs UI components and what each one shows.

Questions? Open an issue on the [voice-playground](https://github.com/mahimairaja/voice-playground) repo or the [awesome-voice-apps](https://github.com/mahimailabs/awesome-voice-apps) repo depending on whether the question is about this UI or the agent itself.

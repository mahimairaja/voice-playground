# Contributing

The voice playground hosts the React side of the demos catalogued in the sibling [`awesome-voice-apps`](https://github.com/mahimairaja/awesome-voice-apps) repo. Each demo can ship a small bundle of React components that the agent worker mounts on the canvas as the call progresses.

This document describes how to add one.

## Prerequisites

- A demo folder at `../awesome-voice-apps/demos/<slug>/` with a valid `playground.json` manifest.
- The slug in the manifest matches the folder name (the loader cross-checks).
- The manifest's `ui_components` array lists the component names this bundle will register.

## File layout

A per-demo bundle lives at `components/demos/<slug>/`:

```
components/demos/drive-thru-coffee/
├── index.ts          # registers the components on import
├── Cart.tsx          # one file per component, PascalCase name
├── Total.tsx
└── ...
```

The folder name MUST match the manifest slug in `awesome-voice-apps/demos/<slug>/playground.json`. The build-time loader (`lib/demos/index.ts`) cross-checks slug to folder; a mismatch fails the build.

Optional manifest fields:

- `card_stat`: short metric shown on the corkboard card.
- `default_surface`: one of `clipboard_walkie`, `vitals_monitor`, or `whiteboard`. Missing manifests default to `clipboard_walkie`.

## Component contract

Each component receives a single props object decoded from the agent's `mount` or `update` event. The store types props as `Record<string, unknown>`, so the component is responsible for narrowing what it cares about.

```tsx
// components/demos/drive-thru-coffee/Cart.tsx
'use client';

interface CartProps {
  items?: Array<{ name: string; qty: number; price: number }>;
}

export function Cart(props: Record<string, unknown>) {
  const items = (props as CartProps).items ?? [];
  return (
    <div className="box" style={{ padding: 14 }}>
      <p className="tiny-mono">/cart · {items.length} items</p>
      <ul className="mt-2 space-y-1">
        {items.map((item, i) => (
          <li key={i} className="p-hand sm">
            {item.qty} × {item.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

Use brand.css primitives (`.box`, `.box.dashed`, `.h-hand`, `.p-hand`, `.tiny-mono`, `.chip`, `.line`) so the components feel native to the playground. Tailwind utilities are fine on top.

## Registering the bundle

The bundle's `index.ts` imports each component and calls `registerForDemo` exactly once. The call has to run at module-load time so the components are in the registry before the dispatcher receives its first event.

```ts
// components/demos/drive-thru-coffee/index.ts
import { registerForDemo } from '@/lib/generative-ui/registry';
import { Cart } from './Cart';
import { Total } from './Total';

registerForDemo('drive-thru-coffee', { Cart, Total });

// Re-export so the per-demo page can pull the bundle in via a side-effect
// import.
export {};
```

Then add the slug to `components/demos/DemoBundleLoader.tsx`. The dynamic route imports that helper once, so the core route stays manifest-driven.

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

Final cost summaries keep the shared convention: `component: "Cost"` and `id: "final_cost"`.

CTA components dispatch browser events on `mahimai:cta`. Agents and page-level listeners should use that event name.

## Demo surfaces

The per-demo route can render three reusable shells without demo-specific React in the core route:

- `clipboard_walkie`: transcript-forward call panel plus a mounted UI clipboard.
- `vitals_monitor`: call health, stack, and latency monitor.
- `whiteboard`: canvas-first layout for agent-written state.

The selected surface comes from `playground.json#default_surface` and can be overridden while connected by LiveKit room metadata:

```json
{ "surface": "whiteboard" }
```

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

Questions? Mahimai is the sole maintainer; open an issue or email `hello@mahimai.ca`.

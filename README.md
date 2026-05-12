# voice playground

A light-only Next.js 15 frontend for trying the voice agents catalogued in [`awesome-voice-apps`](https://github.com/mahimairaja/awesome-voice-apps). Visitors bring provider keys, paste them into the credentials vault, and the playground mints a short-lived LiveKit token in the browser.

This is a standalone playground, not a hosted product. Keys are stored only in browser localStorage and are never logged or persisted server-side.

## What ships

- Light-only wireframe surfaces: lab notebook landing, corkboard demos, field manual about, credentials vault, clipboard walkie, vitals monitor, and whiteboard.
- Manifest-driven demos loaded from the sibling `../awesome-voice-apps` repo at build time.
- A BYO-keys credentials drawer and missing-keys banner.
- A LiveKit voice surface with transcript, room metadata surface switching, and light-mode visualizers.
- A generative UI dispatcher so agents can mount, update, and unmount registered React components on the canvas.

The Python agent worker lives in `../awesome-voice-apps`. This repo only ships the visitor-side client.

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

The marketing surfaces render without provider keys. A live voice call needs:

1. A manifest at `../awesome-voice-apps/demos/<slug>/playground.json`.
2. Provider keys and a LiveKit URL, API key, and API secret pasted into the vault drawer.
3. The matching Python agent worker running and joining the same LiveKit room.

`app/api/token/route.ts` is the only API route. It reads the pasted LiveKit credentials from the request body, signs a one-hour AccessToken, and discards the secrets.

## Demo manifests

`playground.json` supports these fields:

```json
{
  "slug": "drive-thru-coffee",
  "title": "Drive-thru coffee",
  "category": "restaurant",
  "description": "Take an order by voice.",
  "who_for": "Teams comparing real-time voice stacks.",
  "recording_url": "https://example.com/demo.mp3",
  "card_stat": "11s avg",
  "default_surface": "clipboard_walkie",
  "required_credentials": ["openai", "deepgram", "cartesia"],
  "ui_components": ["Order", "Total", "Checkout", "Cost"]
}
```

`card_stat` and `default_surface` are optional. `default_surface` can be `clipboard_walkie`, `vitals_monitor`, or `whiteboard`; missing manifests default to `clipboard_walkie`.

LiveKit room metadata can override the visible demo surface while connected:

```json
{ "surface": "whiteboard" }
```

## Generative UI

Agents publish JSON envelopes on the LiveKit data channel under topic `ui`:

```json
{
  "type": "ui_event",
  "component": "Cart",
  "action": "mount",
  "id": "primary-cart",
  "props": { "items": [] }
}
```

Actions:

- `mount`: add or replace an instance by `id`.
- `update`: shallow merge `props` into an existing instance.
- `unmount`: remove an instance by `id`.

Final cost summaries keep the existing convention: `component: "Cost"` and `id: "final_cost"`.

CTA components dispatch browser events on `mahimai:cta` with the CTA payload in `event.detail`.

## Architecture

```text
app/
  (marketing)/        landing and about
  demos/page.tsx      corkboard index with category filter
  demos/[slug]/       manifest-driven demo route
  api/token/route.ts  BYO LiveKit token mint
components/
  brand/              TopBar and Footer chrome
  playground/         vault, banner, demo runtime, voice surface, transcript
  generative/         Canvas for agent-mounted UI
  demos/              static demo bundle imports and reusable primitives
lib/
  demos/              manifest schema, loader, surface metadata parser
  credentials/        localStorage credential store and validation
  generative-ui/      protocol, dispatcher, registry
styles/
  brand.css           wireframe primitive port, do not edit
  globals.css         Tailwind tokens and light-only app overrides
```

## Commands

```bash
pnpm tsc --noEmit
pnpm lint
pnpm build
```

`pnpm build` runs `scripts/sync-demos.mjs` first. Locally it reuses `../awesome-voice-apps` when present; on Vercel it clones a fresh copy using `AVA_REPO` and `AVA_REF`. If GitHub cannot be read, the build continues with the reference seed catalogue unless `AVA_SYNC_STRICT=1`.

## License

MIT. See `LICENSE`.

# CLAUDE.md

Operating instructions for any Claude session working in this repo. Auto loaded by Claude Code. The shorter and sharper this file is, the better the playground holds up.

## What this repo is

A standalone voice playground. Public site at `playground.mahimai.ca`. A Next.js 15 frontend that lets visitors talk to the voice agents catalogued in the sister repo `awesome-voice-apps`. The catalog is fetched at runtime from `raw.githubusercontent.com/mahimairaja/awesome-voice-apps/main/catalog.json` with a 5-minute Next.js cache. Visitors paste their three LiveKit values (URL, API key, secret) in the credentials sheet and the playground mints a short-lived token in their browser via `jose` (no server-side route). Provider keys (OpenAI, Deepgram, ElevenLabs, etc.) live in the agent's own `.env` on the developer's machine; the playground never touches them.

If a piece of work does not advance one of these, it does not belong in this repo:

1. Render the cookbook (the marketing landing, demo index, per-demo page) with the brand intact.
2. Connect a visitor to a demo (credentials drawer, in-browser JWT signing, voice surface, transcript).
3. Render the agent's generative UI (canvas plus dispatcher plus per-demo component bundles).

## Default mode: brainstorm before code

When the operator opens a fresh session and asks for help, default to **brainstorming**, not coding. Confirm the change is in scope below, then propose the smallest path. Only start writing code when the operator says go, or when the request is unambiguously about execution.

## Tech stack

| Layer           | Choice                                                                                                                                                                                                                                                                 |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, React 19, TypeScript                                                                                                                                                                                                                            |
| Package manager | pnpm (never npm or yarn)                                                                                                                                                                                                                                               |
| Styling         | Tailwind v4 with the clean-light teal tokens matched to mahimai.ca (white page, single teal accent, dark instrument screens). shadcn registry at `components/ui/`. `@agents-ui/*` lives in `components/agents-ui/`. Shared brand primitives in `components/phosphor/`. |
| Design tokens   | `lib/design/tokens.ts` is the source of truth (palette, radius, spacing). `styles/globals.css` mirrors values into a Tailwind v4 `@theme inline` block and also defines the shadcn semantic variable set the vendored registries consume.                              |
| Fonts           | Inter (display/sans, matched to mahimai.ca) + JetBrains Mono (instrument readouts and code only), loaded once in `app/layout.tsx` via `next/font/google`. No other web fonts.                                                                                          |
| Validation      | zod (catalog schema, UI-event envelope, credentials types)                                                                                                                                                                                                             |
| State           | zustand (the generative-UI store only). React state everywhere else.                                                                                                                                                                                                   |
| Theming         | Light only. Dark exists solely as scoped `.dark` instrument screens (ScopeFrame `screen` bodies), on a cool near-black scope. No page-level dark mode, no system-preference switch.                                                                                    |
| Voice runtime   | livekit-client plus `@livekit/components-react`. Visitor-supplied LiveKit URL/key/secret.                                                                                                                                                                              |
| Hosting         | Vercel Hobby tier, Node 20 pin via `package.json#engines.node` and `vercel.json`.                                                                                                                                                                                      |
| Tests           | Vitest (jsdom) for pure modules only. No RTL, no Playwright in CI.                                                                                                                                                                                                     |

The agent worker (Python, `livekit-agents 1.x`) lives in `../awesome-voice-apps`, NOT in this repo. The playground only ships the visitor-side client.

## Hard constraints

- **`lib/design/tokens.ts` is the design source of truth.** Every color, radius, spacing stop comes from there and is mirrored into `styles/globals.css`'s `@theme inline` block. The documented palette (matched to mahimai.ca) is: surfaces (`--color-bg`, `--color-surface`, `--color-surface-2`, `--color-surface-3`, `--color-scope`), borders (`--color-border`, `--color-border-strong`, `--color-border-dim`), text scale (`--color-text`, `--color-text-dim`, `--color-text-mute`, `--color-text-fade`), accent (`--color-accent`, `--color-accent-dim`, `--color-accent-deep`, `--color-accent-soft`), screen text (`--color-scope-text`, `--color-scope-text-dim`), and status (`--color-live`, `--color-warning`, `--color-danger`). Every documented fg/bg pair is asserted at WCAG AA by `lib/design/tokens.contrast.test.ts`; a palette change that fails the gate is wrong by definition. Any new token needs an explicit reason in the PR.
- **Teal `#1f96aa` is a fill color, not text.** Used for primary CTA fills (always with white ink on top, matching mahimai.ca), chips, the active filter chip, and the scope trace. Deep teal `--color-accent-dim` (`#15788a`, AA on every light surface and the gray-50 surface-2) carries links, labels, focus rings, and the CTA hover fill; `--color-accent-deep` (`#116575`) carries headline emphasis. The connected/live state uses green `--color-live` (`#15803d`). The gate reflects this: white-on-teal is gated at 3:1 as a UI component, and the 4.5:1 text-on-accent assertion lives on white-over-accent-dim (the hover fill).
- **Light only.** The page is white; there is no page-level dark mode and no system-preference switch. Dark exists solely inside instrument screens: a `ScopeFrame` with the `screen` prop (or an explicit `dark` class wrapper) flips the scoped shadcn semantic tokens for everything inside it, on the cool near-black `--color-scope`.
- **Type: Inter + JetBrains Mono only.** Loaded once in `app/layout.tsx` via `next/font/google`. Chrome, headings, nav, footer, eyebrows, and buttons are Inter (matching mahimai.ca). JetBrains Mono is reserved for instrument readouts inside screens (ScopeFrame rails, scope captions, tabular timers) and for actual code, env var names, key values, and shell commands, never chrome or body copy. Do not introduce Space Grotesk, Geist, Caveat, Kalam, or any other web font.
- **Instrument texture stays inside the screens.** Film grain + CRT scanlines (`.ph-grain` / `.ph-scan` in `globals.css`) and the `OscWave` / `AgentWaveTrace` traces live only inside dark screen interiors; never on page surfaces or over body text. The `.card`, `.card-hover`, and `.badge` primitives (ported from mahimai.ca) and the `Reveal` scroll-reveal / `.animate-page-enter` / `.shiny-text` / `.btn-shine` motion vocabulary carry the light marketing surfaces. Do NOT reintroduce the old wireframe primitives (`.brand`/`.box`/`.h-hand`/`.p-hand`, paper-grid, pushpins, scotch tape, hand-drawn arrows).
- **`references/*.html` is historical only.** The wireframe HTML files are kept for archival reference. Do not consume them at runtime, do not reformat them with Prettier (they are in `.prettierignore`).
- **No demo-specific React components in this repo.** `components/demos/<slug>/*` is reserved for the per-demo bundles that ship in F1.3. The current iteration only provides the registry, dispatcher, and Canvas; bundles register themselves.
- **No backticks in shell prompts you suggest the operator paste.**
- **No em dashes anywhere.** Use colons, periods, semicolons, or parentheses.
- **No `Co-Authored-By: Claude` trailers, no `Generated with Claude Code` footer, no robot emoji, no AI attribution.** Commits read as if Mahimai authored them directly.
- No server-side code. F1.2 removed `app/api/token/route.ts`; the LiveKit JWT is signed in the browser via `jose` from the visitor's pasted credentials. No keys leave the browser, no server roundtrip.

## File conventions

- `app/(marketing)/` is the marketing route group: `/` (landing), `/about`, and `/contribute` (the contributor guide with the live `components/contribute/` component gallery). Server-rendered.
- `app/demos/page.tsx` is the demo index with a URL-driven category filter.
- `app/demos/[slug]/page.tsx` is the per-demo page. Uses `generateStaticParams` from `getAllDemos()` and `dynamicParams = false`, so unknown slugs 404 at the route layer.
- `app/maintenance/page.tsx` is the maintenance landing (App Router route, replaces the deleted `public/maintenance.html`).
- `app/error.tsx` (client) and `app/not-found.tsx` (server) share the clean-light look.
- `app/layout.tsx` mounts `<PlaygroundHeader>`, `<PlaygroundFooter>`, and the sonner `<Toaster>`, loads Inter + JetBrains Mono, and configures `generateMetadata` (static strings; `resolveMetadataBase` hardens `NEXT_PUBLIC_SITE_URL`).
- `app/demos/loading.tsx` renders skeleton cards while the runtime catalog fetch resolves; the landing wraps its featured row in `Suspense` the same way.
- `components/layout/` is the global chrome: `PlaygroundHeader`, `PlaygroundFooter`.
- `components/credentials/` is the LiveKit-keys UI: `CredentialsSheet` (human-labelled fields, eye reveals, AlertDialog clear confirm, always renders the three `LIVEKIT_KEYS`), `CredentialsButton`. The sheet listens for `CRED_OPEN_DRAWER_EVENT` so any other surface can ask it to open.
- `components/playground/` is the demo runtime: `DemoRuntime`, `VoicePanel`, `AgentCanvas`, `AgentCanvasEmpty`, `MicDeviceSelect`, `CopySnippet`, `SessionTimer`, `Transcript`, `CookbookSourceLink`, `CatalogError`. Two-pane layout (voice left, agent canvas right).
- `components/playground/AgentCanvas.tsx` reads from the dispatcher store and renders components via the registry.
- `components/agents-ui/` is the upstream LiveKit `@agents-ui/*` registry (only the three components the runtime renders). Edit in place if you must, but `pnpm shadcn:install` will overwrite. Prefer Tailwind class overrides on the consuming side.
- `lib/design/tokens.ts` is the design-token source of truth; `lib/design/tokens.contrast.test.ts` is its WCAG AA gate.
- `lib/cookbook/` is the runtime catalog fetcher: `schema.ts` (zod mirror of `catalog.schema.json`), `manifest.ts` (`fetchCatalog`, `CatalogFetchError`, 5-minute `next: { revalidate }`), `url.ts` (URL constants, `demoSourceUrl`).
- `lib/demos/` is a thin adapter over the cookbook fetcher: `index.ts` (`getAllShipped`, `getAllPlanned`, `getAllDemos`, `getShippedBySlug`, `getDemoCategories`), `planned.ts` (hand-curated upcoming demos).
- `lib/livekit/mintToken.ts` mints the LiveKit JWT in the browser via `jose`.
- `lib/credentials/` is the localStorage store (`store.ts` per-key prefix `mahimai_playground:cred:<name>`, exports `LIVEKIT_KEYS`), the missing-keys helper (`validate.ts`), and the React hook (`useCredentials.ts`).
- `lib/generative-ui/` is the protocol schema, registry, and dispatcher.
- `lib/shadcn/utils.ts` is the `cn()` helper every component imports. There is no `lib/utils.ts`.

## Commands

| Command               | Purpose                                                                                               |
| --------------------- | ----------------------------------------------------------------------------------------------------- |
| `pnpm install`        | Install deps. Node 20 pin emits a warning on Node 22 dev machines, harmless.                          |
| `pnpm dev`            | Next dev with Turbopack on http://localhost:3000.                                                     |
| `pnpm build`          | Production build. Catalog fetches from GitHub Raw at request time, not at build time.                 |
| `pnpm lint`           | ESLint plus Next core-web-vitals plus prettier.                                                       |
| `pnpm format`         | Prettier write. Use `pnpm exec prettier --write <file>` to format a single file.                      |
| `pnpm shadcn:install` | Re-pull the three live `@agents-ui/*` components from the registry. Prompts before overwriting.       |
| `pnpm test`           | Run the Vitest pure-module suite (`lib/credentials/*.test.ts`, `lib/design/tokens.contrast.test.ts`). |

CI runs `lint`, `format:check`, `test`, and `build`. Component / E2E smoke is still manual.

## Required env vars

Production:

- `NEXT_PUBLIC_SITE_URL` (e.g. `https://playground.mahimai.ca`). Used by `generateMetadata` for the `metadataBase`.

Local (`.env.local`, optional for the marketing surfaces):

- `NEXT_PUBLIC_SITE_URL` for OG link previews to render the right absolute URLs.
- `NEXT_PUBLIC_COOKBOOK_BASE_URL` overrides the GitHub Raw base for the catalog fetch (e.g. for forks of awesome-voice-apps). Defaults to `mahimairaja/awesome-voice-apps#main`.

There is no token route. The visitor's three LiveKit values are read from `localStorage` and signed in the browser via `jose`. Provider keys never enter the playground.

## Runtime catalog fetch

Demo manifests come from `lib/cookbook/manifest.fetchCatalog()`, a server-only fetcher that hits `raw.githubusercontent.com/mahimairaja/awesome-voice-apps/main/catalog.json` with `next: { revalidate: 300, tags: ['cookbook'] }`. Vercel's edge caches the response for 5 minutes; cookbook updates appear within that window. Fetch failures throw `CatalogFetchError(cause: 'network' | 'http' | 'parse')`; route boundaries render `<CatalogError>` with the cookbook GitHub link. No build-time sibling clone, no `_generated.json`, no reference seed fallback — missing data is an honest signal.

## Generative UI protocol

The agent worker ships JSON envelopes on the LiveKit data channel under topic `ui`:

```json
{
  "type": "ui_event",
  "component": "Cart",
  "action": "mount",
  "id": "primary-cart",
  "props": { "items": [] }
}
```

Action semantics:

- `mount`: add an instance keyed by `id` (defaults to component name). Existing id is replaced.
- `update`: merge `props` onto the existing instance. No-op on miss. Coalesced with rAF (16 ms) on the client.
- `unmount`: remove the instance. No-op on miss.

Schema lives in `lib/generative-ui/protocol.ts`. Per-demo components register themselves into `lib/generative-ui/registry.ts` via `registerForDemo(slug, map)`. The dispatcher (`lib/generative-ui/dispatcher.ts`) holds the live store; `components/playground/AgentCanvas.tsx` reads from it.

Final cost summaries keep `component: "Cost"` and `id: "final_cost"`. CTA listeners use `mahimai:cta`.

## Commit conventions

Match the format the milestone branch already uses:

- `M<n>/T<NN>: <one-line summary>` for any task that is part of a Ralph milestone (subject + body).
- `feat(playground): <one-line>` / `fix(playground): <one-line>` / `docs(playground): <one-line>` / `chore(playground): <one-line>` for repo-level work outside the milestone loop.

Subject line: imperative mood, lowercase, under 70 characters. Body: explain why, not what. Include a `REQ-AVA-PLAY-<n>, Foundry Imp <n>` line for milestone tasks.

Do not stage `.env*` files (only `.env.example` is committed), `.next/`, `node_modules/`, or anything in the gitignored `.agents/` and `.brand/` folders.

## Voice and tone

The playground reads to indie engineers and developers comparing voice stacks. The voice in headlines and body is direct, slightly opinionated, and never marketing-fluffy. Skip qualifiers (very, really, just, simply) and hedges (might, perhaps, maybe). Show concrete behaviour.

The brand wordmark in chrome is `mahimai` lowercase. Page-level prose uses `voice playground` lowercase.

## What goes where

- A reusable React surface across the playground: into `components/{brand,playground,generative}/`.
- A per-demo React surface (M2): into `components/demos/<slug>/index.ts`. Registers a component map.
- A reusable utility: into `lib/<domain>/`.
- A new manifest field: zod schema in `lib/demos/schema.ts` first, then loader, then UI.
- A planning artifact (Refinery doc, Foundry blueprint, design notes): Linear, not the repo.
- An agent / Python concern: `../awesome-voice-apps`, not here. Exception: the `publish_ui_event` helper that ships in T36 lives in `awesome-voice-apps/templates/livekit-base/agent.py`.

## Out of scope for this repo

- Anything ShipVoice shaped. Separate repo, separate product.
- The agent worker itself. Lives in `../awesome-voice-apps`.
- Voice Arena (scenario picker, stack picker, rating, leaderboard). Separate milestone.
- Sentry, PostHog, Plausible, any telemetry.
- Component / E2E test infrastructure (RTL, Playwright). Pure-module Vitest coverage of `lib/credentials/*` ships in F1.1; component and end-to-end smoke remain manual.
- Mobile-optimised layouts beyond what the upstream shell provides.

## When the operator asks for the next change

1. Read `.agents/design.md` and `.agents/TODO.md` to confirm the current milestone scope.
2. If the request is in scope, propose the smallest commit and confirm before coding. If not, surface the mismatch and ask whether to log a follow-up or extend scope.
3. Honour the visual system: `lib/design/tokens.ts` is the source of truth, mirrored into `styles/globals.css`. Single teal accent (fill-only, white ink on top), Inter + JetBrains Mono only, mahimai.ca card/shadow/motion vocabulary on light surfaces, PHOSPHOR scope/grain motif kept inside the runtime instrument screens (no old wireframe primitives).
4. Build via `pnpm build` before declaring done.

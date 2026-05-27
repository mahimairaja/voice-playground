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

| Layer           | Choice                                                                                                                                                  |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, React 19, TypeScript                                                                                                             |
| Package manager | pnpm (never npm or yarn)                                                                                                                                |
| Styling         | Tailwind v4 with the F1 dark + cyan tokens. shadcn registry at `components/ui/`. `@agents-ui/*` lives in `components/agents-ui/`.                       |
| Design tokens   | `lib/design/tokens.ts` is the source of truth (palette, radius, spacing). `styles/globals.css` mirrors values into a Tailwind v4 `@theme inline` block. |
| Fonts           | Geist + Geist Mono, loaded once in `app/layout.tsx` via `next/font/google`. No other web fonts.                                                         |
| Validation      | zod (catalog schema, UI-event envelope, credentials types)                                                                                              |
| State           | zustand (the generative-UI store only). React state everywhere else.                                                                                    |
| Theming         | Dark only. `<html class="dark">` is forced; there is no light theme and no system-preference switch.                                                    |
| Voice runtime   | livekit-client plus `@livekit/components-react`. Visitor-supplied LiveKit URL/key/secret.                                                               |
| Hosting         | Vercel Hobby tier, Node 20 pin via `package.json#engines.node` and `vercel.json`.                                                                       |
| Tests           | Vitest (jsdom) for pure modules only. No RTL, no Playwright in CI.                                                                                      |

The agent worker (Python, `livekit-agents 1.x`) lives in `../awesome-voice-apps`, NOT in this repo. The playground only ships the visitor-side client.

## Hard constraints

- **`lib/design/tokens.ts` is the design source of truth.** Every color, radius, spacing stop comes from there and is mirrored into `styles/globals.css`'s `@theme inline` block. The documented palette is: surfaces (`--color-bg`, `--color-surface`, `--color-surface-2`), borders (`--color-border`, `--color-border-strong`, `--color-border-dim`), text scale (`--color-text`, `--color-text-dim`, `--color-text-mute`, `--color-text-fade`), accent (`--color-accent`, `--color-accent-soft`), and status (`--color-warning`, `--color-danger`). Any new token needs an explicit reason in the PR.
- **Single accent: cyan `#2DD4BF`.** Used only for primary CTAs, live-state indicators, the active-route underline, and per-surface highlights.
- **Dark only.** No light theme, no `body.clean` toggle, no system-preference switch. `<html class="dark">` is forced in `app/layout.tsx`.
- **Type: Geist + Geist Mono only.** Loaded once in `app/layout.tsx` via `next/font/google`. Do not introduce Caveat, Kalam, JetBrains Mono, or any other web font.
- **No wireframe primitives.** `styles/brand.css`, `.brand`/`.box`/`.tab`/`.chip`/`.stamp`/`.h-hand`/`.p-hand` classes, paper-grid backgrounds, pushpins, scotch tape, stamps, and hand-drawn arrows are gone. Do not reintroduce them.
- **`references/*.html` is historical only.** The wireframe HTML files are kept for archival reference. Do not consume them at runtime, do not reformat them with Prettier (they are in `.prettierignore`).
- **No demo-specific React components in this repo.** `components/demos/<slug>/*` is reserved for the per-demo bundles that ship in F1.3. The current iteration only provides the registry, dispatcher, and Canvas; bundles register themselves.
- **No backticks in shell prompts you suggest the operator paste.**
- **No em dashes anywhere.** Use colons, periods, semicolons, or parentheses.
- **No `Co-Authored-By: Claude` trailers, no `Generated with Claude Code` footer, no robot emoji, no AI attribution.** Commits read as if Mahimai authored them directly.
- No server-side code. F1.2 removed `app/api/token/route.ts`; the LiveKit JWT is signed in the browser via `jose` from the visitor's pasted credentials. No keys leave the browser, no server roundtrip.

## File conventions

- `app/(marketing)/` is the marketing route group: `/` (landing) and `/about`. Server-rendered.
- `app/demos/page.tsx` is the demo index with a URL-driven category filter.
- `app/demos/[slug]/page.tsx` is the per-demo page. Uses `generateStaticParams` from `getAllDemos()` and `dynamicParams = false`, so unknown slugs 404 at the route layer.
- `app/maintenance/page.tsx` is the dark-themed maintenance landing (App Router route, replaces the deleted `public/maintenance.html`).
- `app/error.tsx` (client) and `app/not-found.tsx` (server) are dark-themed.
- `app/layout.tsx` mounts `<PlaygroundHeader>` and `<PlaygroundFooter>`, forces the `dark` class on `<html>`, loads Geist + Geist Mono, and configures `generateMetadata`.
- `components/layout/` is the global chrome: `PlaygroundHeader`, `PlaygroundFooter`.
- `components/credentials/` is the LiveKit-keys UI: `CredentialsSheet` (always renders the three `LIVEKIT_KEYS`), `CredentialsButton`. The sheet listens for `CRED_OPEN_DRAWER_EVENT` so any other surface can ask it to open.
- `components/playground/` is the demo runtime: `DemoRuntime`, `VoicePanel`, `AgentCanvas`, `AgentCanvasEmpty`, `SessionTimer`, `Transcript`, `CookbookSourceLink`, `CatalogError`. Two-pane layout (voice left, agent canvas right).
- `components/generative/Canvas.tsx` reads from the dispatcher store and renders per-demo components via the registry.
- `components/agents-ui/` is the upstream LiveKit `@agents-ui/*` registry. Edit in place if you must, but `pnpm shadcn:install` will overwrite. Prefer Tailwind class overrides on the consuming side.
- `lib/design/tokens.ts` is the design-token source of truth.
- `lib/cookbook/` is the runtime catalog fetcher: `schema.ts` (zod mirror of `catalog.schema.json`), `manifest.ts` (`fetchCatalog`, `CatalogFetchError`, 5-minute `next: { revalidate }`), `url.ts` (URL constants, `demoSourceUrl`).
- `lib/demos/` is a thin adapter over the cookbook fetcher: `index.ts` (`getAllShipped`, `getAllPlanned`, `getAllDemos`, `getShippedBySlug`, `getDemoCategories`), `planned.ts` (hand-curated upcoming demos).
- `lib/livekit/mintToken.ts` mints the LiveKit JWT in the browser via `jose`.
- `lib/credentials/` is the localStorage store (`store.ts` per-key prefix `mahimai_playground:cred:<name>`, exports `LIVEKIT_KEYS`), the missing-keys helper (`validate.ts`), and the React hook (`useCredentials.ts`).
- `lib/generative-ui/` is the protocol schema, registry, and dispatcher.
- `lib/utils.ts` is app-wide utilities.

## Commands

| Command               | Purpose                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| `pnpm install`        | Install deps. Node 20 pin emits a warning on Node 22 dev machines, harmless.          |
| `pnpm dev`            | Next dev with Turbopack on http://localhost:3000.                                     |
| `pnpm build`          | Production build. Catalog fetches from GitHub Raw at request time, not at build time. |
| `pnpm lint`           | ESLint plus Next core-web-vitals plus prettier.                                       |
| `pnpm format`         | Prettier write. Use `pnpm exec prettier --write <file>` to format a single file.      |
| `pnpm shadcn:install` | Re-pull every `@agents-ui/*` component from the registry. Prompts before overwriting. |
| `pnpm test`           | Run the Vitest pure-module suite (`lib/credentials/*.test.ts`).                       |

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

Schema lives in `lib/generative-ui/protocol.ts`. Per-demo components register themselves into `lib/generative-ui/registry.ts` via `registerForDemo(slug, map)`. The dispatcher (`lib/generative-ui/dispatcher.ts`) holds the live store; the Canvas reads from it.

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
3. Honour the visual system: `lib/design/tokens.ts` is the source of truth, mirrored into `styles/globals.css`. Single cyan accent, Geist + Geist Mono only, no wireframe primitives.
4. Build via `pnpm build` before declaring done.

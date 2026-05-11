# CLAUDE.md

Operating instructions for any Claude session working in this repo. Auto loaded by Claude Code. The shorter and sharper this file is, the better the playground holds up.

## What this repo is

A standalone open-source playground: a Next.js 15 frontend that lets visitors talk to the voice agents catalogued in the sister repo `awesome-voice-apps` (sibling on disk: `../awesome-voice-apps`). Visitors bring their own provider keys, paste them in the credentials drawer, and the playground mints a short-lived LiveKit token in their browser. This is NOT a hosted product, NOT a consultancy site, NOT a marketing surface for any specific company.

If a piece of work does not advance one of these, it does not belong in this repo:

1. Render the catalogue (landing, demo index, per-demo page, about) with the brand intact.
2. Connect a visitor to a demo (credentials drawer, token route, voice surface, transcript).
3. Render the agent's generative UI (canvas plus dispatcher plus per-demo component bundles).

## Default mode: brainstorm before code

When the operator opens a fresh session and asks for help, default to **brainstorming**, not coding. Confirm the change is in scope below, then propose the smallest path. Only start writing code when the operator says go, or when the request is unambiguously about execution.

## Tech stack

| Layer           | Choice                                                                                                     |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| Framework       | Next.js 15 App Router, React 19, TypeScript                                                                |
| Package manager | pnpm (never npm or yarn)                                                                                   |
| Styling         | Tailwind v4 plus brand.css primitives. shadcn registry at `components/ui/`. `@agents-ui/*` registry.       |
| Validation      | zod (manifest schema, UI-event envelope, token route body)                                                 |
| State           | zustand (the generative-UI store only). React state everywhere else.                                       |
| Theming         | next-themes for light/dark, body.clean toggle for sketchy/clean modes (see `lib/theme.ts`, `lib/mode.ts`). |
| Voice runtime   | livekit-client plus `@livekit/components-react`. Visitor-supplied LiveKit URL/key/secret.                  |
| Hosting         | Vercel Hobby tier, Node 20 pin via `package.json#engines.node` and `vercel.json`.                          |

The agent worker (Python, `livekit-agents 1.x`) lives in `../awesome-voice-apps`, NOT in this repo. The playground only ships the visitor-side client.

## Hard constraints

- **Brand assets are in place. Do not regenerate `public/brand/goat.svg`, `styles/brand.css`, the favicon set, or `public/og-image.png`.** Source of truth for the design is the wireframe HTML in `.brand/` (gitignored). The seven curated wireframe variants live under `references/` and are the visual contract for the rendered surfaces.
- **Do not edit `styles/brand.css` directly.** It mirrors the wireframes verbatim. Theme overrides go in `styles/globals.css` (the `@theme inline` block) or via the `brand-accent` opt-in class for elements that need terracotta where shadcn overrode `--accent`.
- **No demo-specific React components in this repo.** `components/demos/<slug>/*` is reserved for the per-demo bundles that ship in M2. The current iteration only provides the registry, dispatcher, and Canvas; bundles register themselves.
- **No backticks in shell prompts you suggest the operator paste.**
- **No em dashes anywhere.** Use colons, periods, semicolons, or parentheses. The wireframes contain em dashes; the rule still applies.
- **No `Co-Authored-By: Claude` trailers, no `Generated with Claude Code` footer, no robot emoji, no AI attribution.** Commits read as if the maintainer authored them directly.
- The API route `app/api/token/route.ts` is the only server-side code. It mints LiveKit AccessTokens from visitor-pasted credentials and never logs or persists them.

## File conventions

- `app/(marketing)/` is the marketing route group: `/` (landing) and `/about`. Both server-rendered, brand.css primitives only.
- `app/demos/page.tsx` is the demo index with a URL-driven category filter.
- `app/demos/[slug]/page.tsx` is the per-demo page. Uses `generateStaticParams` from `getAllDemos()` and `dynamicParams = false`, so unknown slugs 404 at the route layer.
- `app/api/token/route.ts` is the only API route.
- `app/error.tsx` (client) and `app/not-found.tsx` (server) are brand-styled.
- `app/layout.tsx` mounts the brand chrome (`TopBar`, `Footer`, `ThemeProvider`, `Script` for the clean-mode pre-paint) and `generateMetadata` for icons / OG.
- `components/brand/` is brand chrome: `Logo`, `TopBar`, `Footer`. All consume brand.css primitive classes.
- `components/playground/` is the demo runtime: `CredentialsDrawer`, `CredentialsBanner`, `VoiceSurface`, `Transcript`. Coordinates the visitor session.
- `components/generative/Canvas.tsx` reads from the dispatcher store and renders per-demo components via the registry.
- `components/agents-ui/` is the upstream LiveKit `@agents-ui/*` registry. Edit in place if you must, but `pnpm shadcn:install` will overwrite. Prefer Tailwind class overrides on the consuming side.
- `lib/demos/` is the build-time manifest loader. `server-only` guarded.
- `lib/credentials/` is the localStorage store plus the optional async provider ping.
- `lib/generative-ui/` is the protocol schema, registry, and dispatcher.
- `lib/theme.ts`, `lib/mode.ts`, `lib/utils.ts` are app-wide utilities.

## Commands

| Command               | Purpose                                                                               |
| --------------------- | ------------------------------------------------------------------------------------- |
| `pnpm install`        | Install deps. Node 20 pin emits a warning on Node 22 dev machines, harmless.          |
| `pnpm dev`            | Next dev with Turbopack on http://localhost:3000.                                     |
| `pnpm build`          | Production build. The CI gate.                                                        |
| `pnpm lint`           | ESLint plus Next core-web-vitals plus prettier.                                       |
| `pnpm format`         | Prettier write. Use `pnpm exec prettier --write <file>` to format a single file.      |
| `pnpm shadcn:install` | Re-pull every `@agents-ui/*` component from the registry. Prompts before overwriting. |

There is no test suite. CI runs `lint`, `format:check`, and `build`. Smoke tests are manual (per `.agents/TODO.md` Phase 9).

## Required env vars

Production:

- `NEXT_PUBLIC_SITE_URL` (e.g. `https://your-playground-domain.example.com`). Used by `generateMetadata` for the `metadataBase`.

Local (`.env.local`, optional for the marketing surfaces):

- `NEXT_PUBLIC_SITE_URL` for OG link previews to render the right absolute URLs.

The token route does NOT read any env var. Visitor credentials come from the request body.

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

## Commit conventions

Match the format the milestone branch already uses:

- `M<n>/T<NN>: <one-line summary>` for any task that is part of a Ralph milestone (subject + body).
- `feat(playground): <one-line>` / `fix(playground): <one-line>` / `docs(playground): <one-line>` / `chore(playground): <one-line>` for repo-level work outside the milestone loop.

Subject line: imperative mood, lowercase, under 70 characters. Body: explain why, not what. Include a `REQ-AVA-PLAY-<n>, Foundry Imp <n>` line for milestone tasks.

Do not stage `.env*` files (only `.env.example` is committed), `.next/`, `node_modules/`, or anything in the gitignored `.agents/` and `.brand/` folders.

## Voice and tone

The playground reads to indie engineers and developers comparing voice stacks. The voice in headlines and body is direct, slightly opinionated, never marketing-fluffy. Skip qualifiers (very, really, just, simply) and hedges (might, perhaps, maybe). Show concrete behaviour.

The brand wordmark in chrome is `playground` lowercase. Page-level prose uses `voice playground` lowercase. Do NOT promote any specific company, consultancy, or hosted product in user-facing copy; this is a standalone tool for the awesome-voice-apps catalogue.

## What goes where

- A reusable React surface across the playground: into `components/{brand,playground,generative}/`.
- A per-demo React surface (M2): into `components/demos/<slug>/index.ts`. Registers a component map.
- A reusable utility: into `lib/<domain>/`.
- A new manifest field: zod schema in `lib/demos/schema.ts` first, then loader, then UI.
- A planning artifact (design notes, scope docs, follow-up lists): planning system of choice, not the repo.
- An agent / Python concern: `../awesome-voice-apps`, not here. Exception: the `publish_ui_event` helper that ships in T36 lives in `awesome-voice-apps/templates/livekit-base/agent.py`.

## Out of scope for this repo

- Anything ShipVoice shaped. Separate repo, separate product.
- The agent worker itself. Lives in `../awesome-voice-apps`.
- Voice Arena (scenario picker, stack picker, rating, leaderboard). Separate milestone.
- Sentry, PostHog, Plausible, any telemetry.
- An automated test suite. Manual smoke only.
- Mobile-optimised layouts beyond what the upstream shell provides.

## When the operator asks for the next change

1. Read `.agents/design.md` and `.agents/TODO.md` to confirm the current milestone scope.
2. If the request is in scope, propose the smallest commit and confirm before coding. If not, surface the mismatch and ask whether to log a follow-up or extend scope.
3. Honour the brand: the wireframes file under `.brand/` is the design source of truth, brand.css is its CSS port, and primitives (`.ab`, `.box`, `.btn`, `.chip`, `.h-hand`, `.p-hand`, `.tiny-mono`, `.line`, `.stamp`) cover almost every surface.
4. Build via `pnpm build` before declaring done.

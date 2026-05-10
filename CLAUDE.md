# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Next.js 15 (App Router, React 19, Turbopack) frontend for a LiveKit voice agent. Forked from the upstream `agent-starter-react` template (note: `package.json#name` is still `agent-starter-react`) and being rebranded as the **Mahimai AI voice playground**. The user-facing wireframes and brand tokens live in `.brand/` and `styles/brand.css`; the runtime UI is still mostly the upstream LiveKit chrome.

The app pairs with a separate Python/Node LiveKit agent worker. This repo only ships the browser client and a token-mint API route.

## Commands

Package manager is **pnpm** (pinned in `package.json#packageManager`, Node 22 in CI). Do not use npm or yarn.

| Command | Purpose |
| --- | --- |
| `pnpm install` | Install dependencies. |
| `pnpm dev` | Next dev server with Turbopack on http://localhost:3000. |
| `pnpm build` | Production build (also gates CI). |
| `pnpm start` | Serve the production build. |
| `pnpm lint` | ESLint (`next/core-web-vitals` + `next/typescript` + `import/recommended` + `prettier`). |
| `pnpm format` / `pnpm format:check` | Prettier write / check. CI runs `format:check`. |
| `pnpm shadcn:install` | Re-pull every `@agents-ui/*` component from the LiveKit registry and run Prettier. The CLI prompts before overwriting locally edited files; review the diff before accepting. |

There is no test suite. CI (`.github/workflows/build-and-test.yaml`) runs `lint`, `format:check`, and `build` on push/PR to `main`.

`taskfile.yaml` exposes `task install` and `task dev` (interactive shells), used by the LiveKit Sandbox bootstrap; locally, just call `pnpm` directly.

## Required env (.env.local)

Copy `.env.example`. Required for the local token route to mint anything:

```
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_URL=wss://<project>.livekit.cloud
AGENT_NAME=                # blank = automatic dispatch; set = explicit dispatch
```

Optional sandbox/remote-config vars (also referenced by the code, only one is in `.env.example`; both are real):
- `NEXT_PUBLIC_APP_CONFIG_ENDPOINT` — when set, `lib/utils.ts#getAppConfig` fetches `AppConfig` overrides from this endpoint per request, gated by an `X-Sandbox-ID` header.
- `NEXT_PUBLIC_CONN_DETAILS_ENDPOINT` — when set, `components/app/app.tsx` switches the token source from `/api/token` to `getSandboxTokenSource()` (POSTs to that endpoint with `room_config`).
- `SANDBOX_ID` — server-side fallback when the request lacks `x-sandbox-id`.

## Architecture

### Two views, one session

`components/app/app.tsx` is the root client component. It builds a `useSession(tokenSource, ...)` hook and wraps everything in `AgentSessionProvider` (which also mounts `RoomAudioRenderer`). `view-controller.tsx` then reads `useSessionContext().isConnected` and animates between two views with `motion.create`:

- **`WelcomeView`** (not connected): single Start button that calls `session.start()`.
- **`AgentSessionView_01`** (connected): the full session UI — transcript, tile layout with audio visualizer, control bar.

`AgentSessionView_01` lives at `components/agents-ui/blocks/agent-session-view-01/components/`, and is composed of `agent-session-block.tsx` + `audio-visualizer.tsx` + `tile-view.tsx`. This block is shadcn-installed (re-pullable via `pnpm shadcn:install`), so prefer extending via Tailwind classes rather than hacking the block unless you intend to fork it permanently.

### Token sourcing

Two paths, picked at render time in `app.tsx`:

1. **Local dev:** `TokenSource.endpoint('/api/token')` → `app/api/token/route.ts` mints a 15-minute LiveKit JWT using `livekit-server-sdk`. **This route deliberately throws when `NODE_ENV !== 'development'`** — it is not safe for production. Wire your own auth, or deploy via Sandbox path before shipping.
2. **Sandbox/hosted:** when `NEXT_PUBLIC_CONN_DETAILS_ENDPOINT` is set, `getSandboxTokenSource()` (`lib/utils.ts`) POSTs `{room_config}` with `X-Sandbox-Id` to the configured endpoint and uses its response as the connection details.

### Config flow (`app-config.ts` + `lib/utils.ts`)

`AppConfig` (typed in `app-config.ts`) is the shape of every runtime knob: branding (`logo`, `accent`, `companyName`), feature toggles (`supportsChatInput`, `supportsVideoInput`, `supportsScreenShare`, `isPreConnectBufferEnabled`), agent dispatch (`agentName`), and visualizer presets (`audioVisualizerType`: `bar | wave | grid | radial | aura`, plus per-type knobs).

`getAppConfig(headers)` is a `cache()`d server function called from `app/page.tsx` and `app/layout.tsx`. If `NEXT_PUBLIC_APP_CONFIG_ENDPOINT` is set, it fetches a `SandboxConfig` (typed key/value with `{type, value}` entries), then merges into `APP_CONFIG_DEFAULTS` while enforcing that the key already exists in defaults and the primitive types match. This is what lets the LiveKit Sandbox push branding/feature flags into a deployed instance without code changes.

`getStyles(appConfig)` returns a `<style>`-injectable string that overrides `--primary` / `--primary-hover` for the light theme via `:root` and the dark theme via `.dark`. It is rendered into `<head>` from `app/layout.tsx`. So changing `accent` / `accentDark` in `app-config.ts` (or via the remote endpoint) cascades into the entire shadcn token system at runtime.

### Components layout

- `components/agents-ui/` — LiveKit `@agents-ui/*` components installed locally (`pnpm shadcn:install`). Edit in place if you must, but they will be overwritten on re-install. Prefer Tailwind class overrides on the consuming side.
- `components/ai-elements/` — Vercel AI Elements (`@ai-elements/*` registry).
- `components/app/` — app-specific composition; this is where business logic for THIS deployment goes.
- `components/ui/` — plain shadcn primitives (button, alert, etc).

`components.json` registers two shadcn registries with non-default aliases:
- utils → `@/lib/shadcn/utils`
- lib   → `@/lib/shadcn`
- registries: `@agents-ui` → `https://livekit.io/ui/r/{name}.json`, `@ai-elements` → `https://registry.ai-sdk.dev/{name}.json`

### Path alias

`@/*` resolves to the repo root (see `tsconfig.json#paths`). Use it for all internal imports (`@/components/...`, `@/lib/...`, `@/app-config`).

### Styling

- Tailwind v4 via `@tailwindcss/postcss`. Theme variables are oklch; tokens defined in `styles/globals.css` with a `.dark` variant.
- Prettier sorts imports via `@trivago/prettier-plugin-sort-imports` (order: react → next → next/* → third-party → @scoped → `@/*` → relative). It also runs `prettier-plugin-tailwindcss` to sort class names.
- `styles/brand.css` (Mahimai brand tokens: ink/paper/accent palette plus Caveat/Kalam/JetBrains Mono/Inter fonts) is **staged but not yet imported anywhere**. When you wire the brand UI, import it from `app/layout.tsx` alongside `globals.css` (or replace globals). Source of truth is `.brand/mahimai-wireframes.html`; do not hand-edit `brand.css` to add new tokens — propagate from the wireframes file.

### Dev-only globals

`hooks/useDebug.ts` (mounted by `AppSetup` in `app.tsx` with `enabled: NODE_ENV !== 'production'`) sets the LiveKit log level to `debug` and exposes the active `Room` as `window.__lk_room` for in-browser inspection.

## Local conventions and gotchas

- **No em dashes** anywhere (code, comments, prompts, docs). Use colons, periods, semicolons, or parentheses. Same rule applies to commit messages.
- Commit messages are authored as if by Mahimai: no `Co-Authored-By` trailer, no "Generated with Claude Code" footer, no robot emoji or AI attribution.
- `.agents/` and `.brand/` are **gitignored** — treat as personal scratch space; do not move source-of-truth content into them.
- The upstream README (`README.md`) and `TEMPLATE.md` describe the original `agent-starter-react` template and its sandbox flow; useful for upstream context but not the rebrand spec.
- `next.config.ts` is intentionally empty; add config sparingly.

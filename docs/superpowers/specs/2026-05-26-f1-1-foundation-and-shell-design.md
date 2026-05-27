# F1.1 — Foundation & Shell · Design

**Status:** approved 2026-05-26.
**Owner:** Mahimai.
**Implements (REQs):** REQ-AVA-VISUAL-001, REQ-AVA-NAV-001, REQ-AVA-CREDS-001, REQ-AVA-CLEAN-001, REQ-AVA-ERR-001, REQ-AVA-COOK-001 (about-page mention only).
**Source documents:**

- Refinery: [Refinery — F1 Voice Playground Visual Redesign](https://linear.app/mahimairaja/document/refinery-f1-voice-playground-visual-redesign-90a28ecbab3e)
- Blueprint: [Blueprint — F1 Voice Playground Visual Redesign](https://linear.app/mahimairaja/document/blueprint-f1-voice-playground-visual-redesign-faa668867538)

This is the first of three F1 specs. F1.2 (catalog + demo runtime) and F1.3 (agent-mount + vitals) are separate documents in this folder.

---

## 1. Scope and boundaries

**F1.1 ships:**

- A dark-theme visual system (cyan `#2DD4BF` accent, Geist + Geist Mono, near-white text on `#050507` / `#0b0b0d` surfaces) applied to every existing route.
- New `<PlaygroundHeader>` (mono breadcrumb brand, nav right, no keys indicator) and `<PlaygroundFooter>` mounted in `app/layout.tsx`.
- New `<CredentialsSheet>` right-side drawer that takes a `requiredKeys: string[]` prop and renders one masked input per key. Opened from a `<CredentialsButton>` ("Set keys · N missing") on the demo page. Closed sheet leaves the two-pane visible.
- Reshaped credentials API in `lib/credentials/`: keep the existing per-key prefix shape (`mahimai_playground:cred:<name>` — one localStorage entry per provider field; preserved for devtools transparency), add a small `useCredentials(required)` hook, expose `isReady` derived from `missingCredentials` (already in `lib/credentials/validate.ts`).
- Rebuilt `app/(marketing)/about/page.tsx` with the new "what this is" framing.
- Rebuilt `app/not-found.tsx` and new `app/maintenance/page.tsx` App Router route replacing the static `public/maintenance.html`.
- Deletion of `styles/brand.css` and the handwritten-font references; `references/*.html` demoted to "historical, do not consume."
- CLAUDE.md updated to reflect the new visual system as source of truth.
- Minimal Vitest coverage of `lib/credentials/store.ts` and `lib/credentials/schema.ts`.

**F1.1 explicitly defers (deferred to F1.2 or F1.3):**

- Landing page rebuild (REQ-LAND-001) → F1.2.
- Demos index rebuild (REQ-DEMOS-001) → F1.2.
- Demo page two-pane redesign and voice panel (REQ-DEMO-001) → F1.2.
- Client-side token mint and deletion of `app/api/token/route.ts` → F1.2.
- Manifest source pivot to GitHub Raw fetch (REQ-MOUNT-001 manifest plumbing) → F1.2.
- Agent-mount protocol pivot, registry, and surface renderers (REQ-MOUNT-001) → F1.3.
- Vitals view and latency badge (REQ-VITALS-001) → F1.3.

**Wording boundary that has caused confusion in earlier discussion:** F1.1 does not redesign the demo page itself. It only mounts the new visual chrome plus the credentials sheet onto whatever the demo page is today, so the sheet ships against real code. The current placeholder demo content (the concierge surface) stays until F1.2.

## 2. File-level architecture

### New files

| Path | Purpose |
|---|---|
| `lib/design/tokens.ts` | TS module exporting the dark + cyan palette, font stacks, spacing / radius / shadow scales. Imported by `globals.css` via a small `@theme` mirror; available to TS code if any computed-color logic ever needs it. |
| `lib/credentials/useCredentials.ts` | React hook wrapping the existing `store.ts` + `validate.ts`. Subscribes to both the native cross-tab `storage` event and the existing same-tab custom events (`mahimai-credentials-changed`, `mahimai-open-credentials-drawer`). Exposes `{ values, setKey, clearAll, isReady, missing, unavailable }`. |
| `lib/credentials/store.test.ts` | Vitest pure-module tests over the existing prefix-based store API. |
| `components/layout/PlaygroundHeader.tsx` | Sticky 56px header. Mono breadcrumb `mahimai/playground`, nav right (Demos, About, Cookbook ↗ external), active route underline. No keys indicator. |
| `components/layout/PlaygroundFooter.tsx` | License note, cookbook GitHub link, version label (from `package.json`). |
| `components/credentials/CredentialsSheet.tsx` | Right-side sheet, Radix Dialog primitive. Props `{ open, onOpenChange, requiredKeys, onSaved }`. Renders one masked input per key with reveal toggle. |
| `components/credentials/CredentialsButton.tsx` | The "Set keys · N missing" trigger on the demo page. |
| `app/maintenance/page.tsx` | App Router route replacing `public/maintenance.html`. Inherits global chrome. |
| `vitest.config.ts` | Minimal Vitest setup. No DOM, no JSX, no setup files. |
| `lib/credentials/validate.test.ts` | Vitest tests over the existing `missingCredentials` validator. |

### Edited files

| Path | Change |
|---|---|
| `app/layout.tsx` | Swap existing chrome for `<PlaygroundHeader>` and `<PlaygroundFooter>`. Mount `geist/font` (sans + mono) once. Drop the `body.clean` pre-paint `<Script>`. Force `dark` class on `<html>`. |
| `app/(marketing)/about/page.tsx` | Rewrite content. Lead column "what this is" (longer), secondary "what this isn't" (shorter, dimmer). Stack chips. Cookbook link. |
| `app/not-found.tsx` | Restyle to dark theme. Two actions (Demos / Home). No illustrations. |
| `app/error.tsx` | Restyle to match `not-found.tsx`. |
| `app/(marketing)/page.tsx` | Minimal restyle only so the page does not break under the new theme. Full hero rebuild is F1.2. |
| `app/demos/page.tsx` | Minimal restyle only. Full rebuild is F1.2. |
| `app/demos/[slug]/page.tsx` | Inject `<CredentialsButton>` and `<CredentialsSheet>` above the existing two-pane (in the page header strip, next to the demo title). Pass a page-hardcoded `requiredKeys` for the one shipping demo. The existing surface content stays. |
| `lib/credentials/store.ts` | No API changes. Re-export under the new hook surface. Keep the existing custom events. |
| `lib/credentials/validate.ts` | No API changes. The new hook calls `missingCredentials` to derive `isReady` and `missing`. |
| `components/playground/VoiceSurface.tsx` | Wire the existing Talk / Start session button's disabled state to the same `useCredentials(requiredKeys).isReady` as the new button — keeps gating consistent across the two affordances. No layout change to the voice panel itself. |
| `styles/globals.css` | Replace `:root` and `@theme inline` block with the new tokens. Drop cream / paper / handwritten primitives. |
| `package.json` | Add `geist`, `vitest`. Drop the Google Fonts imports (Caveat, Kalam, JetBrains Mono). Add `"test": "vitest run"` script. |
| `CLAUDE.md` | Rewrite the Tech-stack, Hard-constraints, and File-conventions sections to reflect new tokens, no `brand.css`, no `body.clean`, no handwritten fonts. Note `references/*.html` as historical-only. |
| `public/og-image.png` | Regenerate against the dark theme. |

### Deleted files

| Path | Why |
|---|---|
| `styles/brand.css` | Wireframe-derived primitives no longer used. |
| `components/brand/TopBar.tsx`, `components/brand/Footer.tsx`, `components/brand/Logo.tsx` (and any other entries in `components/brand/` that depend on the deleted primitives) | Replaced by `components/layout/*`. |
| `lib/mode.ts` and its `<Script>` invocation in `app/layout.tsx` | Dark-only milestone; no clean / sketchy toggle. Eliminates the dev-mode hydration warning. |
| `public/maintenance.html` | Replaced by `app/maintenance/page.tsx`. |
| `components/playground/CredentialsDrawer.tsx`, `components/playground/CredentialsBanner.tsx` (if they exist) | Replaced by `components/credentials/*`. |

### Untouched in F1.1

- `components/agents-ui/*` (upstream LiveKit shadcn registry; restyle via Tailwind class overrides on consumers in F1.2, not by editing in place).
- `app/api/token/route.ts` (deletion happens in F1.2).
- `lib/demos/*` (rewrite happens in F1.2).
- `lib/generative-ui/*` (rewrite happens in F1.3).
- `public/brand/goat.svg`, `public/favicon*` (brand identity; visuals only, not paper/handwritten).

## 3. Design tokens, fonts, chrome

### Palette

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#050507` | Page background |
| `--color-surface` | `#0b0b0d` | Cards, sheets, panels |
| `--color-surface-2` | `#0c0c10` | Inputs, secondary surfaces |
| `--color-border` | `#232327` | Standard borders |
| `--color-border-strong` | `#2a2a2f` | Hover / focus, sheet seams |
| `--color-border-dim` | `#1c1c20` | Internal dividers |
| `--color-text` | `#ededed` | Primary text |
| `--color-text-dim` | `#b5b5b9` | Secondary text |
| `--color-text-mute` | `#8a8a90` | Tertiary / mono labels |
| `--color-text-fade` | `#6a6a70` | Captions, crumbs |
| `--color-accent` | `#2DD4BF` | CTAs, live-state, active-route underline |
| `--color-accent-soft` | `color-mix(in srgb, var(--color-accent) 18%, transparent)` | Halo around live indicators |
| `--color-warning` | `#f59e0b` | Missing-key warnings, partial states |
| `--color-danger` | `#ef4444` | Connection failure, unhealthy latency |

The palette is intentionally tight: 4 neutrals + 1 accent + 2 status. Anything beyond this list needs an explicit reason in the PR.

### Type

Geist (sans) and Geist Mono only, loaded via the `geist/font` package in `app/layout.tsx`. No other web fonts. All handwritten fonts (Caveat, Kalam) and the separate JetBrains Mono load are removed.

- **Display headings** — Geist 600, letter-spacing `-0.015em`. Used for page titles and demo titles.
- **Body** — Geist 400, 13.5 to 15px.
- **Mono labels and crumbs** — Geist Mono, 10.5 to 11px, 0.06em letter-spacing, uppercase. Used for breadcrumbs, field labels, badges, tiny stats.
- **Inline code and values** — Geist Mono, accent-colored, no background.

### Radius and spacing

- Radius: 6px inputs, 8px buttons, 10px panels, 12px outer cards, 999px pills.
- Spacing scale: 4 / 6 / 10 / 14 / 18 / 22 / 28 / 36 (px). Tailwind's `space-*` aliases map onto these.

### Header

`<PlaygroundHeader>` is sticky, 56px tall, surface `--color-bg`, top and bottom hairlines `--color-border-dim`.

- Left: `mahimai/playground` mono breadcrumb. Slash dimmed `--color-text-fade`, `playground` muted `--color-text-mute`, `mahimai` strong `--color-text`. Click routes to `/`.
- Right: nav in Geist 13.5px. Items: `Demos`, `About`, `Cookbook ↗`. Active item has a 1.5px cyan underline; current route derived from `usePathname()`. `Cookbook` opens the awesome-voice-apps GitHub repo in a new tab.
- No keys indicator. The header is identical across every route.

### Footer

Single thin row separated from the page by a `--color-border-dim` hairline.

- Left: `MIT · BYO PROVIDERS` (mono 10px, `--color-text-fade`).
- Center: cookbook GitHub link (mono 10px).
- Right: version label `v0.X.Y` read from `package.json` at build time via a static import.

### Layout shell

```tsx
// app/layout.tsx
<html lang="en" className="dark">
  <body className="bg-bg text-text antialiased">
    <PlaygroundHeader />
    <main className="min-h-[calc(100dvh-56px-40px)]">
      {children}
    </main>
    <PlaygroundFooter />
  </body>
</html>
```

`dark` is always present (no system-preference auto-switch, no `body.clean` script). `geist/font` is loaded at the top of `layout.tsx`. `<main>` carries a min-height so short pages do not collapse the footer onto the header.

## 4. Credentials store and sheet

### Storage shape (kept from existing code)

One localStorage entry per provider field, with the prefix `mahimai_playground:cred:`. Examples:

- `mahimai_playground:cred:livekit_url` → `wss://your-project.livekit.cloud`
- `mahimai_playground:cred:openai_api_key` → `sk-...`

Empty values are deleted (no `""` entries). The prefix shape is intentional: every credential is a single visible row in devtools → Application → Local Storage, which matches the privacy framing ("nothing leaves the browser, audit yourself").

### Module API

`lib/credentials/store.ts` already provides this surface. F1.1 keeps it as-is:

```ts
// from lib/credentials/store.ts (existing)
export const CRED_PREFIX = 'mahimai_playground:cred:';
export const CRED_CHANGE_EVENT = 'mahimai-credentials-changed';
export const CRED_OPEN_DRAWER_EVENT = 'mahimai-open-credentials-drawer';
export type CredentialMap = Record<string, string>;

function getCredentials(): CredentialMap;
function saveCredentials(values: CredentialMap): void;
function clearAll(): void;
function isPersistAvailable(): boolean;
```

`lib/credentials/validate.ts` already provides `missingCredentials(required: string[]): string[]`. F1.1 keeps it as-is.

The new hook is a thin wrapper:

```ts
// lib/credentials/useCredentials.ts (new in F1.1)
function useCredentials(required: string[]): {
  values: CredentialMap;
  setKey: (name: string, value: string) => void;
  clearAll: () => void;
  isReady: boolean;
  missing: string[];        // missingCredentials(required)
  unavailable: boolean;     // !isPersistAvailable()
};
```

The hook subscribes to:
- the native `storage` event (cross-tab updates), and
- the existing same-tab `CRED_CHANGE_EVENT` window event (own-tab updates after `saveCredentials` / `clearAll`).

Validation is "non-empty only" — no format checks. Wrong-value errors surface from LiveKit or the agent at connect time.

### CRED_OPEN_DRAWER_EVENT integration

The existing window event `mahimai-open-credentials-drawer` lets any banner / button trigger the drawer without holding shared parent state. The new `<CredentialsSheet>` listens for this event and opens itself, so the existing missing/rejected banner pattern (if it survives F1.1) keeps working without rewiring.

### CredentialsSheet

```ts
interface CredentialsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredKeys: string[];
  onSaved?: () => void;
}
```

UX:

- Radix Dialog mounted as a right-side sheet, 56% viewport width on desktop, full-width on mobile.
- Header: single mono label `CREDENTIALS · NOTHING LEAVES YOUR BROWSER · drive-thru coffee · 6 keys`.
- Body: one stacked field per item in `requiredKeys`, in array order. Each field is a masked input with a reveal icon and a label like `openai_api_key`. Missing fields show their label in amber (`--color-warning`) with a `· missing` suffix.
- Privacy line at the bottom, mono and dim: `stored as mahimai_playground:cred:<name> entries in localStorage. clear from devtools or the button below.`
- Footer actions: `Save & close` (primary, cyan, disabled until at least one field changed) and `Clear all` (ghost, double-confirm with inline `Click again to clear` swap for 2 seconds).
- Close-X top right, Esc closes, click-outside closes. Closing without saving discards in-progress edits.

### CredentialsButton

Renders only on the demo page route. Reads `isReady(requiredKeys)`:

- All present: shows `● KEYS · READY` chip in cyan; clicking opens the sheet to edit.
- Some missing: shows `Set keys · N missing` ghost button.
- The Talk button on the demo page is disabled while `isReady === false` and tooltipped with `N keys missing`.

### Transport contract — how non-LiveKit values reach the agent

When the developer clicks Talk on a demo page (F1.2 wires this; F1.1 just stubs the path):

1. Playground reads `getStore()`.
2. LiveKit fields (`livekit_url`, `livekit_api_key`, `livekit_api_secret`) are passed to the F1.2 client-side token mint.
3. Every other key/value pair in the store is attached to the LiveKit `Room.connect()` call as **local participant attributes**. The Python agent reads them via `participant.attributes["openai_api_key"]` (etc.) on the `participant_connected` event.
4. The playground does not send the keys anywhere else. Nothing is logged. Nothing is POSTed.
5. The agent template in `awesome-voice-apps/templates/livekit-base/agent.py` must read its STT / LLM / TTS provider keys from `participant.attributes` first, falling back to its own `.env` if absent. This is a coordinated change with F0 and lives in F1.3.

F1.1 only delivers storage plus sheet UI plus the participant-attributes shape on the connect call site. F1.2 wires the actual `Room.connect()` invocation. F1.3 covers the agent-side template change in the matching `awesome-voice-apps` PR.

### The shipping demo's hardcoded required list (F1.1)

`app/demos/[slug]/page.tsx` passes:

```ts
const requiredKeys = [
  "livekit_url",
  "livekit_api_key",
  "livekit_api_secret",
  "openai_api_key",
  "deepgram_api_key",
  "cartesia_api_key",
];
```

This matches the manifest at `voice/awesome-voice-apps/demos/drive-thru-coffee/playground.json`. F1.2 replaces the hardcoded list with `manifest.required_credentials` from the GitHub Raw fetch.

### Error and edge cases

- localStorage unavailable (private mode, blocked): `getStore` returns `{}` and the hook exposes `unavailable: true`. The button reads `Storage blocked — enable site data` and is disabled.
- Quota exceeded on `setKey`: caught and surfaced as a single inline error inside the sheet.
- User has stored keys for fields that are not in `requiredKeys`: kept in the store (harmless leftover, visible via devtools).
- User saved keys for a previous demo and lands on a new one with different required keys: previously-stored values for shared providers (for example `openai_api_key`) are pre-filled. The "missing" set is computed against `requiredKeys` only.

## 5. About, 404, Maintenance

### About page

`app/(marketing)/about/page.tsx`. Two-column grid on desktop, stacked on mobile. Renders under the global chrome.

- **Lead column (left, ~60% width).** Header: "What this is." Three or four short paragraphs in Geist 15px on `--color-text-dim`.
  - Para 1: one sentence — "Voice playground is a browser surface for talking to voice agents from the awesome-voice-apps cookbook."
  - Para 2: how it works in plain language — clone the cookbook, run an agent locally with `uv run python agent.py dev`, paste your provider keys on the demo page, talk to the agent.
  - Para 3: privacy posture — nothing leaves the browser, no server-side keys, no telemetry on session content.
  - Para 4: one-line source link — "All demos live in [awesome-voice-apps ↗](https://github.com/mahimairaja/awesome-voice-apps)."
- **Secondary column (right, ~40% width).** Header in mono `// WHAT THIS ISN'T`, smaller (12.5px), `--color-text-mute`. Short list:
  - Not a hosted voice service. You bring your own LiveKit + provider accounts.
  - Not a UI editor. Agent code lives in your editor, not here.
  - Not a transcript archive. Sessions are ephemeral; close the tab and they are gone.
- **Stack strip** at the bottom, full-width below both columns. Single horizontal row of mono chips: `NEXT 15 · REACT 19 · LIVEKIT · TAILWIND v4 · TS · ZOD`. Pure status, no links.

REQ coverage: AC-CLEAN-001.2 (lead with what it is), REQ-COOK-001.3 (cookbook named and linked).

### 404 page

`app/not-found.tsx`. Single centered card on the page surface. Renders under the global chrome.

- Mono label above: `// 404 · NO ROUTE`, `--color-text-fade`, 10.5px.
- Headline: Geist 600, 28px — "That page doesn't live here."
- Body: Geist 14px, `--color-text-dim`, one sentence — "We may have moved it, or the URL is a typo. The playground keeps working."
- Two buttons in a horizontal row:
  - Primary (cyan): `→ Back to demos` → `/demos`.
  - Ghost: `Home` → `/`.
- No illustration, no stamp. Width capped at ~520px. Global header and footer remain.

REQ coverage: AC-ERR-001.1, AC-ERR-001.3, AC-ERR-001.4.

### Maintenance page

`app/maintenance/page.tsx`. App Router route. Same global chrome.

- Mono label above: `// MAINTENANCE · 503` in `--color-warning`.
- Headline: Geist 600, 28px — "Back in a minute."
- Two short paragraphs in Geist 14px on `--color-text-dim`:
  - "Playground is offline for a quick swap. No action needed on your end."
  - "The cookbook is open source and stays up while this site is down."
- One row of actions:
  - Primary (cyan): `→ View the cookbook` (new tab to awesome-voice-apps).
  - Ghost: `hello@mahimai.ca` (mailto).
- Metadata: `robots: 'noindex,nofollow'`.
- Width capped at ~520px, vertically centered.

**Triggering maintenance.** F1.1 does not add an auto-rewrite to `vercel.json`. The route exists and is reachable by direct URL. A future ops PR can add a Vercel rewrite from `/(.*)` to `/maintenance` when the team flips a maintenance flag. F1.1 only ships the dark-themed page so a manual rewrite has something to land on.

REQ coverage: AC-ERR-001.2 (cookbook link explicit), AC-ERR-001.3 (header preserved), AC-ERR-001.4 (dark theme consistent).

`public/maintenance.html` is removed in the same commit.

## 6. Testing and verification

### Automated (added in F1.1)

- **Vitest** added as a devDependency. Single `vitest.config.ts`, no DOM, no JSX, no setup files. New `pnpm test` script runs it. CI gets a new `pnpm test` step after lint.
- `lib/credentials/store.test.ts` — covers: empty store returns `{}`; `saveCredentials` round-trip; trim plus empty-delete; `clearAll` wipes every prefixed entry; `isPersistAvailable()` correctness; non-prefixed localStorage entries are ignored.
- `lib/credentials/validate.test.ts` — covers: `missingCredentials([])` returns `[]`; `missingCredentials([...])` against an empty store returns the full required list; against a complete store returns `[]`; against a partial store returns only the missing names; ignores extraneous keys in storage.

No RTL. No Playwright in CI. No visual-regression infra in F1.1.

### Manual (per PR)

- `pnpm build` + `pnpm lint` + `pnpm format:check` clean (existing CI plus the new `pnpm test`).
- Run `pnpm dev`. Walk every route under the new theme using the Playwright MCP loop:
  - `/`, `/about`, `/demos`, `/demos/drive-thru-coffee` (idle, sheet open, sheet closed with keys filled, sheet closed with keys missing), an unknown route to trigger the 404, `/maintenance`.
  - Save screenshots under `screenshots/F1.1/`.
- Lighthouse on `/` against the new theme. Targets: Performance ≥ 90, Accessibility ≥ 95. Numbers recorded in the PR description. Not gated by CI yet.
- Devtools verification: open Application → Local Storage, confirm `mahimai_playground:cred` is the only key the playground writes; toggle Clear-all in the sheet and confirm the key disappears.

### Non-goals for F1.1

- No end-to-end voice session test (no agent worker in CI).
- No participant-attribute round-trip test (transport contract ships in F1.2; F1.1 only stores values).
- No visual-regression snapshots (revisit in F1.3).

## 7. Dependencies and out-of-scope reminders

- New dependencies: `geist` (font package), `vitest` (devDependency only).
- Dropped dependencies: none required for F1.1 (Caveat / Kalam are loaded via `<link>` tags in `app/layout.tsx`, not package deps; removing the `<link>` is enough).
- No backend changes. No env-var changes. `app/api/token/route.ts` stays as-is until F1.2.
- No `vercel.json` changes in F1.1.

## 8. Open questions

None. Decisions resolved in the brainstorming pass:

- Accent: cyan `#2DD4BF`.
- Header: mono breadcrumb, nav right, no keys indicator.
- Credentials drawer: per-demo right-side sheet, dynamic field list from a `requiredKeys` prop, value transport via participant attributes (F1.2 wires).
- Brand assets: delete `styles/brand.css`, regenerate `og-image.png`, update CLAUDE.md hard constraints. Favicon and `goat.svg` stay.
- Three-doc slicing of F1: F1.1 (Foundation & Shell), F1.2 (Catalog & demo runtime), F1.3 (Agent-mount + observability).

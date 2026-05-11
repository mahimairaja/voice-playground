# Mahimai AI playground

A Next.js 15 frontend that lets visitors talk to the voice agents catalogued in [`awesome-voice-apps`](https://github.com/mahimailabs/awesome-voice-apps). Production at `playground.mahimai.ca`.

Visitors bring their own provider keys (OpenAI, Deepgram, Cartesia, LiveKit), paste them into a credentials drawer, and the playground mints a short-lived LiveKit token in their browser. No keys are ever logged or persisted server-side.

## What this repo ships

- A brand-faithful marketing surface (landing, demos index, per-demo page, about) using the wireframe primitives sourced from `.brand/mahimai-wireframes.html`.
- A bring-your-own-keys credentials store, drawer, and missing/rejected banner.
- A LiveKit voice surface composed from `@agents-ui/*` components, with a live transcript that toggles without disrupting the call.
- A generative UI dispatcher (Zustand store + `RoomEvent.DataReceived` listener) so demo-side agents can mount, update, and unmount React components on a canvas as the call progresses.

The agent worker (Python, `livekit-agents 1.x`) lives in the sister repo `awesome-voice-apps`. This repo only ships the visitor-side client.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

The marketing surfaces (`/`, `/about`, `/demos`) render with no env vars.

For a live voice call, you also need:

1. A demo manifest at `../awesome-voice-apps/demos/<slug>/playground.json` (so `getAllDemos()` lists it).
2. Provider keys (OpenAI, Deepgram, Cartesia) and a LiveKit URL/key/secret pasted into the credentials drawer.
3. The Python agent worker running locally and joining the same room.

The token route at `app/api/token/route.ts` is the only server-side code; it reads the visitor's pasted LiveKit credentials from the request body and signs a 1 h AccessToken. Nothing is logged or persisted.

## Configuration

Optional env vars (`.env.local`):

```env
NEXT_PUBLIC_SITE_URL=https://playground.mahimai.ca
```

`NEXT_PUBLIC_SITE_URL` sets `metadataBase` for the OG and Twitter card preview URLs. Defaults to `http://localhost:3000` when unset.

## Architecture at a glance

```
app/
├── (marketing)/           Landing and About pages
├── demos/
│   ├── page.tsx           Demos index with category filter
│   └── [slug]/page.tsx    Per-demo page (CredentialsDrawer + VoiceSurface + Canvas)
├── api/token/route.ts     Visitor BYO-keys token mint
├── error.tsx              Brand-styled route error boundary
├── not-found.tsx          Brand-styled 404
└── layout.tsx             Brand chrome (TopBar, Footer, ThemeProvider)

components/
├── brand/                 Logo, TopBar, Footer (mascot, dot/wordmark/tag, status row)
├── playground/            CredentialsDrawer, CredentialsBanner, VoiceSurface, Transcript
├── generative/Canvas.tsx  Reads the dispatcher store, renders via the registry
├── demos/                 (M2) per-demo bundles: components/demos/<slug>/index.ts
├── agents-ui/             Upstream @agents-ui/* registry (re-pullable, prefer overrides)
└── ui/                    Shadcn primitives (button, alert, etc.)

lib/
├── demos/                 Build-time manifest loader (server-only) + zod schema
├── credentials/           localStorage store + optional async provider ping
├── generative-ui/         protocol.ts (zod envelope) + registry.ts + dispatcher.ts (zustand)
├── theme.ts, mode.ts      Typed wrappers around next-themes + sketchy/clean toggle
└── utils.ts               Server config + sandbox token source

styles/
├── brand.css              Verbatim port of .brand/mahimai-wireframes.html (do not edit)
└── globals.css            Tailwind v4 @theme tokens + dark-mode bridge to brand vars
```

`CLAUDE.md` is the operating manual for any Claude Code session in this repo.
`CONTRIBUTING.md` documents the per-demo bundle authoring workflow.

## Deployment

Production deploys to Vercel (Hobby tier) at `playground.mahimai.ca`.

### DNS

Point a CNAME on the `playground` subdomain to Vercel:

| Type  | Host       | Target                | TTL  |
| ----- | ---------- | --------------------- | ---- |
| CNAME | playground | cname.vercel-dns.com. | 3600 |

After the record propagates (usually under five minutes for a CNAME at the registrar level), add `playground.mahimai.ca` as a custom domain inside the Vercel project. Vercel issues the TLS certificate automatically.

> **TODO:** Mahimai owns the actual DNS edit at the registrar (Cloudflare or wherever `mahimai.ca` is hosted). The Ralph loop cannot place this record; it can only document the contract.

### CI

CI is configured in `.github/workflows/`. The required GitHub repository secrets for production deploy:

- `VERCEL_TOKEN` (account- or project-scoped token from Vercel settings)
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Vercel pins the production function runtime to Node 20 via `package.json#engines.node`. The framework field in `vercel.json` is set so Vercel auto-detects the Next.js build pipeline.

## Project context

- **Refinery (REQ-AVA-PLAY-001 to 006):** [https://linear.app/mahimairaja/document/m1-playground-v1-refinery-e54e5fb0c21d](https://linear.app/mahimairaja/document/m1-playground-v1-refinery-e54e5fb0c21d)
- **Foundry Blueprint (Implementation items 1 to 37):** [https://linear.app/mahimairaja/document/m1-playground-v1-foundry-blueprint-81ab5a0bd72b](https://linear.app/mahimairaja/document/m1-playground-v1-foundry-blueprint-81ab5a0bd72b)
- **Project hub:** [https://linear.app/mahimairaja/project/awesome-voice-apps-1fa19b5f36d2](https://linear.app/mahimairaja/project/awesome-voice-apps-1fa19b5f36d2)
- **Sister repo:** [`awesome-voice-apps`](https://github.com/mahimailabs/awesome-voice-apps) (the voice agents catalogue)

## License

MIT. See `LICENSE`.

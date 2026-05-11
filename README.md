# voice playground

A standalone Next.js 15 UI for the voice agents catalogued in [`awesome-voice-apps`](https://github.com/mahimailabs/awesome-voice-apps). Pick a demo, paste your provider keys, talk to it in your browser, watch the agent mount UI on the canvas.

Visitors bring their own provider keys (OpenAI, Deepgram, Cartesia, LiveKit). The keys live only in the visitor's localStorage. The playground mints a short-lived LiveKit token in their browser. No keys are logged or persisted server-side.

## What this repo ships

- A marketing surface (landing, demos index, per-demo page, about) styled as an ink-on-paper field manual with the brand wireframe primitives.
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
NEXT_PUBLIC_SITE_URL=https://your-playground-domain.example.com
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
├── demos/                 Per-demo bundles: components/demos/<slug>/index.ts
├── agents-ui/             Upstream @agents-ui/* registry (re-pullable, prefer overrides)
└── ui/                    Shadcn primitives (button, alert, etc.)

lib/
├── demos/                 Build-time manifest loader (server-only) + zod schema
├── credentials/           localStorage store (voice_playground: namespace) + optional ping
├── generative-ui/         protocol.ts (zod envelope) + registry.ts + dispatcher.ts (zustand)
├── theme.ts, mode.ts      Typed wrappers around next-themes + sketchy/clean toggle
└── utils.ts               Server config + sandbox token source

styles/
├── brand.css              Verbatim port of the brand wireframes (do not edit)
└── globals.css            Tailwind v4 @theme tokens + dark-mode bridge to brand vars
```

`CLAUDE.md` is the operating manual for any Claude Code session in this repo.
`CONTRIBUTING.md` documents the per-demo bundle authoring workflow.

## Deployment

Production deploys to Vercel. Set the production domain inside the Vercel project; the framework is auto-detected via `vercel.json`.

### CI

CI is configured in `.github/workflows/`. The required GitHub repository secrets for production deploy:

- `VERCEL_TOKEN` (account- or project-scoped token from Vercel settings)
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Vercel pins the production function runtime to Node 20 via `package.json#engines.node`. The framework field in `vercel.json` is set so Vercel auto-detects the Next.js build pipeline.

## Repos

- **This playground:** [`mahimairaja/voice-playground`](https://github.com/mahimairaja/voice-playground)
- **Agents catalogue:** [`mahimailabs/awesome-voice-apps`](https://github.com/mahimailabs/awesome-voice-apps)

## License

MIT. See `LICENSE`.

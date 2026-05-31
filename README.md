<div align="center">

# voice playground

Talk to a voice agent in your browser. Not a brochure.
The frontend for the agents in [awesome-voice-apps](https://github.com/mahimairaja/awesome-voice-apps), live at [playground.mahimai.ca](https://playground.mahimai.ca).

[live](https://playground.mahimai.ca) · [cookbook](https://github.com/mahimairaja/awesome-voice-apps) · [license](LICENSE)

</div>

Bring your own LiveKit project, paste the three values into the credentials vault, and the playground mints a short-lived token in the browser and joins the room. Nothing leaves the browser: no server, no stored keys, no transcript persistence. Provider keys (OpenAI, Deepgram, Cartesia) stay in the agent's own `.env` on your machine.

## Develop

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

The landing and about pages render with no keys. A live call also needs the matching Python agent running locally (from the cookbook) and your three LiveKit values pasted into the vault.

```bash
pnpm lint
pnpm test           # vitest, pure modules only
pnpm build
```

## How it works

- **No backend.** The LiveKit token is signed in the browser with [`jose`](https://github.com/panva/jose) from the visitor's pasted key and secret. No token route, no server-side state.
- **Catalog at runtime.** The demo list is fetched from the cookbook's [`catalog.json`](https://github.com/mahimairaja/awesome-voice-apps/blob/main/catalog.json) on GitHub Raw with a five-minute cache, so a new demo appears without a redeploy.
- **Generative UI.** An agent draws on screen by publishing JSON envelopes on the LiveKit data channel under topic `ui`. The playground renders them from a fixed component vocabulary, so a new demo needs no change here. The vocabulary lives in the cookbook's [`docs/playground-components.md`](https://github.com/mahimairaja/awesome-voice-apps/blob/main/docs/playground-components.md).

Stack: Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, zustand for the generative-UI store, zod for the catalog and event schemas. Dark only. Deployed on Vercel.

The agent worker (Python, LiveKit Agents) lives in the cookbook, not here. This repo is the visitor-side client.

## License

[MIT](LICENSE). Built by [Mahimai Raja](https://mahimai.dev) at [Mahimai AI](https://mahimai.ca).

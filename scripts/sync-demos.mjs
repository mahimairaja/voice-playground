#!/usr/bin/env node
// Clone (or reuse) the sibling 'awesome-voice-apps' repo so 'lib/demos/index.ts'
// can read demo manifests at build time.
//
// Wiring: 'package.json#scripts' has 'prebuild' pointing at this file, so
// 'pnpm build' (and Vercel's build step) runs it automatically. The script
// is plain Node 20 ESM; no devDeps.
//
// Behavior:
//   - On Vercel ('process.env.VERCEL === "1"'): always rm + clone, because
//     the Vercel build cache reuses the workspace across deploys and a stale
//     clone would silently freeze the catalogue.
//   - Locally with no sibling: clone shallow.
//   - Locally with a sibling already present: skip (developer workflow).
//
// Configurable env:
//   AVA_REPO  default 'https://github.com/mahimailabs/awesome-voice-apps.git'
//   AVA_REF   default 'main'
//
// Exit code is non-zero only on actual clone failure. "Already exists"
// is not an error.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.AVA_REPO ?? 'https://github.com/mahimailabs/awesome-voice-apps.git';
const REF = process.env.AVA_REF ?? 'main';
const TARGET = path.resolve(process.cwd(), '..', 'awesome-voice-apps');
const IS_VERCEL = process.env.VERCEL === '1';

function log(message) {
  console.log(`[sync-demos] ${message}`);
}

function clone() {
  log(`cloning ${REPO}#${REF} into ${TARGET}`);
  execFileSync('git', ['clone', '--depth', '1', '--branch', REF, REPO, TARGET], {
    stdio: 'inherit',
  });
}

function main() {
  const exists = fs.existsSync(TARGET);

  if (IS_VERCEL) {
    if (exists) {
      log(`vercel build: removing stale ${TARGET}`);
      fs.rmSync(TARGET, { recursive: true, force: true });
    }
    clone();
    return;
  }

  if (!exists) {
    log(`local build: sibling not present, cloning`);
    clone();
    return;
  }

  log(`reusing local sibling at ${TARGET}`);
}

try {
  main();
} catch (err) {
  console.error(`[sync-demos] clone failed: ${err.message ?? err}`);
  process.exit(1);
}

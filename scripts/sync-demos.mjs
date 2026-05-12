#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const REPO = process.env.AVA_REPO ?? 'https://github.com/mahimairaja/awesome-voice-apps.git';
const REF = process.env.AVA_REF ?? 'main';
const TARGET = path.resolve(process.cwd(), '..', 'awesome-voice-apps');
const IS_VERCEL = process.env.VERCEL === '1';
const IS_STRICT = process.env.AVA_SYNC_STRICT === '1';

function log(message) {
  console.log(`[sync-demos] ${message}`);
}

function clone() {
  log(`cloning ${REPO}#${REF} into ${TARGET}`);
  execFileSync('git', ['clone', '--depth', '1', '--branch', REF, REPO, TARGET], {
    stdio: 'inherit',
  });
}

function warnAndContinue(err) {
  const message = err instanceof Error ? err.message : String(err);
  console.warn(`[sync-demos] clone failed: ${message}`);
  console.warn(
    '[sync-demos] continuing without sibling manifests; reference seed data will render'
  );
  if (IS_STRICT) process.exit(1);
}

try {
  const exists = fs.existsSync(TARGET);

  if (IS_VERCEL) {
    if (exists) {
      log(`vercel build: removing stale ${TARGET}`);
      fs.rmSync(TARGET, { recursive: true, force: true });
    }
    clone();
  } else if (!exists) {
    log('local build: sibling not present, cloning');
    clone();
  } else {
    log(`reusing local sibling at ${TARGET}`);
  }
} catch (err) {
  warnAndContinue(err);
}
